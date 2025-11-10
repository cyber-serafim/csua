import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Users, Award, Target, TrendingUp } from 'lucide-react';

const About = () => {
  const { t } = useLanguage();

  const values = [
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
                uk: 'CompIT Service - це команда професіоналів, які допомагають бізнесу досягати успіху через інноваційні IT-рішення.',
                en: 'CompIT Service is a team of professionals who help businesses succeed through innovative IT solutions.'
              })}
            </p>
          </div>

          <Card className="mb-12 shadow-large animate-fade-in">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">
                {t({ uk: 'Наша місія', en: 'Our Mission' })}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                {t({
                  uk: 'Наша місія - надавати найкращі IT-рішення, які допомагають нашим клієнтам оптимізувати бізнес-процеси, підвищити ефективність та досягати стратегічних цілей. Ми віримо, що технології повинні бути доступними, зрозумілими та приносити реальну цінність.',
                  en: 'Our mission is to provide the best IT solutions that help our clients optimize business processes, increase efficiency and achieve strategic goals. We believe that technology should be accessible, understandable and bring real value.'
                })}
              </p>
              <h2 className="text-2xl font-bold mb-4">
                {t({ uk: 'Наша історія', en: 'Our Story' })}
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                {t({
                  uk: 'Заснована в 2020 році, компанія CompIT Service швидко зарекомендувала себе як надійний партнер для бізнесу різного масштабу. За цей час ми реалізували десятки успішних проектів та допомогли багатьом компаніям вийти на новий рівень розвитку.',
                  en: 'Founded in 2020, CompIT Service has quickly established itself as a reliable partner for businesses of all sizes. During this time, we have implemented dozens of successful projects and helped many companies reach a new level of development.'
                })}
              </p>
            </CardContent>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">
              {t({ uk: 'Наші цінності', en: 'Our Values' })}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {values.map((value, index) => (
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
