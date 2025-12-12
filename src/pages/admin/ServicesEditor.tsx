import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ServiceItem {
  id: string;
  icon_name: string;
  sort_order: number;
  is_active: boolean;
  title_uk: string;
  title_en: string;
  description_uk: string;
  description_en: string;
}

const availableIcons = [
  'Code', 'Server', 'Shield', 'Zap', 'Cloud', 'Database', 'Lock', 
  'Smartphone', 'FileSearch', 'Camera', 'DoorOpen', 'Bell', 'Monitor',
  'Cpu', 'HardDrive', 'Wifi', 'Globe', 'Mail', 'MessageSquare', 'Users',
  'Settings', 'Tool', 'Wrench', 'Key', 'Eye', 'ShieldCheck', 'AlertTriangle'
];

const ServicesEditor = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAdmin();
  }, []);

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
      navigate('/');
      return;
    }

    setIsAdmin(true);
    loadServices();
  };

  const loadServices = async () => {
    setIsLoading(true);
    
    const { data: servicesData, error } = await supabase
      .from('services')
      .select(`
        id,
        icon_name,
        sort_order,
        is_active,
        service_translations (
          language,
          title,
          description
        )
      `)
      .order('sort_order');

    if (error) {
      console.error('Error loading services:', error);
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося завантажити послуги', en: 'Failed to load services' }),
        variant: 'destructive'
      });
      setIsLoading(false);
      return;
    }

    const formattedServices: ServiceItem[] = (servicesData || []).map((service: any) => {
      const ukTrans = service.service_translations?.find((t: any) => t.language === 'uk');
      const enTrans = service.service_translations?.find((t: any) => t.language === 'en');
      
      return {
        id: service.id,
        icon_name: service.icon_name,
        sort_order: service.sort_order,
        is_active: service.is_active,
        title_uk: ukTrans?.title || '',
        title_en: enTrans?.title || '',
        description_uk: ukTrans?.description || '',
        description_en: enTrans?.description || ''
      };
    });

    setServices(formattedServices);
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
      for (const service of services) {
        // Update service
        await supabase
          .from('services')
          .update({
            icon_name: service.icon_name,
            sort_order: service.sort_order,
            is_active: service.is_active
          })
          .eq('id', service.id);

        // Update translations
        for (const lang of ['uk', 'en'] as const) {
          const title = lang === 'uk' ? service.title_uk : service.title_en;
          const description = lang === 'uk' ? service.description_uk : service.description_en;

          await supabase
            .from('service_translations')
            .upsert({
              service_id: service.id,
              language: lang,
              title,
              description
            }, { onConflict: 'service_id,language' });
        }
      }

      toast({
        title: t({ uk: 'Збережено!', en: 'Saved!' }),
        description: t({ uk: 'Послуги успішно оновлено', en: 'Services updated successfully' })
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося зберегти зміни', en: 'Failed to save changes' }),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addService = async () => {
    const newSortOrder = services.length > 0 
      ? Math.max(...services.map(s => s.sort_order)) + 1 
      : 1;

    const { data: newService, error } = await supabase
      .from('services')
      .insert({
        icon_name: 'Briefcase',
        sort_order: newSortOrder,
        is_active: true
      })
      .select()
      .single();

    if (error || !newService) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося додати послугу', en: 'Failed to add service' }),
        variant: 'destructive'
      });
      return;
    }

    // Add translations
    await supabase.from('service_translations').insert([
      { service_id: newService.id, language: 'uk', title: 'Нова послуга', description: 'Опис послуги' },
      { service_id: newService.id, language: 'en', title: 'New Service', description: 'Service description' }
    ]);

    setServices([...services, {
      id: newService.id,
      icon_name: 'Briefcase',
      sort_order: newSortOrder,
      is_active: true,
      title_uk: 'Нова послуга',
      title_en: 'New Service',
      description_uk: 'Опис послуги',
      description_en: 'Service description'
    }]);
  };

  const deleteService = async (id: string) => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);

    if (error) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося видалити послугу', en: 'Failed to delete service' }),
        variant: 'destructive'
      });
      return;
    }

    setServices(services.filter(s => s.id !== id));
  };

  const updateService = (id: string, field: keyof ServiceItem, value: any) => {
    setServices(services.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent ? <IconComponent className="h-5 w-5" /> : null;
  };

  if (!isAdmin || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: 'Редагування послуг', en: 'Edit Services' })}
            </h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addService}>
              <Plus className="mr-2 h-4 w-4" />
              {t({ uk: 'Додати', en: 'Add' })}
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving 
                ? t({ uk: 'Збереження...', en: 'Saving...' })
                : t({ uk: 'Зберегти все', en: 'Save All' })
              }
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="space-y-4">
          {services.map((service, index) => (
            <Card key={service.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <GripVertical className="h-5 w-5" />
                      <span className="text-sm">#{service.sort_order}</span>
                    </div>
                    <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground">
                      {getIconComponent(service.icon_name)}
                    </div>
                    <CardTitle className="text-lg">{service.title_uk}</CardTitle>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`active-${service.id}`} className="text-sm">
                        {t({ uk: 'Активна', en: 'Active' })}
                      </Label>
                      <Switch
                        id={`active-${service.id}`}
                        checked={service.is_active}
                        onCheckedChange={(checked) => updateService(service.id, 'is_active', checked)}
                      />
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => deleteService(service.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="uk">
                  <TabsList className="mb-4">
                    <TabsTrigger value="uk">🇺🇦 Українська</TabsTrigger>
                    <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
                    <TabsTrigger value="settings">{t({ uk: 'Налаштування', en: 'Settings' })}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="uk" className="space-y-4">
                    <div>
                      <Label>Назва</Label>
                      <Input
                        value={service.title_uk}
                        onChange={(e) => updateService(service.id, 'title_uk', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Опис</Label>
                      <Textarea
                        value={service.description_uk}
                        onChange={(e) => updateService(service.id, 'description_uk', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="en" className="space-y-4">
                    <div>
                      <Label>Title</Label>
                      <Input
                        value={service.title_en}
                        onChange={(e) => updateService(service.id, 'title_en', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Description</Label>
                      <Textarea
                        value={service.description_en}
                        onChange={(e) => updateService(service.id, 'description_en', e.target.value)}
                        rows={3}
                      />
                    </div>
                  </TabsContent>

                  <TabsContent value="settings" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t({ uk: 'Іконка', en: 'Icon' })}</Label>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground shrink-0">
                            {getIconComponent(service.icon_name)}
                          </div>
                          <Select
                            value={service.icon_name}
                            onValueChange={(value) => updateService(service.id, 'icon_name', value)}
                          >
                            <SelectTrigger className="flex-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {availableIcons.map((icon) => (
                                <SelectItem key={icon} value={icon}>
                                  <div className="flex items-center gap-2">
                                    {getIconComponent(icon)}
                                    <span>{icon}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div>
                        <Label>{t({ uk: 'Порядок', en: 'Sort Order' })}</Label>
                        <Input
                          type="number"
                          value={service.sort_order}
                          onChange={(e) => updateService(service.id, 'sort_order', parseInt(e.target.value) || 0)}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ServicesEditor;
