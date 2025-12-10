import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import * as Icons from 'lucide-react';
import { ArrowLeft } from 'lucide-react';

interface ServiceData {
  id: string;
  icon_name: string;
  title: { uk: string; en: string };
  description: { uk: string; en: string };
}

const ServiceDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [service, setService] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadService();
    }
  }, [id]);

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
      .single();

    if (error) {
      console.error('Error loading service:', error);
      setIsLoading(false);
      return;
    }

    if (data) {
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
    }

    setIsLoading(false);
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Briefcase;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-20 flex justify-center">
          <p className="text-muted-foreground">{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-gradient-subtle">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold mb-4">{t({ uk: 'Послугу не знайдено', en: 'Service not found' })}</h1>
          <Button onClick={() => navigate('/services')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t({ uk: 'Повернутися до послуг', en: 'Back to services' })}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const IconComponent = getIconComponent(service.icon_name);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <section className="container mx-auto px-4 py-20">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/services')}
          className="mb-8"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t({ uk: 'Назад до послуг', en: 'Back to services' })}
        </Button>

        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex items-center gap-6 mb-8">
            <div className="w-20 h-20 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-large">
              <IconComponent className="h-10 w-10 text-primary-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t(service.title)}
            </h1>
          </div>

          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-muted-foreground leading-relaxed whitespace-pre-line">
              {t(service.description)}
            </p>
          </div>

          <div className="mt-12 p-6 bg-card rounded-xl border shadow-medium">
            <h2 className="text-2xl font-semibold mb-4">
              {t({ uk: 'Зацікавила послуга?', en: 'Interested in this service?' })}
            </h2>
            <p className="text-muted-foreground mb-6">
              {t({ 
                uk: "Зв'яжіться з нами для отримання детальної консультації та індивідуальної пропозиції.", 
                en: 'Contact us for a detailed consultation and personalized offer.' 
              })}
            </p>
            <Button onClick={() => navigate('/contact')} size="lg">
              {t({ uk: "Зв'язатися з нами", en: 'Contact us' })}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ServiceDetail;
