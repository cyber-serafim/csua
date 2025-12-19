-- CSUA Database Backup
-- Generated: 2025-12-19
-- Database: Lovable Cloud (Supabase)

-- =============================================
-- TABLE: pages
-- =============================================
INSERT INTO pages (id, slug, published, created_at, updated_at) VALUES
('52a3f3be-c5db-4376-9bac-5f8c1970f4b7', 'about', true, '2025-12-09 09:07:28.115494+00', '2025-12-09 09:07:28.115494+00'),
('f53cb3bf-505c-4a0d-a228-61a4f46e71b4', 'contact', true, '2025-12-09 09:26:48.034848+00', '2025-12-09 09:26:48.034848+00'),
('4ca66440-ec76-4009-ac17-c60a53228506', 'home', true, '2025-12-10 11:32:39.085086+00', '2025-12-10 11:32:39.085086+00')
ON CONFLICT (id) DO UPDATE SET slug = EXCLUDED.slug, published = EXCLUDED.published, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: page_translations
-- =============================================
INSERT INTO page_translations (id, page_id, language, title, meta_description, created_at, updated_at) VALUES
('6b9c70e7-3eff-4946-a8ee-aa1edc691f97', '52a3f3be-c5db-4376-9bac-5f8c1970f4b7', 'uk', 'Про нас', 'Про компанію CyberSecurity Ukraine', '2025-12-09 09:07:28.709616+00', '2025-12-09 09:26:07.255564+00'),
('3add0696-2488-44fc-8d1a-ac29a59efa31', '52a3f3be-c5db-4376-9bac-5f8c1970f4b7', 'en', 'About Us', 'About CyberSecurity Ukraine', '2025-12-09 09:07:29.129482+00', '2025-12-09 09:26:07.741966+00'),
('8ce791b7-8311-4c1d-af76-3bb463c65414', 'f53cb3bf-505c-4a0d-a228-61a4f46e71b4', 'uk', 'Контакти', 'Зв''яжіться з CyberSecurity Ukraine', '2025-12-09 09:26:48.468126+00', '2025-12-09 09:26:48.468126+00'),
('9cb203d5-9f15-47a3-bf09-3c1c0d5118b7', 'f53cb3bf-505c-4a0d-a228-61a4f46e71b4', 'en', 'Contact', 'Contact CyberSecurity Ukraine', '2025-12-09 09:26:48.814933+00', '2025-12-09 09:26:48.814933+00'),
('242d6130-2cb2-4bdb-9dde-4d4d904e9d0f', '4ca66440-ec76-4009-ac17-c60a53228506', 'uk', 'Головна', 'CyberSecurity Ukraine - Професійні IT-рішення для вашого бізнесу', '2025-12-10 11:32:39.505892+00', '2025-12-10 11:32:39.505892+00'),
('9ccfb9c4-01c9-4305-a1cd-504b6e073c0b', '4ca66440-ec76-4009-ac17-c60a53228506', 'en', 'Home', 'CyberSecurity Ukraine - Professional IT Solutions for Your Business', '2025-12-10 11:32:39.822125+00', '2025-12-10 11:32:39.822125+00')
ON CONFLICT (id) DO UPDATE SET page_id = EXCLUDED.page_id, language = EXCLUDED.language, title = EXCLUDED.title, meta_description = EXCLUDED.meta_description, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: content_blocks
-- =============================================
INSERT INTO content_blocks (id, page_id, block_type, sort_order, created_at, updated_at) VALUES
('b6dfa211-8e00-40ea-a944-1d46efe29589', '52a3f3be-c5db-4376-9bac-5f8c1970f4b7', 'about_content', 0, '2025-12-09 09:07:30.328547+00', '2025-12-09 09:07:30.328547+00'),
('efa16c16-3bef-4dc2-9269-b1de9321456e', 'f53cb3bf-505c-4a0d-a228-61a4f46e71b4', 'contact_info', 0, '2025-12-09 09:26:49.245727+00', '2025-12-09 09:26:49.245727+00'),
('afa41625-e7fe-4b97-879a-c057b2692268', '4ca66440-ec76-4009-ac17-c60a53228506', 'home_services', 0, '2025-12-10 11:32:40.175187+00', '2025-12-10 11:32:40.175187+00')
ON CONFLICT (id) DO UPDATE SET page_id = EXCLUDED.page_id, block_type = EXCLUDED.block_type, sort_order = EXCLUDED.sort_order, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: content_block_translations
-- =============================================
INSERT INTO content_block_translations (id, block_id, language, content, created_at, updated_at) VALUES
('399f2f96-6873-44ba-94a3-18b8902b80e5', 'b6dfa211-8e00-40ea-a944-1d46efe29589', 'uk', '{"history":"Заснована в 2020 році, компанія CyberSecurity Ukraine швидко зарекомендувала себе як надійний партнер для бізнесу різного масштабу. За цей час ми реалізували десятки успішних проектів та допомогли багатьом компаніям вийти на новий рівень розвитку","mission":"Наша місія - надавати найкращі IT-рішення, які допомагають нашим клієнтам оптимізувати бізнес-процеси, підвищити ефективність та досягати стратегічних цілей. Ми віримо, що технології повинні бути доступними, зрозумілими та приносити реальну цінність","values":[{"description":"Наша команда складається з досвідчених фахівців з багаторічним досвідом","title":"Команда експертів"},{"description":"Ми завжди прагнемо до найвищих стандартів якості в кожному проекті","title":"Висока якість"},{"description":"Фокусуємось на досягненні конкретних бізнес-цілей наших клієнтів","title":"Орієнтація на результат"},{"description":"Завжди вивчаємо нові технології та вдосконалюємо наші навички","title":"Постійний розвиток"}]}', '2025-12-09 09:07:30.861707+00', '2025-12-09 09:26:08.466226+00'),
('2097c013-2f2f-44ec-9e76-d49a32a05361', 'b6dfa211-8e00-40ea-a944-1d46efe29589', 'en', '{"history":"Founded in 2020, CyberSecurity Ukraine has quickly established itself as a reliable partner for businesses of all sizes. During this time, we have implemented dozens of successful projects and helped many companies reach a new level of development","mission":"Our mission is to provide the best IT solutions that help our clients optimize business processes, increase efficiency and achieve strategic goals. We believe that technology should be accessible, understandable and bring real value","values":[{"description":"Our team consists of experienced professionals with many years of experience","title":"Team of Experts"},{"description":"We always strive for the highest quality standards in every project","title":"High Quality"},{"description":"We focus on achieving specific business goals of our clients","title":"Result-Oriented"},{"description":"We always learn new technologies and improve our skills","title":"Continuous Development"}]}', '2025-12-09 09:07:31.277296+00', '2025-12-09 09:26:08.92177+00'),
('e9fd8cf8-12d7-408d-99d9-1e7eb21166c4', 'efa16c16-3bef-4dc2-9269-b1de9321456e', 'uk', '{"address":"Київ, Україна","email":"info@csua.biz.ua","phone":"+380 (95) 8-777-99-7"}', '2025-12-09 09:26:49.699523+00', '2025-12-09 09:26:49.699523+00'),
('541383b0-56aa-4430-ae68-d5ce08c30efa', 'efa16c16-3bef-4dc2-9269-b1de9321456e', 'en', '{"address":"Kyiv, Ukraine","email":"info@csua.biz.ua","phone":"+380 (95) 8-777-99-7"}', '2025-12-09 09:26:50.176805+00', '2025-12-09 09:26:50.176805+00'),
('91747632-3d10-4c7e-9246-4be7a4b1ca5b', 'afa41625-e7fe-4b97-879a-c057b2692268', 'uk', '{"sectionSubtitle":"Ми пропонуємо широкий спектр IT-послуг для бізнесу будь-якого масштабу","sectionTitle":"Наші послуги","services":[{"description":"Створення сучасних веб-додатків та сайтів","icon":"Code","title":"Веб-розробка"},{"description":"Налаштування та підтримка серверної інфраструктури","icon":"Server","title":"Серверні рішення"},{"description":"Захист ваших даних та IT систем","icon":"Shield","title":"Кібербезпека"},{"description":"Підвищення продуктивності IT-інфраструктури","icon":"Zap","title":"Оптимізація"}]}', '2025-12-10 11:32:40.456607+00', '2025-12-10 11:32:40.456607+00'),
('a3b4c5d6-7890-1234-5678-90abcdef1234', 'afa41625-e7fe-4b97-879a-c057b2692268', 'en', '{"sectionSubtitle":"We offer a wide range of IT services for businesses of any scale","sectionTitle":"Our Services","services":[{"description":"Building modern web applications and websites","icon":"Code","title":"Web Development"},{"description":"Setup and maintenance of server infrastructure","icon":"Server","title":"Server Solutions"},{"description":"Protection of your data and systems","icon":"Shield","title":"Cybersecurity"},{"description":"Improving IT infrastructure performance","icon":"Zap","title":"Optimization"}]}', '2025-12-10 11:32:40.789012+00', '2025-12-10 11:32:40.789012+00')
ON CONFLICT (id) DO UPDATE SET block_id = EXCLUDED.block_id, language = EXCLUDED.language, content = EXCLUDED.content, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: services
-- =============================================
INSERT INTO services (id, icon_name, sort_order, is_active, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111101', 'Code', 1, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111102', 'Server', 2, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111103', 'Shield', 3, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111104', 'Zap', 4, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111105', 'Cloud', 5, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111106', 'Database', 6, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111107', 'Lock', 7, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111108', 'Smartphone', 8, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111109', 'FileSearch', 9, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111110', 'Camera', 10, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111111', 'DoorOpen', 11, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('11111111-1111-1111-1111-111111111112', 'Bell', 12, true, '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00')
ON CONFLICT (id) DO UPDATE SET icon_name = EXCLUDED.icon_name, sort_order = EXCLUDED.sort_order, is_active = EXCLUDED.is_active, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: service_translations
-- =============================================
INSERT INTO service_translations (id, service_id, language, title, description, created_at, updated_at) VALUES
('9b907325-0893-47ac-b2a5-e419c6be0c5d', '11111111-1111-1111-1111-111111111101', 'uk', 'Веб-розробка', 'Розробка сучасних, швидких та надійних веб-додатків з використанням новітніх технологій. Від простих лендінгів до складних корпоративних систем.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('e881e957-579b-468a-aeae-4fc7f1a99e02', '11111111-1111-1111-1111-111111111102', 'uk', 'Серверні рішення', 'Налаштування, підтримка та оптимізація серверної інфраструктури. Забезпечуємо надійну роботу ваших систем 24/7.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('28659c9d-7c77-4882-9611-20076d45b723', '11111111-1111-1111-1111-111111111103', 'uk', 'Кібербезпека', 'Комплексний захист ваших даних та систем від кіберзагроз. Аудит безпеки, впровадження захисних механізмів та моніторинг.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('caa38f88-e5ed-40b5-b435-41a1213594ec', '11111111-1111-1111-1111-111111111104', 'uk', 'Оптимізація продуктивності', 'Аналіз та покращення швидкодії ваших додатків та систем. Підвищуємо ефективність та знижуємо витрати на інфраструктуру.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('0df236ce-0625-4385-b859-74a407a67647', '11111111-1111-1111-1111-111111111105', 'uk', 'Хмарні рішення', 'Міграція в хмару, налаштування хмарної інфраструктури. Працюємо з AWS, Azure, Google Cloud та іншими провайдерами.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('ddecde6b-38dc-42e6-98e8-64bb88fb4194', '11111111-1111-1111-1111-111111111106', 'uk', 'Бази даних', 'Проектування, налаштування та оптимізація баз даних. Забезпечуємо швидкий доступ до даних та їх надійне зберігання.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('4dad784f-a702-498f-bb4e-a398f13c61d1', '11111111-1111-1111-1111-111111111107', 'uk', 'Системи автентифікації', 'Впровадження надійних систем авторизації та автентифікації користувачів. SSO, двофакторна автентифікація, біометрія.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('9d4ddfc9-ffce-49a9-be0a-c72f879e7dc1', '11111111-1111-1111-1111-111111111108', 'uk', 'Мобільні додатки', 'Розробка кросплатформних мобільних додатків для iOS та Android. Нативна якість з єдиною кодовою базою.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('fa6bb201-19e8-4416-846e-61290c99d54b', '11111111-1111-1111-1111-111111111109', 'uk', 'ІТ Аудит', 'Комплексний аналіз ІТ-інфраструктури вашої компанії. Виявлення вразливостей, оцінка ризиків та рекомендації щодо покращення безпеки.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('bd80e7c4-380e-41d4-8637-8d7a340f7458', '11111111-1111-1111-1111-111111111110', 'uk', 'Відеоспостереження', 'Проектування та встановлення систем відеоспостереження. IP-камери, архівація відео, віддалений доступ та інтелектуальна аналітика.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('44ec9065-c29b-4e67-a123-abcdef123456', '11111111-1111-1111-1111-111111111111', 'uk', 'Контроль доступу', 'Впровадження сучасних систем контролю та обліку доступу. Картки, біометрія, контроль проходу та інтеграція з іншими системами безпеки.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('55ec9065-c29b-4e67-a123-abcdef123457', '11111111-1111-1111-1111-111111111112', 'uk', 'Системи сповіщення', 'Впровадження систем оповіщення та сигналізації. Моніторинг подій, автоматичні сповіщення та інтеграція з системами безпеки.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('ab907325-0893-47ac-b2a5-e419c6be0c5e', '11111111-1111-1111-1111-111111111101', 'en', 'Web Development', 'Development of modern, fast and reliable web applications using the latest technologies. From simple landing pages to complex corporate systems.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('ab881e957-579b-468a-aeae-4fc7f1a99e03', '11111111-1111-1111-1111-111111111102', 'en', 'Server Solutions', 'Setup, maintenance and optimization of server infrastructure. We ensure reliable operation of your systems 24/7.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('ab659c9d-7c77-4882-9611-20076d45b724', '11111111-1111-1111-1111-111111111103', 'en', 'Cybersecurity', 'Comprehensive protection of your data and systems from cyber threats. Security audit, implementation of protective mechanisms and monitoring.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('aba38f88-e5ed-40b5-b435-41a1213594ed', '11111111-1111-1111-1111-111111111104', 'en', 'Performance Optimization', 'Analysis and improvement of your applications and systems performance. We increase efficiency and reduce infrastructure costs.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('abf236ce-0625-4385-b859-74a407a67648', '11111111-1111-1111-1111-111111111105', 'en', 'Cloud Solutions', 'Cloud migration, cloud infrastructure setup. We work with AWS, Azure, Google Cloud and other providers.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('abecde6b-38dc-42e6-98e8-64bb88fb4195', '11111111-1111-1111-1111-111111111106', 'en', 'Databases', 'Database design, setup and optimization. We ensure fast data access and reliable storage.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('abad784f-a702-498f-bb4e-a398f13c61d2', '11111111-1111-1111-1111-111111111107', 'en', 'Authentication Systems', 'Implementation of reliable user authorization and authentication systems. SSO, two-factor authentication, biometrics.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('ab4ddfc9-ffce-49a9-be0a-c72f879e7dc2', '11111111-1111-1111-1111-111111111108', 'en', 'Mobile Applications', 'Development of cross-platform mobile applications for iOS and Android. Native quality with a single codebase.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('ab6bb201-19e8-4416-846e-61290c99d54c', '11111111-1111-1111-1111-111111111109', 'en', 'IT Audit', 'Comprehensive analysis of your company IT infrastructure. Vulnerability detection, risk assessment and security improvement recommendations.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('ab80e7c4-380e-41d4-8637-8d7a340f7459', '11111111-1111-1111-1111-111111111110', 'en', 'Video Surveillance', 'Design and installation of video surveillance systems. IP cameras, video archiving, remote access and intelligent analytics.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('abec9065-c29b-4e67-a123-abcdef123458', '11111111-1111-1111-1111-111111111111', 'en', 'Access Control', 'Implementation of modern access control systems. Cards, biometrics, passage control and integration with other security systems.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00'),
('abec9065-c29b-4e67-a123-abcdef123459', '11111111-1111-1111-1111-111111111112', 'en', 'Alert Systems', 'Implementation of notification and alarm systems. Event monitoring, automatic notifications and integration with security systems.', '2025-12-05 10:15:04.092312+00', '2025-12-05 10:15:04.092312+00')
ON CONFLICT (id) DO UPDATE SET service_id = EXCLUDED.service_id, language = EXCLUDED.language, title = EXCLUDED.title, description = EXCLUDED.description, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: crm_companies
-- =============================================
INSERT INTO crm_companies (id, name, email, phone, website, address, notes, created_at, updated_at) VALUES
('c32a2fe3-ee0b-46fe-accd-1f689f3bea78', 'ТОВ "ЛЮКСВЕН РІТЕЙЛ"', 'info@luxwen.ua', '+380674667788', 'https://luxwen.ua', 'с.Путровка', 'Тест', '2025-12-17 10:29:33.723299+00', '2025-12-17 10:29:33.723299+00')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, email = EXCLUDED.email, phone = EXCLUDED.phone, website = EXCLUDED.website, address = EXCLUDED.address, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: crm_contacts
-- =============================================
INSERT INTO crm_contacts (id, company_id, first_name, last_name, email, phone, position, notes, created_at, updated_at) VALUES
('1b38889e-6eaa-451e-a0d5-e6b1bb653932', 'c32a2fe3-ee0b-46fe-accd-1f689f3bea78', 'Сергей', 'Сергеев', 'sergeev.s@luxwen.ua', '+380976547728', 'менеджер', 'test Serj', '2025-12-17 10:32:21.837167+00', '2025-12-17 10:32:21.837167+00')
ON CONFLICT (id) DO UPDATE SET company_id = EXCLUDED.company_id, first_name = EXCLUDED.first_name, last_name = EXCLUDED.last_name, email = EXCLUDED.email, phone = EXCLUDED.phone, position = EXCLUDED.position, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: crm_deals
-- =============================================
INSERT INTO crm_deals (id, company_id, contact_id, title, stage, value, currency, expected_close_date, sort_order, notes, created_at, updated_at) VALUES
('8ca177a5-ec00-467d-92a5-5e2b3f41e4bc', 'c32a2fe3-ee0b-46fe-accd-1f689f3bea78', '1b38889e-6eaa-451e-a0d5-e6b1bb653932', 'Угода 00001', 'in_progress', 3000000.00, 'UAH', '2026-01-17', 0, 'Тестова угода', '2025-12-17 10:34:54.980979+00', '2025-12-17 10:35:03.707473+00')
ON CONFLICT (id) DO UPDATE SET company_id = EXCLUDED.company_id, contact_id = EXCLUDED.contact_id, title = EXCLUDED.title, stage = EXCLUDED.stage, value = EXCLUDED.value, currency = EXCLUDED.currency, expected_close_date = EXCLUDED.expected_close_date, sort_order = EXCLUDED.sort_order, notes = EXCLUDED.notes, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: crm_tasks
-- =============================================
INSERT INTO crm_tasks (id, deal_id, contact_id, title, description, due_date, completed, completed_at, created_at, updated_at) VALUES
('b2c26724-f1a1-4ece-b292-3ffb3eee492c', '8ca177a5-ec00-467d-92a5-5e2b3f41e4bc', '1b38889e-6eaa-451e-a0d5-e6b1bb653932', 'Холодний дзвінок', 'сабж', '2025-12-18 00:00:00+00', false, NULL, '2025-12-17 10:33:56.795353+00', '2025-12-17 10:35:11.36592+00')
ON CONFLICT (id) DO UPDATE SET deal_id = EXCLUDED.deal_id, contact_id = EXCLUDED.contact_id, title = EXCLUDED.title, description = EXCLUDED.description, due_date = EXCLUDED.due_date, completed = EXCLUDED.completed, completed_at = EXCLUDED.completed_at, updated_at = EXCLUDED.updated_at;

-- =============================================
-- TABLE: user_roles
-- =============================================
INSERT INTO user_roles (id, user_id, role, created_at) VALUES
('c02b2eca-2669-4772-91b0-447dc730d5dd', '229b0e22-ccbb-45f8-a696-63d20da6a8ed', 'admin', '2025-12-03 20:11:01.483643+00')
ON CONFLICT (id) DO UPDATE SET user_id = EXCLUDED.user_id, role = EXCLUDED.role;

-- =============================================
-- TABLE: backup_content
-- =============================================
INSERT INTO backup_content (id, content_key, content_uk, content_en, created_at, updated_at) VALUES
('a8ad2350-a62f-4177-98b0-0f7461fcdca2', 'page_title', 'Backup сайту', 'Site Backup', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('b74c8185-2caf-48ca-8fa3-8a2ec006fad6', 'important_info_title', 'Важлива інформація', 'Important Information', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('28653205-d3ee-4dd9-800d-90440574cc39', 'important_info_text', 'Цей сайт побудований на Lovable.dev з використанням React + Vite. Дані зберігаються в Supabase (PostgreSQL). Для повного бекапу потрібно зберегти код проекту та дані бази даних.', 'This site is built on Lovable.dev using React + Vite. Data is stored in Supabase (PostgreSQL). For a complete backup, you need to save the project code and database data.', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('12d49438-a67c-4c82-99a7-d8a787f75353', 'code_backup_title', 'Бекап коду сайту', 'Site Code Backup', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('42bbc15e-a803-4226-a655-0051a15ed0ee', 'code_backup_description', 'Збереження файлів проекту', 'Saving project files', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('cf967c00-3735-441d-8b4e-625da08d066c', 'method_github_title', 'Метод 1: Через GitHub (рекомендовано)', 'Method 1: Via GitHub (recommended)', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('1e027c3e-b4ef-4bb4-8fad-e2c46a7f8635', 'method_github_text', 'Якщо проект підключено до GitHub, код автоматично синхронізується.', 'If the project is connected to GitHub, the code is automatically synchronized.', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('d25ef0d6-d890-4914-935a-a2ee83ebd702', 'method_download_title', 'Метод 2: Завантаження архіву', 'Method 2: Download archive', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('68e2dad0-54c2-4439-ba6d-da03fdd290cc', 'method_download_text', 'Якщо проект підключено до GitHub, ви можете завантажити ZIP-архів безпосередньо:', 'If the project is connected to GitHub, you can download a ZIP archive directly:', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('28b628a2-4499-4dd4-b2aa-111479dfc4d3', 'db_backup_title', 'Бекап бази даних', 'Database Backup', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('5b3b8fc7-4e13-4324-9c79-8025d4add0cb', 'db_backup_description', 'Експорт даних з Supabase', 'Export data from Supabase', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('2f427de4-8a86-4d22-858e-bfae2d034fed', 'db_backup_alert', 'Для доступу до бази даних вам потрібні облікові дані Supabase. Зверніться до адміністратора Lovable Cloud або перегляньте налаштування проекту.', 'To access the database, you need Supabase credentials. Contact the Lovable Cloud administrator or check the project settings.', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('3b4128ce-76e3-4392-81f6-d71ae795c404', 'export_schema_title', 'Експорт схеми бази даних', 'Export database schema', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('57322ea5-d8b2-45d2-ba4b-d8bf1a9b2674', 'export_schema_text', 'Схема містить структуру таблиць, індекси, RLS-політики тощо.', 'The schema contains table structure, indexes, RLS policies, etc.', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00'),
('56391e5c-17b5-4820-a84b-dc2c800ab057', 'export_data_title', 'Експорт даних', 'Export data', '2025-12-16 01:00:48.003886+00', '2025-12-16 01:00:48.003886+00')
ON CONFLICT (id) DO UPDATE SET content_key = EXCLUDED.content_key, content_uk = EXCLUDED.content_uk, content_en = EXCLUDED.content_en, updated_at = EXCLUDED.updated_at;

-- =============================================
-- END OF BACKUP
-- =============================================
