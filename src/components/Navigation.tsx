import { Link } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

export const Navigation = () => {
  const { language, setLanguage, t } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: { uk: 'Головна', en: 'Home' } },
    { to: '/services', label: { uk: 'Послуги', en: 'Services' } },
    { to: '/about', label: { uk: 'Про нас', en: 'About' } },
    { to: '/contact', label: { uk: 'Контакти', en: 'Contact' } },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            CompIT Service
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-foreground hover:text-primary transition-colors"
              >
                {t(link.label)}
              </Link>
            ))}
            <div className="flex gap-2">
              <Button
                variant={language === 'uk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('uk')}
              >
                UA
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="block py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t(link.label)}
              </Link>
            ))}
            <div className="flex gap-2 mt-4">
              <Button
                variant={language === 'uk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('uk')}
              >
                UA
              </Button>
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setLanguage('en')}
              >
                EN
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
