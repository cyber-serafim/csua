import { useEffect, useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Award, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const defaultValues = [
  {
    icon: Users,
    title: { uk: 'Команда експертів', en: 'Team of Experts' },
    description: {
      uk: 'Наша команда складається з досвідчених фахівців з багаторічним досвідом',
      en: 'Our team consists of experienced professionals with many years of experience'
    }
  },
  {
    icon: Award,
    title: { uk: 'Висока якість', en: 'High Quality' },
    description: {
      uk: 'Ми завжди прагнемо до найвищих стандартів якості в кожному проекті',
      en: 'We always strive for the highest quality standards in every project'
    }
  },
  {
    icon: Target,
    title: { uk: 'Орієнтація на результат', en: 'Result-Oriented' },
    description: {
      uk: 'Фокусуємось на досягненні конкретних бізнес-цілей наших клієнтів',
      en: 'We focus on achieving specific business goals of our clients'
    }
  },
  {
    icon: TrendingUp,
    title: { uk: 'Постійний розвиток', en: 'Continuous Development' },
    description: {
      uk: 'Завжди вивчаємо нові технології та вдосконалюємо наші навички',
      en: 'We always learn new technologies and improve our skills'
    }
  }
];

const icons = [Users, Award, Target, TrendingUp];

interface AboutContent {
  mission: { uk: string; en: string };
  history: { uk: string; en: string };
  values: Array<{
    title: { uk: string; en: string };
    description: { uk: string; en: string };
  }>;
}

const About = () => {
  const { t } = useLanguage();
  const [aboutContent, setAboutContent] = useState<AboutContent>({
    mission: {
      uk: 'Наша місія - надавати найкращі IT-рішення, які допомагають нашим клієнтам оптимізувати бізнес-процеси, підвищити ефективність та досягати стратегічних цілей. Ми віримо, що технології повинні бути доступними, зрозумілими та приносити реальну цінність.',
      en: 'Our mission is to provide the best IT solutions that help our clients optimize business processes, increase efficiency and achieve strategic goals. We believe that technology should be accessible, understandable and bring real value.'
    },
    history: {
      uk: 'Заснована в 2020 році, компанія CyberSecurity Ukraine швидко зарекомендувала себе як надійний партнер для бізнесу різного масштабу. За цей час ми реалізували десятки успішних проектів та допомогли багатьом компаніям вийти на новий рівень розвитку.',
      en: 'Founded in 2020, CyberSecurity Ukraine has quickly established itself as a reliable partner for businesses of all sizes. During this time, we have implemented dozens of successful projects and helped many companies reach a new level of development.'
    },
    values: defaultValues.map(v => ({ title: v.title, description: v.description }))
  });

  useEffect(() => {
    loadAboutContent();
  }, []);

  const loadAboutContent = async () => {
    try {
      const { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', 'about')
        .maybeSingle();

      if (!page) return;

      const { data: block } = await supabase
        .from('content_blocks')
        .select('*, content_block_translations(*)')
        .eq('page_id', page.id)
        .eq('block_type', 'about_content')
        .maybeSingle();

      if (block) {
        const translations = block.content_block_translations as Array<{
          language: string;
          content: { mission?: string; history?: string; values?: Array<{ title: string; description: string }> };
        }>;

        const ukBlock = translations?.find(t => t.language === 'uk');
        const enBlock = translations?.find(t => t.language === 'en');

        if (ukBlock?.content && enBlock?.content) {
          setAboutContent({
            mission: {
              uk: ukBlock.content.mission || aboutContent.mission.uk,
              en: enBlock.content.mission || aboutContent.mission.en
            },
            history: {
              uk: ukBlock.content.history || aboutContent.history.uk,
              en: enBlock.content.history || aboutContent.history.en
            },
            values: ukBlock.content.values?.map((ukVal, idx) => ({
              title: { uk: ukVal.title, en: enBlock.content?.values?.[idx]?.title || '' },
              description: { uk: ukVal.description, en: enBlock.content?.values?.[idx]?.description || '' }
            })) || aboutContent.values
          });
        }
      }
    } catch (error) {
      console.error('Error loading about content:', error);
    }
  };

  const valuesWithIcons = aboutContent.values.map((value, index) => ({
    ...value,
    icon: icons[index] || Users
  }));

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: 'Про нас', en: 'About Us' })}
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              {t({
                uk: 'CyberSecurity Ukraine - це команда професіоналів, які допомагають бізнесу досягати успіху через інноваційні IT-рішення.',
                en: 'CyberSecurity Ukraine is a team of professionals who help businesses succeed through innovative IT solutions.'
              })}
            </p>
          </div>

          <Card className="mb-12 shadow-large animate-fade-in">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t({ uk: 'Наша місія', en: 'Our Mission' })}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t(aboutContent.mission)}
              </p>
              <h2 className="text-2xl font-bold mb-4">
                {t({ uk: 'Наша історія', en: 'Our Story' })}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t(aboutContent.history)}
              </p>
            </CardContent>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t({ uk: 'Наші цінності', en: 'Our Values' })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {valuesWithIcons.map((value, index) => (
                <Card 
                  key={index} 
                  className="hover:shadow-large transition-all duration-300 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-4">
                      <value.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{t(value.title)}</h3>
                    <p className="text-muted-foreground">{t(value.description)}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
