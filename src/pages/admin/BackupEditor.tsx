import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface BackupContentItem {
  id: string;
  content_key: string;
  content_uk: string;
  content_en: string;
}

const BackupEditor = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [content, setContent] = useState<BackupContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
      .maybeSingle();

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
    fetchContent();
  };

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('backup_content')
      .select('*')
      .order('content_key');

    if (error) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
      return;
    }

    setContent(data || []);
    setLoading(false);
  };

  const handleChange = (id: string, field: 'content_uk' | 'content_en', value: string) => {
    setContent(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      for (const item of content) {
        const { error } = await supabase
          .from('backup_content')
          .update({ 
            content_uk: item.content_uk, 
            content_en: item.content_en 
          })
          .eq('id', item.id);

        if (error) throw error;
      }

      toast({
        title: t({ uk: 'Збережено', en: 'Saved' }),
        description: t({ uk: 'Зміни успішно збережено', en: 'Changes saved successfully' }),
      });
    } catch (error: any) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const getLabel = (key: string): string => {
    const labels: Record<string, { uk: string; en: string }> = {
      page_title: { uk: 'Заголовок сторінки', en: 'Page title' },
      important_info_title: { uk: 'Важлива інформація - заголовок', en: 'Important info - title' },
      important_info_text: { uk: 'Важлива інформація - текст', en: 'Important info - text' },
      code_backup_title: { uk: 'Бекап коду - заголовок', en: 'Code backup - title' },
      code_backup_description: { uk: 'Бекап коду - опис', en: 'Code backup - description' },
      method_github_title: { uk: 'Метод GitHub - заголовок', en: 'GitHub method - title' },
      method_github_text: { uk: 'Метод GitHub - текст', en: 'GitHub method - text' },
      method_download_title: { uk: 'Метод завантаження - заголовок', en: 'Download method - title' },
      method_download_text: { uk: 'Метод завантаження - текст', en: 'Download method - text' },
      db_backup_title: { uk: 'Бекап БД - заголовок', en: 'DB backup - title' },
      db_backup_description: { uk: 'Бекап БД - опис', en: 'DB backup - description' },
      db_backup_alert: { uk: 'Бекап БД - попередження', en: 'DB backup - alert' },
      export_schema_title: { uk: 'Експорт схеми - заголовок', en: 'Export schema - title' },
      export_schema_text: { uk: 'Експорт схеми - текст', en: 'Export schema - text' },
      export_data_title: { uk: 'Експорт даних - заголовок', en: 'Export data - title' },
      export_data_text: { uk: 'Експорт даних - текст', en: 'Export data - text' },
      full_backup_title: { uk: 'Повний бекап - заголовок', en: 'Full backup - title' },
      full_backup_text: { uk: 'Повний бекап - текст', en: 'Full backup - text' },
      restore_title: { uk: 'Відновлення - заголовок', en: 'Restore - title' },
      restore_description: { uk: 'Відновлення - опис', en: 'Restore - description' },
      step1_title: { uk: 'Крок 1 - заголовок', en: 'Step 1 - title' },
      step2_title: { uk: 'Крок 2 - заголовок', en: 'Step 2 - title' },
      step2_text: { uk: 'Крок 2 - текст', en: 'Step 2 - text' },
      step3_title: { uk: 'Крок 3 - заголовок', en: 'Step 3 - title' },
      step3_text: { uk: 'Крок 3 - текст', en: 'Step 3 - text' },
      step4_title: { uk: 'Крок 4 - заголовок', en: 'Step 4 - title' },
      step4_text: { uk: 'Крок 4 - текст', en: 'Step 4 - text' },
      step5_title: { uk: 'Крок 5 - заголовок', en: 'Step 5 - title' },
      step6_title: { uk: 'Крок 6 - заголовок', en: 'Step 6 - title' },
      step6_text: { uk: 'Крок 6 - текст', en: 'Step 6 - text' },
      dont_forget_title: { uk: 'Не забудьте - заголовок', en: "Don't forget - title" },
      dont_forget_item1: { uk: 'Не забудьте - пункт 1', en: "Don't forget - item 1" },
      dont_forget_item2: { uk: 'Не забудьте - пункт 2', en: "Don't forget - item 2" },
      dont_forget_item3: { uk: 'Не забудьте - пункт 3', en: "Don't forget - item 3" },
      dont_forget_item4: { uk: 'Не забудьте - пункт 4', en: "Don't forget - item 4" },
    };
    return t(labels[key] || { uk: key, en: key });
  };

  const isLongText = (key: string): boolean => {
    return key.includes('_text') || key.includes('_alert') || key.includes('_description');
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/admin/backup')}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: 'Редагування контенту Backup', en: 'Edit Backup Content' })}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            {t({ uk: 'Зберегти', en: 'Save' })}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs defaultValue="uk" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="uk">Українська</TabsTrigger>
            <TabsTrigger value="en">English</TabsTrigger>
          </TabsList>

          <TabsContent value="uk" className="space-y-4">
            {content.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {getLabel(item.content_key)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLongText(item.content_key) ? (
                    <Textarea
                      value={item.content_uk}
                      onChange={(e) => handleChange(item.id, 'content_uk', e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={item.content_uk}
                      onChange={(e) => handleChange(item.id, 'content_uk', e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="en" className="space-y-4">
            {content.map((item) => (
              <Card key={item.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {getLabel(item.content_key)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLongText(item.content_key) ? (
                    <Textarea
                      value={item.content_en}
                      onChange={(e) => handleChange(item.id, 'content_en', e.target.value)}
                      rows={3}
                    />
                  ) : (
                    <Input
                      value={item.content_en}
                      onChange={(e) => handleChange(item.id, 'content_en', e.target.value)}
                    />
                  )}
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default BackupEditor;
