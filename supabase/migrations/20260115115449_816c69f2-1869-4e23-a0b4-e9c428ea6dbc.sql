-- Create email_settings table for storing email configuration
CREATE TABLE public.email_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_email TEXT NOT NULL DEFAULT 'info@csua.biz.ua',
  sender_name TEXT NOT NULL DEFAULT 'CSUA',
  sender_email TEXT NOT NULL DEFAULT 'onboarding@resend.dev',
  notify_admin BOOLEAN NOT NULL DEFAULT true,
  notify_client BOOLEAN NOT NULL DEFAULT true,
  admin_subject_uk TEXT NOT NULL DEFAULT 'Нова заявка з сайту',
  admin_subject_en TEXT NOT NULL DEFAULT 'New contact form submission',
  client_subject_uk TEXT NOT NULL DEFAULT 'Ваш запит отримано',
  client_subject_en TEXT NOT NULL DEFAULT 'Your request has been received',
  client_message_uk TEXT NOT NULL DEFAULT 'Дякуємо за звернення! Ми отримали ваш запит і зв''яжемось з вами найближчим часом.',
  client_message_en TEXT NOT NULL DEFAULT 'Thank you for contacting us! We have received your request and will get back to you as soon as possible.',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can view email settings
CREATE POLICY "Admins can view email settings"
ON public.email_settings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update email settings
CREATE POLICY "Admins can update email settings"
ON public.email_settings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can insert email settings
CREATE POLICY "Admins can insert email settings"
ON public.email_settings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Insert default settings
INSERT INTO public.email_settings (admin_email, sender_name, sender_email)
VALUES ('info@csua.biz.ua', 'CSUA', 'onboarding@resend.dev');

-- Create contact_submissions table to store form submissions
CREATE TABLE public.contact_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  admin_notified BOOLEAN DEFAULT false,
  client_notified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- Only admins can view submissions
CREATE POLICY "Admins can view contact submissions"
ON public.contact_submissions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Only admins can update submissions
CREATE POLICY "Admins can update contact submissions"
ON public.contact_submissions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_roles.user_id = auth.uid()
    AND user_roles.role = 'admin'
  )
);

-- Anyone can insert submissions (public form)
CREATE POLICY "Anyone can insert contact submissions"
ON public.contact_submissions
FOR INSERT
WITH CHECK (true);