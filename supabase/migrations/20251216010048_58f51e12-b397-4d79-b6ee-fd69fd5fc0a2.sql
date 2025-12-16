-- Create table for backup page editable content
CREATE TABLE public.backup_content (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content_key TEXT NOT NULL UNIQUE,
  content_uk TEXT NOT NULL DEFAULT '',
  content_en TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.backup_content ENABLE ROW LEVEL SECURITY;

-- Admins can manage backup content
CREATE POLICY "Admins can manage backup_content"
ON public.backup_content
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view backup content
CREATE POLICY "Anyone can view backup_content"
ON public.backup_content
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_backup_content_updated_at
BEFORE UPDATE ON public.backup_content
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default content
INSERT INTO public.backup_content (content_key, content_uk, content_en) VALUES
('page_title', 'Backup сайту', 'Site Backup'),
('important_info_title', 'Важлива інформація', 'Important Information'),
('important_info_text', 'Цей сайт побудований на Lovable.dev з використанням React + Vite. Дані зберігаються в Supabase (PostgreSQL). Для повного бекапу потрібно зберегти код проекту та дані бази даних.', 'This site is built on Lovable.dev using React + Vite. Data is stored in Supabase (PostgreSQL). For a complete backup, you need to save the project code and database data.'),
('code_backup_title', 'Бекап коду сайту', 'Site Code Backup'),
('code_backup_description', 'Збереження файлів проекту', 'Saving project files'),
('method_github_title', 'Метод 1: Через GitHub (рекомендовано)', 'Method 1: Via GitHub (recommended)'),
('method_github_text', 'Якщо проект підключено до GitHub, код автоматично синхронізується.', 'If the project is connected to GitHub, the code is automatically synchronized.'),
('method_download_title', 'Метод 2: Завантаження архіву', 'Method 2: Download archive'),
('method_download_text', 'Якщо проект підключено до GitHub, ви можете завантажити ZIP-архів безпосередньо:', 'If the project is connected to GitHub, you can download a ZIP archive directly:'),
('db_backup_title', 'Бекап бази даних', 'Database Backup'),
('db_backup_description', 'Експорт даних з Supabase', 'Export data from Supabase'),
('db_backup_alert', 'Для доступу до бази даних вам потрібні облікові дані Supabase. Зверніться до адміністратора Lovable Cloud або перегляньте налаштування проекту.', 'To access the database, you need Supabase credentials. Contact the Lovable Cloud administrator or check the project settings.'),
('export_schema_title', 'Експорт схеми бази даних', 'Export database schema'),
('export_schema_text', 'Схема містить структуру таблиць, індекси, RLS-політики тощо.', 'The schema contains table structure, indexes, RLS policies, etc.'),
('export_data_title', 'Експорт даних', 'Export data'),
('export_data_text', 'Експортує лише дані без структури таблиць.', 'Exports only data without table structure.'),
('full_backup_title', 'Повний бекап (схема + дані)', 'Full backup (schema + data)'),
('full_backup_text', 'Рекомендований варіант - містить все необхідне для повного відновлення.', 'Recommended option - contains everything needed for full recovery.'),
('restore_title', 'Відновлення на іншому хостингу', 'Restore on another hosting'),
('restore_description', 'Покрокова інструкція', 'Step-by-step guide'),
('step1_title', 'Крок 1: Підготовка сервера', 'Step 1: Server preparation'),
('step2_title', 'Крок 2: Розгортання коду', 'Step 2: Deploy code'),
('step2_text', 'Завантажте код та встановіть залежності:', 'Download code and install dependencies:'),
('step3_title', 'Крок 3: Налаштування змінних оточення', 'Step 3: Configure environment variables'),
('step3_text', 'Створіть файл .env з новими даними Supabase:', 'Create .env file with new Supabase data:'),
('step4_title', 'Крок 4: Відновлення бази даних', 'Step 4: Restore database'),
('step4_text', 'Імпортуйте бекап в нову базу даних:', 'Import backup to new database:'),
('step5_title', 'Крок 5: Збірка та запуск', 'Step 5: Build and run'),
('step6_title', 'Крок 6: Налаштування Nginx', 'Step 6: Configure Nginx'),
('step6_text', 'Приклад конфігурації для SPA:', 'Example configuration for SPA:'),
('dont_forget_title', 'Не забудьте', 'Don''t forget'),
('dont_forget_item1', 'Оновити DNS-записи домену', 'Update domain DNS records'),
('dont_forget_item2', 'Налаштувати SSL-сертифікат (Let''s Encrypt)', 'Configure SSL certificate (Let''s Encrypt)'),
('dont_forget_item3', 'Перенести Edge Functions в новий проект Supabase', 'Transfer Edge Functions to new Supabase project'),
('dont_forget_item4', 'Оновити секрети та API ключі', 'Update secrets and API keys');