import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Download, Database, FolderArchive, Info, ExternalLink, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const Backup = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/admin/login');
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      toast({
        title: t({ uk: 'Доступ заборонено', en: 'Access Denied' }),
        description: t({ 
          uk: 'У вас немає прав адміністратора', 
          en: 'You do not have administrator rights' 
        }),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
  };

  const copyToClipboard = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
      toast({
        title: t({ uk: 'Скопійовано', en: 'Copied' }),
        description: t({ uk: 'Команду скопійовано в буфер обміну', en: 'Command copied to clipboard' }),
      });
    } catch (err) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося скопіювати', en: 'Failed to copy' }),
        variant: 'destructive',
      });
    }
  };

  const codeBlocks = {
    cloneRepo: `git clone https://github.com/YOUR_USERNAME/YOUR_REPO.git
cd YOUR_REPO`,
    installDeps: `npm install
# або
bun install`,
    buildProject: `npm run build
# або
bun run build`,
    exportSchema: `# Встановіть Supabase CLI
npm install -g supabase

# Експортуйте схему бази даних
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" > backup_schema.sql`,
    exportData: `# Експортуйте дані з таблиць
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" --data-only > backup_data.sql`,
    fullBackup: `# Повний бекап (схема + дані)
supabase db dump --db-url "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres" -f full_backup.sql`,
    restoreDb: `# Відновлення бази даних на новому сервері
psql -h NEW_HOST -U postgres -d postgres < full_backup.sql`,
    envExample: `VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id`,
    nginxConfig: `server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/your-site/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}`,
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
      </div>
    );
  }

  const CodeBlock = ({ code, index }: { code: string; index: number }) => (
    <div className="relative group">
      <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
        <code className="text-foreground">{code}</code>
      </pre>
      <Button
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => copyToClipboard(code, index)}
      >
        {copiedIndex === index ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      </Button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: 'Backup сайту', en: 'Site Backup' })}
            </h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertTitle>{t({ uk: 'Важлива інформація', en: 'Important Information' })}</AlertTitle>
          <AlertDescription>
            {t({ 
              uk: 'Цей сайт побудований на Lovable.dev з використанням React + Vite. Дані зберігаються в Supabase (PostgreSQL). Для повного бекапу потрібно зберегти код проекту та дані бази даних.', 
              en: 'This site is built on Lovable.dev using React + Vite. Data is stored in Supabase (PostgreSQL). For a complete backup, you need to save the project code and database data.' 
            })}
          </AlertDescription>
        </Alert>

        <div className="grid gap-6">
          {/* Code Backup Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <FolderArchive className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>{t({ uk: 'Бекап коду сайту', en: 'Site Code Backup' })}</CardTitle>
                  <CardDescription>
                    {t({ uk: 'Збереження файлів проекту', en: 'Saving project files' })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="github">
                  <AccordionTrigger>
                    {t({ uk: 'Метод 1: Через GitHub (рекомендовано)', en: 'Method 1: Via GitHub (recommended)' })}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {t({ 
                        uk: "Якщо проект підключено до GitHub, код автоматично синхронізується.", 
                        en: "If the project is connected to GitHub, the code is automatically synchronized." 
                      })}
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>{t({ uk: 'Перейдіть в налаштування проекту на Lovable.dev', en: 'Go to project settings on Lovable.dev' })}</li>
                      <li>{t({ uk: 'Підключіть GitHub репозиторій (якщо ще не підключено)', en: 'Connect GitHub repository (if not already connected)' })}</li>
                      <li>{t({ uk: 'Клонуйте репозиторій локально:', en: 'Clone the repository locally:' })}</li>
                    </ol>
                    <CodeBlock code={codeBlocks.cloneRepo} index={1} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="download">
                  <AccordionTrigger>
                    {t({ uk: 'Метод 2: Завантаження архіву', en: 'Method 2: Download archive' })}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground">
                      {t({ 
                        uk: 'Якщо проект підключено до GitHub, ви можете завантажити ZIP-архів безпосередньо:', 
                        en: 'If the project is connected to GitHub, you can download a ZIP archive directly:' 
                      })}
                    </p>
                    <ol className="list-decimal list-inside space-y-2 text-sm">
                      <li>{t({ uk: 'Відкрийте ваш GitHub репозиторій', en: 'Open your GitHub repository' })}</li>
                      <li>{t({ uk: 'Натисніть зелену кнопку "Code"', en: 'Click the green "Code" button' })}</li>
                      <li>{t({ uk: 'Виберіть "Download ZIP"', en: 'Select "Download ZIP"' })}</li>
                    </ol>
                    <Button variant="outline" asChild>
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {t({ uk: 'Відкрити GitHub', en: 'Open GitHub' })}
                      </a>
                    </Button>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Database Backup Section */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Database className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>{t({ uk: 'Бекап бази даних', en: 'Database Backup' })}</CardTitle>
                  <CardDescription>
                    {t({ uk: 'Експорт даних з Supabase', en: 'Export data from Supabase' })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  {t({ 
                    uk: 'Для доступу до бази даних вам потрібні облікові дані Supabase. Зверніться до адміністратора Lovable Cloud або перегляньте налаштування проекту.', 
                    en: 'To access the database, you need Supabase credentials. Contact the Lovable Cloud administrator or check the project settings.' 
                  })}
                </AlertDescription>
              </Alert>

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="schema">
                  <AccordionTrigger>
                    {t({ uk: 'Експорт схеми бази даних', en: 'Export database schema' })}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      {t({ 
                        uk: 'Схема містить структуру таблиць, індекси, RLS-політики тощо.', 
                        en: 'The schema contains table structure, indexes, RLS policies, etc.' 
                      })}
                    </p>
                    <CodeBlock code={codeBlocks.exportSchema} index={2} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="data">
                  <AccordionTrigger>
                    {t({ uk: 'Експорт даних', en: 'Export data' })}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      {t({ 
                        uk: 'Експортує лише дані без структури таблиць.', 
                        en: 'Exports only data without table structure.' 
                      })}
                    </p>
                    <CodeBlock code={codeBlocks.exportData} index={3} />
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="full">
                  <AccordionTrigger>
                    {t({ uk: 'Повний бекап (схема + дані)', en: 'Full backup (schema + data)' })}
                  </AccordionTrigger>
                  <AccordionContent className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                      {t({ 
                        uk: 'Рекомендований варіант - містить все необхідне для повного відновлення.', 
                        en: 'Recommended option - contains everything needed for full recovery.' 
                      })}
                    </p>
                    <CodeBlock code={codeBlocks.fullBackup} index={4} />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>

          {/* Restore Instructions */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                  <Download className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>{t({ uk: 'Відновлення на іншому хостингу', en: 'Restore on another hosting' })}</CardTitle>
                  <CardDescription>
                    {t({ uk: 'Покрокова інструкція', en: 'Step-by-step guide' })}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="font-semibold">{t({ uk: 'Крок 1: Підготовка сервера', en: 'Step 1: Server preparation' })}</h3>
                <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                  <li>Node.js 18+ або Bun</li>
                  <li>PostgreSQL 15+ (або Supabase на новому проекті)</li>
                  <li>Nginx або інший веб-сервер</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">{t({ uk: 'Крок 2: Розгортання коду', en: 'Step 2: Deploy code' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ uk: 'Завантажте код та встановіть залежності:', en: 'Download code and install dependencies:' })}
                </p>
                <CodeBlock code={codeBlocks.installDeps} index={5} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">{t({ uk: 'Крок 3: Налаштування змінних оточення', en: 'Step 3: Configure environment variables' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ uk: 'Створіть файл .env з новими даними Supabase:', en: 'Create .env file with new Supabase data:' })}
                </p>
                <CodeBlock code={codeBlocks.envExample} index={6} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">{t({ uk: 'Крок 4: Відновлення бази даних', en: 'Step 4: Restore database' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ uk: 'Імпортуйте бекап в нову базу даних:', en: 'Import backup to new database:' })}
                </p>
                <CodeBlock code={codeBlocks.restoreDb} index={7} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">{t({ uk: 'Крок 5: Збірка та запуск', en: 'Step 5: Build and run' })}</h3>
                <CodeBlock code={codeBlocks.buildProject} index={8} />
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold">{t({ uk: 'Крок 6: Налаштування Nginx', en: 'Step 6: Configure Nginx' })}</h3>
                <p className="text-sm text-muted-foreground">
                  {t({ uk: 'Приклад конфігурації для SPA:', en: 'Example configuration for SPA:' })}
                </p>
                <CodeBlock code={codeBlocks.nginxConfig} index={9} />
              </div>

              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertTitle>{t({ uk: 'Не забудьте', en: "Don't forget" })}</AlertTitle>
                <AlertDescription>
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>{t({ uk: 'Оновити DNS-записи домену', en: 'Update domain DNS records' })}</li>
                    <li>{t({ uk: 'Налаштувати SSL-сертифікат (Let\'s Encrypt)', en: "Configure SSL certificate (Let's Encrypt)" })}</li>
                    <li>{t({ uk: 'Перенести Edge Functions в новий проект Supabase', en: 'Transfer Edge Functions to new Supabase project' })}</li>
                    <li>{t({ uk: 'Оновити секрети та API ключі', en: 'Update secrets and API keys' })}</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Backup;
