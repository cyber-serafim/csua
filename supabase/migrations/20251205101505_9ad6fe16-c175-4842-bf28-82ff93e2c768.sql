-- Create services table
CREATE TABLE public.services (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    icon_name text NOT NULL DEFAULT 'Briefcase',
    sort_order integer NOT NULL DEFAULT 0,
    is_active boolean NOT NULL DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);

-- Create services translations table
CREATE TABLE public.service_translations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
    language text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    UNIQUE(service_id, language)
);

-- Enable RLS
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_translations ENABLE ROW LEVEL SECURITY;

-- RLS policies for services
CREATE POLICY "Admins can manage services"
ON public.services
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view active services"
ON public.services
FOR SELECT
USING (is_active = true);

-- RLS policies for service_translations
CREATE POLICY "Admins can manage service translations"
ON public.service_translations
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view translations of active services"
ON public.service_translations
FOR SELECT
USING (EXISTS (
    SELECT 1 FROM public.services
    WHERE services.id = service_translations.service_id
    AND services.is_active = true
));

-- Trigger for updated_at
CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_service_translations_updated_at
BEFORE UPDATE ON public.service_translations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default services
INSERT INTO public.services (id, icon_name, sort_order) VALUES
    ('11111111-1111-1111-1111-111111111101', 'Code', 1),
    ('11111111-1111-1111-1111-111111111102', 'Server', 2),
    ('11111111-1111-1111-1111-111111111103', 'Shield', 3),
    ('11111111-1111-1111-1111-111111111104', 'Zap', 4),
    ('11111111-1111-1111-1111-111111111105', 'Cloud', 5),
    ('11111111-1111-1111-1111-111111111106', 'Database', 6),
    ('11111111-1111-1111-1111-111111111107', 'Lock', 7),
    ('11111111-1111-1111-1111-111111111108', 'Smartphone', 8),
    ('11111111-1111-1111-1111-111111111109', 'FileSearch', 9),
    ('11111111-1111-1111-1111-111111111110', 'Camera', 10),
    ('11111111-1111-1111-1111-111111111111', 'DoorOpen', 11),
    ('11111111-1111-1111-1111-111111111112', 'Bell', 12);

-- Insert Ukrainian translations
INSERT INTO public.service_translations (service_id, language, title, description) VALUES
    ('11111111-1111-1111-1111-111111111101', 'uk', 'Веб-розробка', 'Розробка сучасних, швидких та надійних веб-додатків з використанням новітніх технологій. Від простих лендінгів до складних корпоративних систем.'),
    ('11111111-1111-1111-1111-111111111102', 'uk', 'Серверні рішення', 'Налаштування, підтримка та оптимізація серверної інфраструктури. Забезпечуємо надійну роботу ваших систем 24/7.'),
    ('11111111-1111-1111-1111-111111111103', 'uk', 'Кібербезпека', 'Комплексний захист ваших даних та систем від кіберзагроз. Аудит безпеки, впровадження захисних механізмів та моніторинг.'),
    ('11111111-1111-1111-1111-111111111104', 'uk', 'Оптимізація продуктивності', 'Аналіз та покращення швидкодії ваших додатків та систем. Підвищуємо ефективність та знижуємо витрати на інфраструктуру.'),
    ('11111111-1111-1111-1111-111111111105', 'uk', 'Хмарні рішення', 'Міграція в хмару, налаштування хмарної інфраструктури. Працюємо з AWS, Azure, Google Cloud та іншими провайдерами.'),
    ('11111111-1111-1111-1111-111111111106', 'uk', 'Бази даних', 'Проектування, налаштування та оптимізація баз даних. Забезпечуємо швидкий доступ до даних та їх надійне зберігання.'),
    ('11111111-1111-1111-1111-111111111107', 'uk', 'Системи автентифікації', 'Впровадження надійних систем авторизації та автентифікації користувачів. SSO, двофакторна автентифікація, біометрія.'),
    ('11111111-1111-1111-1111-111111111108', 'uk', 'Мобільні додатки', 'Розробка кросплатформних мобільних додатків для iOS та Android. Нативна якість з єдиною кодовою базою.'),
    ('11111111-1111-1111-1111-111111111109', 'uk', 'ІТ Аудит', 'Комплексний аналіз ІТ-інфраструктури вашої компанії. Виявлення вразливостей, оцінка ризиків та рекомендації щодо покращення безпеки.'),
    ('11111111-1111-1111-1111-111111111110', 'uk', 'Відеоспостереження', 'Проектування та встановлення систем відеоспостереження. IP-камери, архівація відео, віддалений доступ та інтелектуальна аналітика.'),
    ('11111111-1111-1111-1111-111111111111', 'uk', 'Системи контролю доступу', 'Впровадження сучасних систем контролю та обліку доступу. Картки, біометрія, контроль проходу та інтеграція з іншими системами безпеки.'),
    ('11111111-1111-1111-1111-111111111112', 'uk', 'Охоронна сигналізація', 'Встановлення та налаштування охоронних систем. Датчики руху, протипожежна сигналізація, централізований моніторинг та швидке реагування.');

-- Insert English translations
INSERT INTO public.service_translations (service_id, language, title, description) VALUES
    ('11111111-1111-1111-1111-111111111101', 'en', 'Web Development', 'Development of modern, fast and reliable web applications using the latest technologies. From simple landing pages to complex corporate systems.'),
    ('11111111-1111-1111-1111-111111111102', 'en', 'Server Solutions', 'Setup, maintenance and optimization of server infrastructure. We ensure reliable operation of your systems 24/7.'),
    ('11111111-1111-1111-1111-111111111103', 'en', 'Cybersecurity', 'Comprehensive protection of your data and systems from cyber threats. Security audits, implementation of protective mechanisms and monitoring.'),
    ('11111111-1111-1111-1111-111111111104', 'en', 'Performance Optimization', 'Analysis and improvement of your applications and systems performance. We increase efficiency and reduce infrastructure costs.'),
    ('11111111-1111-1111-1111-111111111105', 'en', 'Cloud Solutions', 'Cloud migration, cloud infrastructure setup. We work with AWS, Azure, Google Cloud and other providers.'),
    ('11111111-1111-1111-1111-111111111106', 'en', 'Databases', 'Database design, setup and optimization. We ensure fast data access and reliable storage.'),
    ('11111111-1111-1111-1111-111111111107', 'en', 'Authentication Systems', 'Implementation of reliable user authorization and authentication systems. SSO, two-factor authentication, biometrics.'),
    ('11111111-1111-1111-1111-111111111108', 'en', 'Mobile Applications', 'Development of cross-platform mobile applications for iOS and Android. Native quality with a single codebase.'),
    ('11111111-1111-1111-1111-111111111109', 'en', 'IT Audit', 'Comprehensive analysis of your company''s IT infrastructure. Identifying vulnerabilities, risk assessment and security improvement recommendations.'),
    ('11111111-1111-1111-1111-111111111110', 'en', 'Video Surveillance', 'Design and installation of video surveillance systems. IP cameras, video archiving, remote access and intelligent analytics.'),
    ('11111111-1111-1111-1111-111111111111', 'en', 'Access Control Systems', 'Implementation of modern access control and accounting systems. Cards, biometrics, passage control and integration with other security systems.'),
    ('11111111-1111-1111-1111-111111111112', 'en', 'Security Alarm Systems', 'Installation and configuration of security systems. Motion sensors, fire alarms, centralized monitoring and rapid response.');