import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Save } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ServiceData {
  id: string;
  icon_name: string;
  title: { uk: string; en: string };
  description: { uk: string; en: string };
}

const availableIcons = [
  'Shield', 'Lock', 'Camera', 'Eye', 'Key', 'Fingerprint', 
  'Scan', 'Wifi', 'Server', 'Database', 'Cloud', 'Monitor',
  'Smartphone', 'Laptop', 'HardDrive', 'Cpu', 'Network', 'Globe',
  'FileSearch', 'ShieldCheck', 'ShieldAlert', 'UserCheck', 'Briefcase'
];

const ServicePageEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [service, setService] = useState<ServiceData | null>(null);

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin && id) {
      loadService();
    }
  }, [isAdmin, id]);

  const checkAdmin = async () => {
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
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
  };

  const loadService = async () => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        icon_name,
        service_translations (
          language,
          title,
          description
        )
      `)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error loading service:', error);
      toast({
        title: t({ uk: 'Помилка завантаження', en: 'Loading error' }),
        variant: 'destructive',
      });
      setIsLoading(false);
      return;
    }

    if (!data) {
      toast({
        title: t({ uk: 'Послугу не знайдено', en: 'Service not found' }),
        variant: 'destructive',
      });
      navigate('/admin/pages');
      return;
    }

    const ukTrans = data.service_translations?.find((t: any) => t.language === 'uk');
    const enTrans = data.service_translations?.find((t: any) => t.language === 'en');
    
    setService({
      id: data.id,
      icon_name: data.icon_name,
      title: {
        uk: ukTrans?.title || '',
        en: enTrans?.title || ''
      },
      description: {
        uk: ukTrans?.description || '',
        en: enTrans?.description || ''
      }
    });

    setIsLoading(false);
  };

  const handleSave = async () => {
    if (!service) return;

    setIsSaving(true);

    try {
      // Update service icon
      const { error: serviceError } = await supabase
        .from('services')
        .update({ icon_name: service.icon_name })
        .eq('id', service.id);

      if (serviceError) throw serviceError;

      // Update translations
      for (const lang of ['uk', 'en'] as const) {
        const { error: transError } = await supabase
          .from('service_translations')
          .upsert({
            service_id: service.id,
            language: lang,
            title: service.title[lang],
            description: service.description[lang]
          }, {
            onConflict: 'service_id,language'
          });

        if (transError) throw transError;
      }

      toast({
        title: t({ uk: 'Збережено!', en: 'Saved!' }),
        description: t({ uk: 'Зміни успішно збережено', en: 'Changes saved successfully' }),
      });
    } catch (error) {
      console.error('Error saving service:', error);
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося зберегти зміни', en: 'Failed to save changes' }),
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateService = (field: keyof ServiceData, value: any) => {
    if (!service) return;
    setService({ ...service, [field]: value });
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Briefcase;
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Послугу не знайдено', en: 'Service not found' })}</p>
      </div>
    );
  }

  const IconComponent = getIconComponent(service.icon_name);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <IconComponent className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {t(service.title) || t({ uk: 'Редагування послуги', en: 'Edit Service' })}
              </h1>
            </div>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving 
              ? t({ uk: 'Збереження...', en: 'Saving...' })
              : t({ uk: 'Зберегти', en: 'Save' })
            }
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>{t({ uk: 'Налаштування послуги', en: 'Service Settings' })}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>{t({ uk: 'Іконка', en: 'Icon' })}</Label>
              <Select
                value={service.icon_name}
                onValueChange={(value) => updateService('icon_name', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {availableIcons.map((iconName) => {
                    const Icon = getIconComponent(iconName);
                    return (
                      <SelectItem key={iconName} value={iconName}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{iconName}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="uk" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="uk">🇺🇦 Українська</TabsTrigger>
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
          </TabsList>

          <TabsContent value="uk">
            <Card>
              <CardHeader>
                <CardTitle>{t({ uk: 'Контент (Українська)', en: 'Content (Ukrainian)' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ uk: 'Назва послуги', en: 'Service Title' })}</Label>
                  <Input
                    value={service.title.uk}
                    onChange={(e) => updateService('title', { ...service.title, uk: e.target.value })}
                    placeholder="Назва послуги"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ uk: 'Опис послуги', en: 'Service Description' })}</Label>
                  <Textarea
                    value={service.description.uk}
                    onChange={(e) => updateService('description', { ...service.description, uk: e.target.value })}
                    placeholder="Детальний опис послуги"
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="en">
            <Card>
              <CardHeader>
                <CardTitle>{t({ uk: 'Контент (English)', en: 'Content (English)' })}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>{t({ uk: 'Назва послуги', en: 'Service Title' })}</Label>
                  <Input
                    value={service.title.en}
                    onChange={(e) => updateService('title', { ...service.title, en: e.target.value })}
                    placeholder="Service title"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t({ uk: 'Опис послуги', en: 'Service Description' })}</Label>
                  <Textarea
                    value={service.description.en}
                    onChange={(e) => updateService('description', { ...service.description, en: e.target.value })}
                    placeholder="Detailed service description"
                    rows={10}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6">
          <Button 
            variant="outline" 
            onClick={() => window.open(`/services/${service.id}`, '_blank')}
          >
            {t({ uk: 'Переглянути сторінку послуги', en: 'View Service Page' })}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default ServicePageEditor;
