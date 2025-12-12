import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Edit, Eye, Globe, Home, Info, Phone, Briefcase } from 'lucide-react';
import * as Icons from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy
} from '@dnd-kit/sortable';
import SortableServiceCard from '@/components/admin/SortableServiceCard';

interface PageData {
  slug: string;
  title: { uk: string; en: string };
  icon: React.ElementType;
  description: { uk: string; en: string };
}

interface ServiceItem {
  id: string;
  icon_name: string;
  title: { uk: string; en: string };
}

const staticPages: PageData[] = [
  {
    slug: 'home',
    title: { uk: 'Головна', en: 'Home' },
    icon: Home,
    description: { uk: 'Головна сторінка сайту', en: 'Website home page' }
  },
  {
    slug: 'services',
    title: { uk: 'Послуги', en: 'Services' },
    icon: Briefcase,
    description: { uk: 'Сторінка послуг компанії', en: 'Company services page' }
  },
  {
    slug: 'about',
    title: { uk: 'Про нас', en: 'About Us' },
    icon: Info,
    description: { uk: 'Інформація про компанію', en: 'Company information' }
  },
  {
    slug: 'contact',
    title: { uk: 'Контакти', en: 'Contact' },
    icon: Phone,
    description: { uk: 'Контактна інформація', en: 'Contact information' }
  }
];

const PagesList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = services.findIndex(s => s.id === active.id);
    const newIndex = services.findIndex(s => s.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newServices = arrayMove(services, oldIndex, newIndex);
      setServices(newServices);
      
      // Save new order to database
      setIsSaving(true);
      try {
        for (let i = 0; i < newServices.length; i++) {
          await supabase
            .from('services')
            .update({ sort_order: i + 1 })
            .eq('id', newServices[i].id);
        }
      } catch (error) {
        console.error('Error saving order:', error);
        toast({
          title: t({ uk: 'Помилка', en: 'Error' }),
          description: t({ uk: 'Не вдалося зберегти порядок', en: 'Failed to save order' }),
          variant: 'destructive'
        });
      } finally {
        setIsSaving(false);
      }
    }
  };

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadServices();
    }
  }, [isAdmin]);

  const loadServices = async () => {
    const { data, error } = await supabase
      .from('services')
      .select(`
        id,
        icon_name,
        service_translations (
          language,
          title
        )
      `)
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error loading services:', error);
      return;
    }

    const formattedServices: ServiceItem[] = (data || []).map((service: any) => {
      const ukTrans = service.service_translations?.find((t: any) => t.language === 'uk');
      const enTrans = service.service_translations?.find((t: any) => t.language === 'en');
      
      return {
        id: service.id,
        icon_name: service.icon_name,
        title: {
          uk: ukTrans?.title || '',
          en: enTrans?.title || ''
        }
      };
    });

    setServices(formattedServices);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Briefcase;
  };

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

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t({ uk: 'Управління сторінками', en: 'Pages Management' })}
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {staticPages.map((page) => (
            <Card key={page.slug} className="hover:shadow-large transition-all duration-300">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                      <page.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle>{t(page.title)}</CardTitle>
                      <CardDescription className="mt-1">
                        {t(page.description)}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary">
                    <Globe className="h-3 w-3 mr-1" />
                    UK/EN
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Button 
                    className="flex-1"
                    onClick={() => {
                      if (page.slug === 'services') {
                        navigate('/admin/services');
                      } else {
                        navigate(`/admin/pages/${page.slug}`);
                      }
                    }}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    {t({ uk: 'Редагувати', en: 'Edit' })}
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => window.open(page.slug === 'home' ? '/' : `/${page.slug}`, '_blank')}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Services Pages Section */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: 'Редагувати сторінки послуг', en: 'Edit Service Pages' })}
            </h2>
            {isSaving && (
              <span className="text-sm text-muted-foreground">
                {t({ uk: 'Збереження...', en: 'Saving...' })}
              </span>
            )}
          </div>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={services.map(s => s.id)}
              strategy={rectSortingStrategy}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service) => (
                  <SortableServiceCard key={service.id} service={service} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      </main>
    </div>
  );
};

export default PagesList;
