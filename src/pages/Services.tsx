import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';

interface ServiceData {
  id: string;
  icon_name: string;
  title: { uk: string; en: string };
  description: { uk: string; en: string };
}

const Services = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [services, setServices] = useState<ServiceData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
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
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      console.error('Error loading services:', error);
      setIsLoading(false);
      return;
    }

    const formattedServices: ServiceData[] = (data || []).map((service: any) => {
      const ukTrans = service.service_translations?.find((t: any) => t.language === 'uk');
      const enTrans = service.service_translations?.find((t: any) => t.language === 'en');
      
      return {
        id: service.id,
        icon_name: service.icon_name,
        title: {
          uk: ukTrans?.title || '',
          en: enTrans?.title || ''
        },
        description: {
          uk: ukTrans?.description || '',
          en: enTrans?.description || ''
        }
      };
    });

    setServices(formattedServices);
    setIsLoading(false);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Briefcase;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            {t({ uk: 'Наші послуги', en: 'Our Services' })}
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            {t({
              uk: 'Ми пропонуємо повний спектр IT-послуг для вирішення будь-яких бізнес-завдань',
              en: 'We offer a full range of IT services to solve any business challenges'
            })}
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <p className="text-muted-foreground">{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => {
              const IconComponent = getIconComponent(service.icon_name);
              return (
                <Card 
                  key={service.id} 
                  className="hover:shadow-large transition-all duration-300 hover:-translate-y-1 animate-fade-in cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => navigate(`/services/${service.id}`)}
                >
                  <CardHeader>
                    <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-medium">
                      <IconComponent className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-xl">{t(service.title)}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base leading-relaxed">
                      {t(service.description)}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
};

export default Services;
