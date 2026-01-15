import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactEmailRequest {
  name: string;
  email: string;
  phone?: string;
  message: string;
  language: string;
}

interface ResendEmailResponse {
  id?: string;
  error?: { message: string };
}

async function sendResendEmail(
  apiKey: string,
  from: string,
  to: string[],
  subject: string,
  html: string
): Promise<ResendEmailResponse> {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || "Failed to send email");
  }
  
  return data;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { name, email, phone, message, language }: ContactEmailRequest = await req.json();

    // Get email settings
    const { data: settings, error: settingsError } = await supabase
      .from('email_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error("Error fetching email settings:", settingsError);
      throw new Error("Failed to fetch email settings");
    }

    // Save submission to database
    const { data: submission, error: submissionError } = await supabase
      .from('contact_submissions')
      .insert({
        name,
        email,
        phone,
        message,
        status: 'new'
      })
      .select()
      .single();

    if (submissionError) {
      console.error("Error saving submission:", submissionError);
      throw new Error("Failed to save submission");
    }

    const results = {
      adminEmail: { success: false, error: null as string | null },
      clientEmail: { success: false, error: null as string | null }
    };

    // Send email to admin
    if (settings.notify_admin) {
      try {
        const adminSubject = language === 'uk' ? settings.admin_subject_uk : settings.admin_subject_en;
        
        const adminHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">${language === 'uk' ? 'Нова заявка з сайту' : 'New Contact Form Submission'}</h2>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>${language === 'uk' ? "Ім'я:" : 'Name:'}</strong> ${name}</p>
              <p><strong>Email:</strong> ${email}</p>
              ${phone ? `<p><strong>${language === 'uk' ? 'Телефон:' : 'Phone:'}</strong> ${phone}</p>` : ''}
              <p><strong>${language === 'uk' ? 'Повідомлення:' : 'Message:'}</strong></p>
              <p style="white-space: pre-wrap; background: white; padding: 15px; border-radius: 4px;">${message}</p>
            </div>
            <p style="color: #64748b; font-size: 12px;">
              ${language === 'uk' ? 'Відправлено:' : 'Sent at:'} ${new Date().toLocaleString(language === 'uk' ? 'uk-UA' : 'en-US')}
            </p>
          </div>
        `;

        const adminEmailResponse = await sendResendEmail(
          resendApiKey,
          `${settings.sender_name} <${settings.sender_email}>`,
          [settings.admin_email],
          adminSubject,
          adminHtml
        );

        console.log("Admin email sent:", adminEmailResponse);
        results.adminEmail.success = true;

        // Update submission
        await supabase
          .from('contact_submissions')
          .update({ admin_notified: true })
          .eq('id', submission.id);

      } catch (adminError: any) {
        console.error("Error sending admin email:", adminError);
        results.adminEmail.error = adminError.message;
      }
    }

    // Send confirmation email to client
    if (settings.notify_client) {
      try {
        const clientSubject = language === 'uk' ? settings.client_subject_uk : settings.client_subject_en;
        const clientMessage = language === 'uk' ? settings.client_message_uk : settings.client_message_en;

        const clientHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af;">${language === 'uk' ? `Вітаємо, ${name}!` : `Hello, ${name}!`}</h2>
            <p style="font-size: 16px; line-height: 1.6;">${clientMessage}</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>${language === 'uk' ? 'Ваше повідомлення:' : 'Your message:'}</strong></p>
              <p style="white-space: pre-wrap; color: #64748b;">${message}</p>
            </div>
            <p style="margin-top: 30px;">
              ${language === 'uk' ? 'З повагою,' : 'Best regards,'}<br>
              <strong>${settings.sender_name}</strong>
            </p>
          </div>
        `;

        const clientEmailResponse = await sendResendEmail(
          resendApiKey,
          `${settings.sender_name} <${settings.sender_email}>`,
          [email],
          clientSubject,
          clientHtml
        );

        console.log("Client email sent:", clientEmailResponse);
        results.clientEmail.success = true;

        // Update submission
        await supabase
          .from('contact_submissions')
          .update({ client_notified: true })
          .eq('id', submission.id);

      } catch (clientError: any) {
        console.error("Error sending client email:", clientError);
        results.clientEmail.error = clientError.message;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        submissionId: submission.id,
        results
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
