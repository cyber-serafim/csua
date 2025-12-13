import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VisitData {
  sessionId: string;
  pageUrl: string;
  pagePath: string;
  referer?: string;
  userAgent: string;
  action: 'enter' | 'exit';
  pageViewId?: string;
  duration?: number;
}

interface IPInfoResponse {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  privacy?: {
    vpn?: boolean;
    proxy?: boolean;
    tor?: boolean;
    hosting?: boolean;
  };
}

function parseUserAgent(userAgent: string) {
  let browser = 'Unknown';
  let os = 'Unknown';
  let deviceType = 'desktop';

  // Detect browser
  if (userAgent.includes('Firefox')) browser = 'Firefox';
  else if (userAgent.includes('Edg')) browser = 'Edge';
  else if (userAgent.includes('Chrome')) browser = 'Chrome';
  else if (userAgent.includes('Safari')) browser = 'Safari';
  else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

  // Detect OS
  if (userAgent.includes('Windows')) os = 'Windows';
  else if (userAgent.includes('Mac OS')) os = 'macOS';
  else if (userAgent.includes('Linux')) os = 'Linux';
  else if (userAgent.includes('Android')) os = 'Android';
  else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) os = 'iOS';

  // Detect device type
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) deviceType = 'mobile';
  else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) deviceType = 'tablet';

  return { browser, os, deviceType };
}

function getConnectionType(privacy?: IPInfoResponse['privacy']): string {
  if (!privacy) return 'residential';
  if (privacy.tor) return 'tor';
  if (privacy.vpn) return 'vpn';
  if (privacy.proxy) return 'proxy';
  if (privacy.hosting) return 'datacenter';
  return 'residential';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const ipInfoToken = Deno.env.get('IPINFO_API_KEY');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get client IP from headers
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    const visitData: VisitData = await req.json();
    const { sessionId, pageUrl, pagePath, referer, userAgent, action, pageViewId, duration } = visitData;

    console.log(`[track-visit] Action: ${action}, Session: ${sessionId}, Path: ${pagePath}, IP: ${clientIP}`);

    if (action === 'exit' && pageViewId) {
      // Update page view with exit time and duration
      const { error: updateError } = await supabase
        .from('page_views')
        .update({
          exited_at: new Date().toISOString(),
          duration_seconds: duration || 0,
        })
        .eq('id', pageViewId);

      if (updateError) {
        console.error('[track-visit] Error updating page view:', updateError);
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For 'enter' action, process the full flow
    let ipInfoId: string | null = null;

    // Check if we already have IP info
    const { data: existingIpInfo } = await supabase
      .from('ip_info')
      .select('id')
      .eq('ip_address', clientIP)
      .maybeSingle();

    if (existingIpInfo) {
      ipInfoId = existingIpInfo.id;
    } else if (clientIP !== 'unknown' && ipInfoToken) {
      // Fetch IP info from IPInfo.io
      try {
        const ipInfoResponse = await fetch(`https://ipinfo.io/${clientIP}?token=${ipInfoToken}`);
        if (ipInfoResponse.ok) {
          const ipData: IPInfoResponse = await ipInfoResponse.json();
          
          let latitude: number | null = null;
          let longitude: number | null = null;
          if (ipData.loc) {
            const [lat, lng] = ipData.loc.split(',').map(Number);
            latitude = lat;
            longitude = lng;
          }

          const countryCode = ipData.country || null;
          const connectionType = getConnectionType(ipData.privacy);

          const { data: newIpInfo, error: ipInsertError } = await supabase
            .from('ip_info')
            .insert({
              ip_address: clientIP,
              country: countryCode,
              country_code: countryCode,
              region: ipData.region || null,
              city: ipData.city || null,
              latitude,
              longitude,
              isp: ipData.org || null,
              org: ipData.org || null,
              is_vpn: ipData.privacy?.vpn || false,
              is_proxy: ipData.privacy?.proxy || false,
              is_tor: ipData.privacy?.tor || false,
              is_datacenter: ipData.privacy?.hosting || false,
              connection_type: connectionType,
            })
            .select('id')
            .single();

          if (!ipInsertError && newIpInfo) {
            ipInfoId = newIpInfo.id;
          } else {
            console.error('[track-visit] Error inserting IP info:', ipInsertError);
          }
        }
      } catch (ipError) {
        console.error('[track-visit] Error fetching IP info:', ipError);
      }
    }

    // Parse user agent
    const { browser, os, deviceType } = parseUserAgent(userAgent);

    // Check if session exists
    const { data: existingSession } = await supabase
      .from('visitor_sessions')
      .select('id, total_visits')
      .eq('session_id', sessionId)
      .maybeSingle();

    let dbSessionId: string;

    if (existingSession) {
      dbSessionId = existingSession.id;
      // Update last visit
      await supabase
        .from('visitor_sessions')
        .update({
          last_visit_at: new Date().toISOString(),
          total_visits: (existingSession.total_visits || 1) + 1,
        })
        .eq('id', existingSession.id);
    } else {
      // Create new session
      const { data: newSession, error: sessionError } = await supabase
        .from('visitor_sessions')
        .insert({
          session_id: sessionId,
          ip_info_id: ipInfoId,
          user_agent: userAgent,
          browser,
          os,
          device_type: deviceType,
        })
        .select('id')
        .single();

      if (sessionError || !newSession) {
        console.error('[track-visit] Error creating session:', sessionError);
        return new Response(JSON.stringify({ error: 'Failed to create session' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      dbSessionId = newSession.id;
    }

    // Create page view
    const { data: pageView, error: pageViewError } = await supabase
      .from('page_views')
      .insert({
        session_id: dbSessionId,
        page_url: pageUrl,
        page_path: pagePath,
        referer: referer || null,
      })
      .select('id')
      .single();

    if (pageViewError) {
      console.error('[track-visit] Error creating page view:', pageViewError);
    }

    // Update daily stats
    const today = new Date().toISOString().split('T')[0];
    const { data: existingStats } = await supabase
      .from('daily_stats')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (existingStats) {
      await supabase
        .from('daily_stats')
        .update({
          total_visits: existingStats.total_visits + 1,
          total_page_views: existingStats.total_page_views + 1,
        })
        .eq('id', existingStats.id);
    } else {
      await supabase
        .from('daily_stats')
        .insert({
          date: today,
          total_visits: 1,
          total_page_views: 1,
        });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      pageViewId: pageView?.id 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[track-visit] Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});