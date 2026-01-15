import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Mail, Save, Send, Loader2 } from 'lucide-react';

interface EmailSettings {
  id: string;
  admin_email: string;
  sender_name: string;
  sender_email: string;
  notify_admin: boolean;
  notify_client: boolean;
  admin_subject_uk: string;
  admin_subject_en: string;
  client_subject_uk: string;
  client_subject_en: string;
  client_message_uk: string;
  client_message_en: string;
}

const EmailSettings = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [settings, setSettings] = useState<EmailSettings | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t, language } = useLanguage();

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
        description: t({ uk: 'У вас немає прав адміністратора', en: 'You do not have administrator rights' }),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
    await loadSettings();
    setLoading(false);
  };

  const loadSettings = async () => {
    const { data, error } = await supabase
      .from('email_settings')
      .select('*')
      .single();

    if (error) {
      console.error('Error loading email settings:', error);
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося завантажити налаштування', en: 'Failed to load settings' }),
        variant: 'destructive',
      });
      return;
    }

    setSettings(data);
    setTestEmail(data.admin_email);
  };

  const handleSave = async () => {
    if (!settings) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('email_settings')
        .update({
          admin_email: settings.admin_email,
          sender_name: settings.sender_name,
          sender_email: settings.sender_email,
          notify_admin: settings.notify_admin,
          notify_client: settings.notify_client,
          admin_subject_uk: settings.admin_subject_uk,
          admin_subject_en: settings.admin_subject_en,
          client_subject_uk: settings.client_subject_uk,
          client_subject_en: settings.client_subject_en,
          client_message_uk: settings.client_message_uk,
          client_message_en: settings.client_message_en,
          updated_at: new Date().toISOString()
        })
        .eq('id', settings.id);

      if (error) throw error;

      toast({
        title: t({ uk: 'Збережено', en: 'Saved' }),
        description: t({ uk: 'Налаштування email збережено', en: 'Email settings saved' }),
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося зберегти налаштування', en: 'Failed to save settings' }),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmail) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Вкажіть email для тестування', en: 'Please enter a test email' }),
        variant: 'destructive',
      });
      return;
    }

    setTesting(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-contact-email', {
        body: {
          name: 'Test User',
          email: testEmail,
          phone: '+380991234567',
          message: language === 'uk' 
            ? 'Це тестове повідомлення для перевірки налаштувань email.' 
            : 'This is a test message to verify email settings.',
          language
        }
      });

      if (error) throw error;

      if (data.success) {
        toast({
          title: t({ uk: 'Успішно', en: 'Success' }),
          description: t({ uk: 'Тестовий лист відправлено', en: 'Test email sent successfully' }),
        });
      } else {
        throw new Error(data.error || 'Unknown error');
      }
    } catch (error: any) {
      console.error('Error sending test email:', error);
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: error.message || t({ uk: 'Не вдалося відправити тестовий лист', en: 'Failed to send test email' }),
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!settings) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Налаштування не знайдено', en: 'Settings not found' })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t({ uk: 'Назад', en: 'Back' })}
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: 'Налаштування Email', en: 'Email Settings' })}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {t({ uk: 'Зберегти', en: 'Save' })}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                {t({ uk: 'Загальні налаштування', en: 'General Settings' })}
              </CardTitle>
              <CardDescription>
                {t({ uk: 'Налаштування відправника та отримувача', en: 'Sender and recipient settings' })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sender_name">
                    {t({ uk: "Ім'я відправника", en: 'Sender Name' })}
                  </Label>
                  <Input
                    id="sender_name"
                    value={settings.sender_name}
                    onChange={(e) => setSettings({ ...settings, sender_name: e.target.value })}
                    placeholder="CSUA"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sender_email">
                    {t({ uk: 'Email відправника', en: 'Sender Email' })}
                  </Label>
                  <Input
                    id="sender_email"
                    type="email"
                    value={settings.sender_email}
                    onChange={(e) => setSettings({ ...settings, sender_email: e.target.value })}
                    placeholder="onboarding@resend.dev"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t({ 
                      uk: 'Використовуйте верифікований домен в Resend', 
                      en: 'Use a verified domain in Resend' 
                    })}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin_email">
                  {t({ uk: 'Email адміністратора', en: 'Admin Email' })}
                </Label>
                <Input
                  id="admin_email"
                  type="email"
                  value={settings.admin_email}
                  onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                  placeholder="admin@example.com"
                />
                <p className="text-xs text-muted-foreground">
                  {t({ uk: 'Сюди будуть надходити сповіщення про нові заявки', en: 'New submissions will be sent here' })}
                </p>
              </div>

              <div className="flex items-center justify-between py-4 border-t">
                <div>
                  <Label>{t({ uk: 'Сповіщати адміністратора', en: 'Notify Admin' })}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t({ uk: 'Відправляти email при новій заявці', en: 'Send email on new submission' })}
                  </p>
                </div>
                <Switch
                  checked={settings.notify_admin}
                  onCheckedChange={(checked) => setSettings({ ...settings, notify_admin: checked })}
                />
              </div>

              <div className="flex items-center justify-between py-4 border-t">
                <div>
                  <Label>{t({ uk: 'Сповіщати клієнта', en: 'Notify Client' })}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t({ uk: 'Відправляти підтвердження клієнту', en: 'Send confirmation to client' })}
                  </p>
                </div>
                <Switch
                  checked={settings.notify_client}
                  onCheckedChange={(checked) => setSettings({ ...settings, notify_client: checked })}
                />
              </div>
            </CardContent>
          </Card>

          {/* Email Templates */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ uk: 'Шаблони листів', en: 'Email Templates' })}</CardTitle>
              <CardDescription>
                {t({ uk: 'Налаштуйте теми та текст листів', en: 'Customize email subjects and content' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="admin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="admin">
                    {t({ uk: 'Лист адміністратору', en: 'Admin Email' })}
                  </TabsTrigger>
                  <TabsTrigger value="client">
                    {t({ uk: 'Лист клієнту', en: 'Client Email' })}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="admin" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ uk: 'Тема (українською)', en: 'Subject (Ukrainian)' })}</Label>
                      <Input
                        value={settings.admin_subject_uk}
                        onChange={(e) => setSettings({ ...settings, admin_subject_uk: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ uk: 'Тема (англійською)', en: 'Subject (English)' })}</Label>
                      <Input
                        value={settings.admin_subject_en}
                        onChange={(e) => setSettings({ ...settings, admin_subject_en: e.target.value })}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="client" className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t({ uk: 'Тема (українською)', en: 'Subject (Ukrainian)' })}</Label>
                      <Input
                        value={settings.client_subject_uk}
                        onChange={(e) => setSettings({ ...settings, client_subject_uk: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t({ uk: 'Тема (англійською)', en: 'Subject (English)' })}</Label>
                      <Input
                        value={settings.client_subject_en}
                        onChange={(e) => setSettings({ ...settings, client_subject_en: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ uk: 'Повідомлення (українською)', en: 'Message (Ukrainian)' })}</Label>
                    <Textarea
                      rows={4}
                      value={settings.client_message_uk}
                      onChange={(e) => setSettings({ ...settings, client_message_uk: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t({ uk: 'Повідомлення (англійською)', en: 'Message (English)' })}</Label>
                    <Textarea
                      rows={4}
                      value={settings.client_message_en}
                      onChange={(e) => setSettings({ ...settings, client_message_en: e.target.value })}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Test Email */}
          <Card>
            <CardHeader>
              <CardTitle>{t({ uk: 'Тестування', en: 'Testing' })}</CardTitle>
              <CardDescription>
                {t({ uk: 'Відправте тестовий лист для перевірки налаштувань', en: 'Send a test email to verify settings' })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  type="email"
                  placeholder="test@example.com"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleTestEmail} disabled={testing}>
                  {testing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  {t({ uk: 'Відправити тест', en: 'Send Test' })}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default EmailSettings;
