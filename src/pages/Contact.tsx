import { useLanguage } from '@/contexts/LanguageContext';
import { Navigation } from '@/components/Navigation';
import { Footer } from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Mail, Phone, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface ContactInfo {
  email: string;
  phone: string;
  address: { uk: string; en: string };
}

const Contact = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [contactInfo, setContactInfo] = useState<ContactInfo>({
    email: 'info@csua.biz.ua',
    phone: '+380 (95) 8-777-99-7',
    address: { uk: 'Київ, Україна', en: 'Kyiv, Ukraine' }
  });

  useEffect(() => {
    loadContactInfo();
  }, []);

  const loadContactInfo = async () => {
    const { data: page } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', 'contact')
      .maybeSingle();

    if (!page) return;

    const { data: blocks } = await supabase
      .from('content_blocks')
      .select('*, content_block_translations(*)')
      .eq('page_id', page.id)
      .eq('block_type', 'contact_info')
      .maybeSingle();

    if (blocks) {
      const blockTrans = blocks.content_block_translations as Array<{
        language: string;
        content: { email?: string; phone?: string; address?: string };
      }>;
      const ukBlock = blockTrans?.find(t => t.language === 'uk');
      const enBlock = blockTrans?.find(t => t.language === 'en');

      setContactInfo({
        email: ukBlock?.content?.email || 'info@csua.biz.ua',
        phone: ukBlock?.content?.phone || '+380 (95) 8-777-99-7',
        address: {
          uk: ukBlock?.content?.address || 'Київ, Україна',
          en: enBlock?.content?.address || 'Kyiv, Ukraine'
        }
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: t({ uk: 'Повідомлення надіслано!', en: 'Message sent!' }),
      description: t({ 
        uk: "Ми зв'яжемося з вами найближчим часом.", 
        en: 'We will contact you soon.' 
      }),
    });
    setFormData({ name: '', email: '', phone: '', message: '' });
  };

  const contactItems = [
    {
      icon: Mail,
      title: { uk: 'Email', en: 'Email' },
      value: contactInfo.email
    },
    {
      icon: Phone,
      title: { uk: 'Телефон', en: 'Phone' },
      value: contactInfo.phone
    },
    {
      icon: MapPin,
      title: { uk: 'Адреса', en: 'Address' },
      value: contactInfo.address[language]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Navigation />
      
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: "Зв'яжіться з нами", en: 'Contact Us' })}
            </h1>
            <p className="text-xl text-muted-foreground">
              {t({
                uk: 'Маєте питання? Ми завжди раді допомогти!',
                en: 'Have questions? We are always happy to help!'
              })}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactItems.map((info, index) => (
              <Card 
                key={index} 
                className="text-center hover:shadow-large transition-all duration-300 animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-2">
                    <info.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <CardTitle className="text-lg">{t(info.title)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {info.value}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="shadow-large animate-fade-in">
            <CardHeader>
              <CardTitle className="text-2xl">
                {t({ uk: 'Надішліть нам повідомлення', en: 'Send us a message' })}
              </CardTitle>
              <CardDescription>
                {t({
                  uk: "Заповніть форму і ми зв'яжемося з вами найближчим часом",
                  en: 'Fill out the form and we will contact you soon'
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {t({ uk: "Ім'я", en: 'Name' })}
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">
                    {t({ uk: 'Телефон', en: 'Phone' })}
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">
                    {t({ uk: 'Повідомлення', en: 'Message' })}
                  </Label>
                  <Textarea
                    id="message"
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" size="lg" className="w-full md:w-auto shadow-medium">
                  {t({ uk: 'Надіслати', en: 'Send' })}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Contact;
