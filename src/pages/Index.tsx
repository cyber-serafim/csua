import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight, Code, Server, Shield, Zap } from 'lucide-react';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface HomeService {
  icon: string;
  title: { uk: string; en: string };
  description: { uk: string; en: string };
}

interface ServicesSection {
  title: { uk: string; en: string };
  subtitle: { uk: string; en: string };
  services: HomeService[];
}

const defaultServices: ServicesSection = {
  title: { uk: 'Наші послуги', en: 'Our Services' },
  subtitle: { 
    uk: 'Ми пропонуємо широкий спектр IT-послуг для бізнесу будь-якого масштабу', 
    en: 'We offer a wide range of IT services for businesses of any scale' 
  },
  services: [
    { icon: 'Code', title: { uk: 'Веб-розробка', en: 'Web Development' }, description: { uk: 'Створення сучасних веб-додатків та сайтів', en: 'Building modern web applications and websites' } },
    { icon: 'Server', title: { uk: 'Серверні рішення', en: 'Server Solutions' }, description: { uk: 'Налаштування та підтримка серверної інфраструктури', en: 'Setup and maintenance of server infrastructure' } },
    { icon: 'Shield', title: { uk: 'Кібербезпека', en: 'Cybersecurity' }, description: { uk: 'Захист ваших даних та систем', en: 'Protection of your data and systems' } },
    { icon: 'Zap', title: { uk: 'Оптимізація', en: 'Optimization' }, description: { uk: 'Підвищення продуктивності IT-інфраструктури', en: 'Improving IT infrastructure performance' } }
  ]
};

const Index = () => {
  const { t } = useLanguage();
  const [servicesSection, setServicesSection] = useState<ServicesSection>(defaultServices);

  useEffect(() => {
    loadServicesSection();
  }, []);

  const loadServicesSection = async () => {
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'home')
      .maybeSingle();

    if (!page) return;

    const { data: block } = await supabase
      .from('content_blocks')
      .select('*, content_block_translations(*)')
      .eq('page_id', page.id)
      .eq('block_type', 'home_services')
      .maybeSingle();

    if (block) {
      const blockTrans = block.content_block_translations as Array<{
        language: string;
        content: { 
          sectionTitle?: string; 
          sectionSubtitle?: string; 
          services?: Array<{ icon: string; title: string; description: string }> 
        };
      }>;
      const ukBlock = blockTrans?.find(t => t.language === 'uk');
      const enBlock = blockTrans?.find(t => t.language === 'en');
      
      if (ukBlock?.content?.services && enBlock?.content?.services) {
        setServicesSection({
          title: {
            uk: ukBlock?.content?.sectionTitle || defaultServices.title.uk,
            en: enBlock?.content?.sectionTitle || defaultServices.title.en
          },
          subtitle: {
            uk: ukBlock?.content?.sectionSubtitle || defaultServices.subtitle.uk,
            en: enBlock?.content?.sectionSubtitle || defaultServices.subtitle.en
          },
          services: ukBlock.content.services.map((ukSvc, idx) => ({
            icon: ukSvc.icon,
            title: { uk: ukSvc.title, en: enBlock.content?.services?.[idx]?.title || '' },
            description: { uk: ukSvc.description, en: enBlock.content?.services?.[idx]?.description || '' }
          }))
        });
      }
    }
  };

  const getIconComponent = (iconName: string) => {
    const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
    return IconComponent || Icons.Briefcase;
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-fade-in">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {t({
                uk: 'Професійні IT-рішення для вашого бізнесу',
                en: 'Professional IT Solutions for Your Business'
              })}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t({
                uk: 'Ми допомагаємо компаніям досягати успіху через інноваційні технології',
                en: 'We help companies succeed through innovative technologies'
              })}
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link to="/contact">
                <Button size="lg" className="shadow-medium">
                  {t({ uk: "Зв'язатися з нами", en: 'Contact Us' })}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/services">
                <Button size="lg" variant="outline">
                  {t({ uk: 'Наші послуги', en: 'Our Services' })}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t(servicesSection.title)}
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {t(servicesSection.subtitle)}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {servicesSection.services.map((service, index) => {
            const IconComponent = getIconComponent(service.icon);
            return (
              <Card key={index} className="hover:shadow-large transition-all duration-300 hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                    <IconComponent className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle>{t(service.title)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{t(service.description)}</CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-gradient-hero text-primary-foreground border-0 shadow-large">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              {t({
                uk: 'Готові розпочати проект?',
                en: 'Ready to Start a Project?'
              })}
            </h2>
            <p className="text-lg mb-8 opacity-90">
              {t({
                uk: "Зв'яжіться з нами сьогодні для безкоштовної консультації",
                en: 'Contact us today for a free consultation'
              })}
            </p>
            <Link to="/contact">
              <Button size="lg" variant="secondary" className="shadow-medium">
                {t({ uk: "Зв'язатися", en: 'Get in Touch' })}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
