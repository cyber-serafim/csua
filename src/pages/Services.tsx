import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, Server, Shield, Zap, Cloud, Database, Lock, Smartphone, FileSearch, Camera, DoorOpen, Bell } from 'lucide-react';

const Services = () => {
  const { t } = useLanguage();

  const services = [
    {
      icon: Code,
      title: { uk: 'Веб-розробка', en: 'Web Development' },
      description: {
        uk: 'Розробка сучасних, швидких та надійних веб-додатків з використанням новітніх технологій. Від простих лендінгів до складних корпоративних систем.',
        en: 'Development of modern, fast and reliable web applications using the latest technologies. From simple landing pages to complex corporate systems.'
      }
    },
    {
      icon: Server,
      title: { uk: 'Серверні рішення', en: 'Server Solutions' },
      description: {
        uk: 'Налаштування, підтримка та оптимізація серверної інфраструктури. Забезпечуємо надійну роботу ваших систем 24/7.',
        en: 'Setup, maintenance and optimization of server infrastructure. We ensure reliable operation of your systems 24/7.'
      }
    },
    {
      icon: Shield,
      title: { uk: 'Кібербезпека', en: 'Cybersecurity' },
      description: {
        uk: 'Комплексний захист ваших даних та систем від кіберзагроз. Аудит безпеки, впровадження захисних механізмів та моніторинг.',
        en: 'Comprehensive protection of your data and systems from cyber threats. Security audits, implementation of protective mechanisms and monitoring.'
      }
    },
    {
      icon: Zap,
      title: { uk: 'Оптимізація продуктивності', en: 'Performance Optimization' },
      description: {
        uk: 'Аналіз та покращення швидкодії ваших додатків та систем. Підвищуємо ефективність та знижуємо витрати на інфраструктуру.',
        en: 'Analysis and improvement of your applications and systems performance. We increase efficiency and reduce infrastructure costs.'
      }
    },
    {
      icon: Cloud,
      title: { uk: 'Хмарні рішення', en: 'Cloud Solutions' },
      description: {
        uk: 'Міграція в хмару, налаштування хмарної інфраструктури. Працюємо з AWS, Azure, Google Cloud та іншими провайдерами.',
        en: 'Cloud migration, cloud infrastructure setup. We work with AWS, Azure, Google Cloud and other providers.'
      }
    },
    {
      icon: Database,
      title: { uk: 'Бази даних', en: 'Databases' },
      description: {
        uk: 'Проектування, налаштування та оптимізація баз даних. Забезпечуємо швидкий доступ до даних та їх надійне зберігання.',
        en: 'Database design, setup and optimization. We ensure fast data access and reliable storage.'
      }
    },
    {
      icon: Lock,
      title: { uk: 'Системи автентифікації', en: 'Authentication Systems' },
      description: {
        uk: 'Впровадження надійних систем авторизації та автентифікації користувачів. SSO, двофакторна автентифікація, біометрія.',
        en: 'Implementation of reliable user authorization and authentication systems. SSO, two-factor authentication, biometrics.'
      }
    },
    {
      icon: Smartphone,
      title: { uk: 'Мобільні додатки', en: 'Mobile Applications' },
      description: {
        uk: 'Розробка кросплатформних мобільних додатків для iOS та Android. Нативна якість з єдиною кодовою базою.',
        en: 'Development of cross-platform mobile applications for iOS and Android. Native quality with a single codebase.'
      }
    },
    {
      icon: FileSearch,
      title: { uk: 'ІТ Аудит', en: 'IT Audit' },
      description: {
        uk: 'Комплексний аналіз ІТ-інфраструктури вашої компанії. Виявлення вразливостей, оцінка ризиків та рекомендації щодо покращення безпеки.',
        en: 'Comprehensive analysis of your company\'s IT infrastructure. Identifying vulnerabilities, risk assessment and security improvement recommendations.'
      }
    },
    {
      icon: Camera,
      title: { uk: 'Відеоспостереження', en: 'Video Surveillance' },
      description: {
        uk: 'Проектування та встановлення систем відеоспостереження. IP-камери, архівація відео, віддалений доступ та інтелектуальна аналітика.',
        en: 'Design and installation of video surveillance systems. IP cameras, video archiving, remote access and intelligent analytics.'
      }
    },
    {
      icon: DoorOpen,
      title: { uk: 'Системи контролю доступу', en: 'Access Control Systems' },
      description: {
        uk: 'Впровадження сучасних систем контролю та обліку доступу. Картки, біометрія, контроль проходу та інтеграція з іншими системами безпеки.',
        en: 'Implementation of modern access control and accounting systems. Cards, biometrics, passage control and integration with other security systems.'
      }
    },
    {
      icon: Bell,
      title: { uk: 'Охоронна сигналізація', en: 'Security Alarm Systems' },
      description: {
        uk: 'Встановлення та налаштування охоронних систем. Датчики руху, протипожежна сигналізація, централізований моніторинг та швидке реагування.',
        en: 'Installation and configuration of security systems. Motion sensors, fire alarms, centralized monitoring and rapid response.'
      }
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className="hover:shadow-large transition-all duration-300 hover:-translate-y-1 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <CardHeader>
                <div className="w-14 h-14 bg-gradient-primary rounded-xl flex items-center justify-center mb-4 shadow-medium">
                  <service.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <CardTitle className="text-xl">{t(service.title)}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {t(service.description)}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Services;
