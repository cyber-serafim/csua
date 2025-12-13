-- Table for storing IP information and geolocation
CREATE TABLE public.ip_info (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_address TEXT NOT NULL UNIQUE,
    country TEXT,
    country_code TEXT,
    region TEXT,
    city TEXT,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    isp TEXT,
    org TEXT,
    is_vpn BOOLEAN DEFAULT false,
    is_proxy BOOLEAN DEFAULT false,
    is_tor BOOLEAN DEFAULT false,
    is_datacenter BOOLEAN DEFAULT false,
    connection_type TEXT, -- residential, datacenter, vpn, proxy, tor
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing visitor sessions
CREATE TABLE public.visitor_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    ip_info_id UUID REFERENCES public.ip_info(id),
    user_agent TEXT,
    browser TEXT,
    os TEXT,
    device_type TEXT, -- mobile, tablet, desktop
    first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    last_visit_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    total_visits INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for storing page views
CREATE TABLE public.page_views (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID REFERENCES public.visitor_sessions(id) ON DELETE CASCADE,
    page_url TEXT NOT NULL,
    page_path TEXT NOT NULL,
    referer TEXT,
    entered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    exited_at TIMESTAMP WITH TIME ZONE,
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table for daily aggregated statistics
CREATE TABLE public.daily_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL UNIQUE,
    total_visits INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    total_page_views INTEGER DEFAULT 0,
    vpn_visits INTEGER DEFAULT 0,
    proxy_visits INTEGER DEFAULT 0,
    avg_session_duration INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_ip_info_ip ON public.ip_info(ip_address);
CREATE INDEX idx_ip_info_country ON public.ip_info(country_code);
CREATE INDEX idx_ip_info_connection_type ON public.ip_info(connection_type);
CREATE INDEX idx_visitor_sessions_session ON public.visitor_sessions(session_id);
CREATE INDEX idx_visitor_sessions_ip ON public.visitor_sessions(ip_info_id);
CREATE INDEX idx_visitor_sessions_first_visit ON public.visitor_sessions(first_visit_at);
CREATE INDEX idx_page_views_session ON public.page_views(session_id);
CREATE INDEX idx_page_views_entered ON public.page_views(entered_at);
CREATE INDEX idx_page_views_path ON public.page_views(page_path);
CREATE INDEX idx_daily_stats_date ON public.daily_stats(date);

-- Enable RLS
ALTER TABLE public.ip_info ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Only admins can view all analytics data
CREATE POLICY "Admins can manage ip_info"
ON public.ip_info
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage visitor_sessions"
ON public.visitor_sessions
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage page_views"
ON public.page_views
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage daily_stats"
ON public.daily_stats
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updating updated_at
CREATE TRIGGER update_ip_info_updated_at
BEFORE UPDATE ON public.ip_info
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at
BEFORE UPDATE ON public.daily_stats
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();