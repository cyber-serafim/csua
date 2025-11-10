import { useLanguage } from '@/contexts/LanguageContext';
import { Link } from 'react-router-dom';

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="bg-muted/50 border-t border-border mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              CompIT Service
            </h3>
            <p className="text-muted-foreground">
              {t({
                uk: 'Професійні IT послуги для вашого бізнесу',
                en: 'Professional IT services for your business'
              })}
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">
              {t({ uk: 'Навігація', en: 'Navigation' })}
            </h4>
            <div className="flex flex-col gap-2">
              <Link to="/" className="text-muted-foreground hover:text-primary transition-colors">
                {t({ uk: 'Головна', en: 'Home' })}
              </Link>
              <Link to="/services" className="text-muted-foreground hover:text-primary transition-colors">
                {t({ uk: 'Послуги', en: 'Services' })}
              </Link>
              <Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">
                {t({ uk: 'Про нас', en: 'About' })}
              </Link>
              <Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">
                {t({ uk: 'Контакти', en: 'Contact' })}
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-4">
              {t({ uk: 'Контакти', en: 'Contact' })}
            </h4>
            <div className="text-muted-foreground space-y-2">
              <p>Email: info@compitservice.com</p>
              <p>Tel: +380 (XX) XXX-XX-XX</p>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
          <p>© 2024 CompIT Service. {t({ uk: 'Всі права захищені.', en: 'All rights reserved.' })}</p>
        </div>
      </div>
    </footer>
  );
};
