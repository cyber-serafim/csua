import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { ArrowLeft, Save, Plus, Trash2, GripVertical } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import * as Icons from 'lucide-react';

const availableIcons = [
  'Code', 'Server', 'Shield', 'Zap', 'Cloud', 'Database', 'Lock', 
  'Smartphone', 'FileSearch', 'Camera', 'DoorOpen', 'Bell', 'Monitor',
  'Cpu', 'HardDrive', 'Wifi', 'Globe', 'Mail', 'MessageSquare', 'Users',
  'Settings', 'Tool', 'Wrench', 'Key', 'Eye', 'ShieldCheck', 'AlertTriangle',
  'Briefcase', 'Scan', 'Network', 'Fingerprint', 'UserCheck', 'ShieldAlert'
];

const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  return IconComponent || Icons.Briefcase;
};

interface ContentBlock {
  id: string;
  type: string;
  content: {
    uk: Record<string, string>;
    en: Record<string, string>;
  };
  sortOrder: number;
}

interface PageContent {
  title: { uk: string; en: string };
  metaDescription: { uk: string; en: string };
  heroTitle: { uk: string; en: string };
  heroSubtitle: { uk: string; en: string };
  sections: ContentBlock[];
  // Contact page specific fields
  contactEmail?: string;
  contactPhone?: string;
  contactAddress?: { uk: string; en: string };
  // About page specific fields
  aboutMission?: { uk: string; en: string };
  aboutHistory?: { uk: string; en: string };
  aboutValues?: Array<{
    title: { uk: string; en: string };
    description: { uk: string; en: string };
  }>;
  // Home page services section
  servicesSectionTitle?: { uk: string; en: string };
  servicesSectionSubtitle?: { uk: string; en: string };
  homeServices?: Array<{
    icon: string;
    title: { uk: string; en: string };
    description: { uk: string; en: string };
  }>;
}

const defaultContent: Record<string, PageContent> = {
  home: {
    title: { uk: 'Головна', en: 'Home' },
    metaDescription: { 
      uk: 'CyberSecurity Ukraine - Професійні IT-рішення для вашого бізнесу', 
      en: 'CyberSecurity Ukraine - Professional IT Solutions for Your Business' 
    },
    heroTitle: { 
      uk: 'Професійні IT-рішення для вашого бізнесу', 
      en: 'Professional IT Solutions for Your Business' 
    },
    heroSubtitle: { 
      uk: 'Ми допомагаємо компаніям досягати успіху через інноваційні технології', 
      en: 'We help companies succeed through innovative technologies' 
    },
    sections: [],
    servicesSectionTitle: { uk: 'Наші послуги', en: 'Our Services' },
    servicesSectionSubtitle: { 
      uk: 'Ми пропонуємо широкий спектр IT-послуг для бізнесу будь-якого масштабу', 
      en: 'We offer a wide range of IT services for businesses of any scale' 
    },
    homeServices: [
      { icon: 'Code', title: { uk: 'Веб-розробка', en: 'Web Development' }, description: { uk: 'Створення сучасних веб-додатків та сайтів', en: 'Building modern web applications and websites' } },
      { icon: 'Server', title: { uk: 'Серверні рішення', en: 'Server Solutions' }, description: { uk: 'Налаштування та підтримка серверної інфраструктури', en: 'Setup and maintenance of server infrastructure' } },
      { icon: 'Shield', title: { uk: 'Кібербезпека', en: 'Cybersecurity' }, description: { uk: 'Захист ваших даних та систем', en: 'Protection of your data and systems' } },
      { icon: 'Zap', title: { uk: 'Оптимізація', en: 'Optimization' }, description: { uk: 'Підвищення продуктивності IT-інфраструктури', en: 'Improving IT infrastructure performance' } }
    ]
  },
  services: {
    title: { uk: 'Послуги', en: 'Services' },
    metaDescription: { 
      uk: 'Наші IT-послуги для бізнесу', 
      en: 'Our IT services for business' 
    },
    heroTitle: { 
      uk: 'Наші послуги', 
      en: 'Our Services' 
    },
    heroSubtitle: { 
      uk: 'Ми пропонуємо повний спектр IT-послуг для вирішення будь-яких бізнес-завдань', 
      en: 'We offer a full range of IT services to solve any business challenges' 
    },
    sections: []
  },
  about: {
    title: { uk: 'Про нас', en: 'About Us' },
    metaDescription: { 
      uk: 'Про компанію CyberSecurity Ukraine', 
      en: 'About CyberSecurity Ukraine' 
    },
    heroTitle: { 
      uk: 'Про нас', 
      en: 'About Us' 
    },
    heroSubtitle: { 
      uk: 'CyberSecurity Ukraine - це команда професіоналів, які допомагають бізнесу досягати успіху через інноваційні IT-рішення.', 
      en: 'CyberSecurity Ukraine is a team of professionals who help businesses succeed through innovative IT solutions.' 
    },
    sections: [],
    aboutMission: {
      uk: 'Наша місія - надавати найкращі IT-рішення, які допомагають нашим клієнтам оптимізувати бізнес-процеси, підвищити ефективність та досягати стратегічних цілей. Ми віримо, що технології повинні бути доступними, зрозумілими та приносити реальну цінність.',
      en: 'Our mission is to provide the best IT solutions that help our clients optimize business processes, increase efficiency and achieve strategic goals. We believe that technology should be accessible, understandable and bring real value.'
    },
    aboutHistory: {
      uk: 'Заснована в 2020 році, компанія CyberSecurity Ukraine швидко зарекомендувала себе як надійний партнер для бізнесу різного масштабу. За цей час ми реалізували десятки успішних проектів та допомогли багатьом компаніям вийти на новий рівень розвитку.',
      en: 'Founded in 2020, CyberSecurity Ukraine has quickly established itself as a reliable partner for businesses of all sizes. During this time, we have implemented dozens of successful projects and helped many companies reach a new level of development.'
    },
    aboutValues: [
      { title: { uk: 'Команда експертів', en: 'Team of Experts' }, description: { uk: 'Наша команда складається з досвідчених фахівців з багаторічним досвідом', en: 'Our team consists of experienced professionals with many years of experience' } },
      { title: { uk: 'Висока якість', en: 'High Quality' }, description: { uk: 'Ми завжди прагнемо до найвищих стандартів якості в кожному проекті', en: 'We always strive for the highest quality standards in every project' } },
      { title: { uk: 'Орієнтація на результат', en: 'Result-Oriented' }, description: { uk: 'Фокусуємось на досягненні конкретних бізнес-цілей наших клієнтів', en: 'We focus on achieving specific business goals of our clients' } },
      { title: { uk: 'Постійний розвиток', en: 'Continuous Development' }, description: { uk: 'Завжди вивчаємо нові технології та вдосконалюємо наші навички', en: 'We always learn new technologies and improve our skills' } }
    ]
  },
  contact: {
    title: { uk: 'Контакти', en: 'Contact' },
    metaDescription: { 
      uk: 'Зв\'яжіться з CyberSecurity Ukraine', 
      en: 'Contact CyberSecurity Ukraine' 
    },
    heroTitle: { 
      uk: 'Зв\'яжіться з нами', 
      en: 'Contact Us' 
    },
    heroSubtitle: { 
      uk: 'Маєте питання? Ми завжди раді допомогти!', 
      en: 'Have questions? We are always happy to help!' 
    },
    sections: [],
    contactEmail: 'info@csua.biz.ua',
    contactPhone: '+380 (95) 8-777-99-7',
    contactAddress: { uk: 'Київ, Україна', en: 'Kyiv, Ukraine' }
  }
};

const PageEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState<PageContent | null>(null);
  const [activeTab, setActiveTab] = useState('uk');

  useEffect(() => {
    checkAdmin();
  }, []);

  useEffect(() => {
    if (isAdmin && slug) {
      loadPageContent();
    }
  }, [isAdmin, slug]);

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
      navigate('/');
      return;
    }

    setIsAdmin(true);
  };

  const loadPageContent = async () => {
    if (!slug) return;

    // Check if page exists in database
    const { data: page } = await supabase
      .from('pages')
      .select('*, page_translations(*)')
      .eq('slug', slug)
      .maybeSingle();

    if (page && page.page_translations) {
      const translations = page.page_translations as Array<{
        language: string;
        title: string;
        meta_description: string | null;
      }>;
      
      const ukTrans = translations.find(t => t.language === 'uk');
      const enTrans = translations.find(t => t.language === 'en');
      
      // Load contact info from content blocks if available
      let contactEmail = defaultContent[slug]?.contactEmail || '';
      let contactPhone = defaultContent[slug]?.contactPhone || '';
      let contactAddress = defaultContent[slug]?.contactAddress || { uk: '', en: '' };

      // Load about page content
      let aboutMission = defaultContent[slug]?.aboutMission || { uk: '', en: '' };
      let aboutHistory = defaultContent[slug]?.aboutHistory || { uk: '', en: '' };
      let aboutValues = defaultContent[slug]?.aboutValues || [];

      if (slug === 'contact') {
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
          
          contactEmail = ukBlock?.content?.email || contactEmail;
          contactPhone = ukBlock?.content?.phone || contactPhone;
          contactAddress = {
            uk: ukBlock?.content?.address || contactAddress.uk,
            en: enBlock?.content?.address || contactAddress.en
          };
        }
      }

      if (slug === 'about') {
        const { data: blocks } = await supabase
          .from('content_blocks')
          .select('*, content_block_translations(*)')
          .eq('page_id', page.id)
          .eq('block_type', 'about_content')
          .maybeSingle();

        if (blocks) {
          const blockTrans = blocks.content_block_translations as Array<{
            language: string;
            content: { mission?: string; history?: string; values?: Array<{ title: string; description: string }> };
          }>;
          const ukBlock = blockTrans?.find(t => t.language === 'uk');
          const enBlock = blockTrans?.find(t => t.language === 'en');
          
          aboutMission = {
            uk: ukBlock?.content?.mission || aboutMission.uk,
            en: enBlock?.content?.mission || aboutMission.en
          };
          aboutHistory = {
            uk: ukBlock?.content?.history || aboutHistory.uk,
            en: enBlock?.content?.history || aboutHistory.en
          };
          
          if (ukBlock?.content?.values && enBlock?.content?.values) {
            aboutValues = ukBlock.content.values.map((ukVal, idx) => ({
              title: { uk: ukVal.title, en: enBlock.content?.values?.[idx]?.title || '' },
              description: { uk: ukVal.description, en: enBlock.content?.values?.[idx]?.description || '' }
            }));
          }
        }
      }

      // Load home page services section
      let servicesSectionTitle = defaultContent[slug]?.servicesSectionTitle || { uk: '', en: '' };
      let servicesSectionSubtitle = defaultContent[slug]?.servicesSectionSubtitle || { uk: '', en: '' };
      let homeServices = defaultContent[slug]?.homeServices || [];

      if (slug === 'home') {
        const { data: blocks } = await supabase
          .from('content_blocks')
          .select('*, content_block_translations(*)')
          .eq('page_id', page.id)
          .eq('block_type', 'home_services')
          .maybeSingle();

        if (blocks) {
          const blockTrans = blocks.content_block_translations as Array<{
            language: string;
            content: { 
              sectionTitle?: string; 
              sectionSubtitle?: string; 
              services?: Array<{ icon: string; title: string; description: string }> 
            };
          }>;
          const ukBlock = blockTrans?.find(t => t.language === 'uk');
          const enBlock = blockTrans?.find(t => t.language === 'en');
          
          servicesSectionTitle = {
            uk: ukBlock?.content?.sectionTitle || servicesSectionTitle.uk,
            en: enBlock?.content?.sectionTitle || servicesSectionTitle.en
          };
          servicesSectionSubtitle = {
            uk: ukBlock?.content?.sectionSubtitle || servicesSectionSubtitle.uk,
            en: enBlock?.content?.sectionSubtitle || servicesSectionSubtitle.en
          };
          
          if (ukBlock?.content?.services && enBlock?.content?.services) {
            homeServices = ukBlock.content.services.map((ukSvc, idx) => ({
              icon: ukSvc.icon,
              title: { uk: ukSvc.title, en: enBlock.content?.services?.[idx]?.title || '' },
              description: { uk: ukSvc.description, en: enBlock.content?.services?.[idx]?.description || '' }
            }));
          }
        }
      }

      setContent({
        title: {
          uk: ukTrans?.title || defaultContent[slug]?.title.uk || '',
          en: enTrans?.title || defaultContent[slug]?.title.en || ''
        },
        metaDescription: {
          uk: ukTrans?.meta_description || defaultContent[slug]?.metaDescription.uk || '',
          en: enTrans?.meta_description || defaultContent[slug]?.metaDescription.en || ''
        },
        heroTitle: defaultContent[slug]?.heroTitle || { uk: '', en: '' },
        heroSubtitle: defaultContent[slug]?.heroSubtitle || { uk: '', en: '' },
        sections: [],
        contactEmail,
        contactPhone,
        contactAddress,
        aboutMission,
        aboutHistory,
        aboutValues,
        servicesSectionTitle,
        servicesSectionSubtitle,
        homeServices
      });
    } else {
      // Use default content
      setContent(defaultContent[slug] || {
        title: { uk: '', en: '' },
        metaDescription: { uk: '', en: '' },
        heroTitle: { uk: '', en: '' },
        heroSubtitle: { uk: '', en: '' },
        sections: [],
        contactEmail: '',
        contactPhone: '',
        contactAddress: { uk: '', en: '' }
      });
    }
  };

  const handleSave = async () => {
    if (!content || !slug) return;

    setIsSaving(true);

    try {
      // Check if page exists
      let { data: page } = await supabase
        .from('pages')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      // Create page if it doesn't exist
      if (!page) {
        const { data: newPage, error: createError } = await supabase
          .from('pages')
          .insert({ slug, published: true })
          .select('id')
          .single();

        if (createError) throw createError;
        page = newPage;
      }

      if (!page) throw new Error('Failed to get or create page');

      // Upsert translations for both languages
      for (const lang of ['uk', 'en'] as const) {
        const { data: existingTrans } = await supabase
          .from('page_translations')
          .select('id')
          .eq('page_id', page.id)
          .eq('language', lang)
          .maybeSingle();

        if (existingTrans) {
          await supabase
            .from('page_translations')
            .update({
              title: content.title[lang],
              meta_description: content.metaDescription[lang]
            })
            .eq('id', existingTrans.id);
        } else {
          await supabase
            .from('page_translations')
            .insert({
              page_id: page.id,
              language: lang,
              title: content.title[lang],
              meta_description: content.metaDescription[lang]
            });
        }
      }

      // Save contact info for contact page
      if (slug === 'contact' && content.contactEmail !== undefined) {
        // Check if contact_info block exists
        let { data: contactBlock } = await supabase
          .from('content_blocks')
          .select('id')
          .eq('page_id', page.id)
          .eq('block_type', 'contact_info')
          .maybeSingle();

        if (!contactBlock) {
          const { data: newBlock, error: blockError } = await supabase
            .from('content_blocks')
            .insert({
              page_id: page.id,
              block_type: 'contact_info',
              sort_order: 0
            })
            .select('id')
            .single();

          if (blockError) throw blockError;
          contactBlock = newBlock;
        }

        if (contactBlock) {
          // Upsert translations for contact info
          for (const lang of ['uk', 'en'] as const) {
            const { data: existingBlockTrans } = await supabase
              .from('content_block_translations')
              .select('id')
              .eq('block_id', contactBlock.id)
              .eq('language', lang)
              .maybeSingle();

            const contactContent = {
              email: content.contactEmail,
              phone: content.contactPhone,
              address: content.contactAddress?.[lang] || ''
            };

            if (existingBlockTrans) {
              await supabase
                .from('content_block_translations')
                .update({ content: contactContent })
                .eq('id', existingBlockTrans.id);
            } else {
              await supabase
                .from('content_block_translations')
                .insert({
                  block_id: contactBlock.id,
                  language: lang,
                  content: contactContent
                });
            }
          }
        }
      }

      // Save about page content
      if (slug === 'about' && content.aboutMission !== undefined) {
        let { data: aboutBlock } = await supabase
          .from('content_blocks')
          .select('id')
          .eq('page_id', page.id)
          .eq('block_type', 'about_content')
          .maybeSingle();

        if (!aboutBlock) {
          const { data: newBlock, error: blockError } = await supabase
            .from('content_blocks')
            .insert({
              page_id: page.id,
              block_type: 'about_content',
              sort_order: 0
            })
            .select('id')
            .single();

          if (blockError) throw blockError;
          aboutBlock = newBlock;
        }

        if (aboutBlock) {
          for (const lang of ['uk', 'en'] as const) {
            const { data: existingBlockTrans } = await supabase
              .from('content_block_translations')
              .select('id')
              .eq('block_id', aboutBlock.id)
              .eq('language', lang)
              .maybeSingle();

            const aboutContent = {
              mission: content.aboutMission?.[lang] || '',
              history: content.aboutHistory?.[lang] || '',
              values: content.aboutValues?.map(v => ({
                title: v.title[lang],
                description: v.description[lang]
              })) || []
            };

            if (existingBlockTrans) {
              await supabase
                .from('content_block_translations')
                .update({ content: aboutContent })
                .eq('id', existingBlockTrans.id);
            } else {
              await supabase
                .from('content_block_translations')
                .insert({
                  block_id: aboutBlock.id,
                  language: lang,
                  content: aboutContent
                });
            }
          }
        }
      }

      // Save home page services section
      if (slug === 'home' && content.homeServices !== undefined) {
        let { data: servicesBlock } = await supabase
          .from('content_blocks')
          .select('id')
          .eq('page_id', page.id)
          .eq('block_type', 'home_services')
          .maybeSingle();

        if (!servicesBlock) {
          const { data: newBlock, error: blockError } = await supabase
            .from('content_blocks')
            .insert({
              page_id: page.id,
              block_type: 'home_services',
              sort_order: 0
            })
            .select('id')
            .single();

          if (blockError) throw blockError;
          servicesBlock = newBlock;
        }

        if (servicesBlock) {
          for (const lang of ['uk', 'en'] as const) {
            const { data: existingBlockTrans } = await supabase
              .from('content_block_translations')
              .select('id')
              .eq('block_id', servicesBlock.id)
              .eq('language', lang)
              .maybeSingle();

            const servicesContent = {
              sectionTitle: content.servicesSectionTitle?.[lang] || '',
              sectionSubtitle: content.servicesSectionSubtitle?.[lang] || '',
              services: content.homeServices?.map(s => ({
                icon: s.icon,
                title: s.title[lang],
                description: s.description[lang]
              })) || []
            };

            if (existingBlockTrans) {
              await supabase
                .from('content_block_translations')
                .update({ content: servicesContent })
                .eq('id', existingBlockTrans.id);
            } else {
              await supabase
                .from('content_block_translations')
                .insert({
                  block_id: servicesBlock.id,
                  language: lang,
                  content: servicesContent
                });
            }
          }
        }
      }

      toast({
        title: t({ uk: 'Збережено!', en: 'Saved!' }),
        description: t({ uk: 'Зміни успішно збережено', en: 'Changes saved successfully' })
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Не вдалося зберегти зміни', en: 'Failed to save changes' }),
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateContent = (field: keyof PageContent, lang: 'uk' | 'en', value: string) => {
    if (!content) return;
    setContent({
      ...content,
      [field]: {
        ...(content[field] as { uk: string; en: string }),
        [lang]: value
      }
    });
  };

  const updateContactField = (field: 'contactEmail' | 'contactPhone', value: string) => {
    if (!content) return;
    setContent({
      ...content,
      [field]: value
    });
  };

  const updateContactAddress = (lang: 'uk' | 'en', value: string) => {
    if (!content) return;
    setContent({
      ...content,
      contactAddress: {
        ...(content.contactAddress || { uk: '', en: '' }),
        [lang]: value
      }
    });
  };

  const updateAboutValue = (index: number, field: 'title' | 'description', lang: 'uk' | 'en', value: string) => {
    if (!content || !content.aboutValues) return;
    const newValues = [...content.aboutValues];
    newValues[index] = {
      ...newValues[index],
      [field]: {
        ...newValues[index][field],
        [lang]: value
      }
    };
    setContent({
      ...content,
      aboutValues: newValues
    });
  };

  const updateHomeService = (index: number, field: 'icon' | 'title' | 'description', lang: 'uk' | 'en' | null, value: string) => {
    if (!content || !content.homeServices) return;
    const newServices = [...content.homeServices];
    if (field === 'icon') {
      newServices[index] = { ...newServices[index], icon: value };
    } else {
      newServices[index] = {
        ...newServices[index],
        [field]: {
          ...newServices[index][field],
          [lang!]: value
        }
      };
    }
    setContent({
      ...content,
      homeServices: newServices
    });
  };

  const addHomeService = () => {
    if (!content) return;
    const newService = {
      icon: 'Briefcase',
      title: { uk: 'Нова послуга', en: 'New Service' },
      description: { uk: 'Опис послуги', en: 'Service description' }
    };
    setContent({
      ...content,
      homeServices: [...(content.homeServices || []), newService]
    });
  };

  const removeHomeService = (index: number) => {
    if (!content || !content.homeServices) return;
    const newServices = content.homeServices.filter((_, i) => i !== index);
    setContent({
      ...content,
      homeServices: newServices
    });
  };

  if (!isAdmin || !content) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
      </div>
    );
  }

  const pageTitles: Record<string, { uk: string; en: string }> = {
    home: { uk: 'Головна сторінка', en: 'Home Page' },
    services: { uk: 'Сторінка послуг', en: 'Services Page' },
    about: { uk: 'Про нас', en: 'About Us' },
    contact: { uk: 'Контакти', en: 'Contact' }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/pages')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t(pageTitles[slug!] || { uk: 'Редагування', en: 'Editing' })}
            </h1>
          </div>
          <Button onClick={handleSave} disabled={isSaving}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving 
              ? t({ uk: 'Збереження...', en: 'Saving...' })
              : t({ uk: 'Зберегти', en: 'Save' })
            }
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="uk">🇺🇦 Українська</TabsTrigger>
            <TabsTrigger value="en">🇬🇧 English</TabsTrigger>
          </TabsList>

          <TabsContent value="uk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO налаштування</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Заголовок сторінки (Title)</Label>
                  <Input
                    value={content.title.uk}
                    onChange={(e) => updateContent('title', 'uk', e.target.value)}
                    placeholder="Заголовок сторінки"
                  />
                </div>
                <div>
                  <Label>Мета-опис (Meta Description)</Label>
                  <Textarea
                    value={content.metaDescription.uk}
                    onChange={(e) => updateContent('metaDescription', 'uk', e.target.value)}
                    placeholder="Опис сторінки для пошукових систем"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Головний блок (Hero)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Заголовок</Label>
                  <Input
                    value={content.heroTitle.uk}
                    onChange={(e) => updateContent('heroTitle', 'uk', e.target.value)}
                    placeholder="Головний заголовок"
                  />
                </div>
                <div>
                  <Label>Підзаголовок</Label>
                  <Textarea
                    value={content.heroSubtitle.uk}
                    onChange={(e) => updateContent('heroSubtitle', 'uk', e.target.value)}
                    placeholder="Підзаголовок або опис"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {slug === 'home' && (
              <Card>
                <CardHeader>
                  <CardTitle>Блок "Наші послуги"</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Заголовок секції</Label>
                    <Input
                      value={content.servicesSectionTitle?.uk || ''}
                      onChange={(e) => updateContent('servicesSectionTitle', 'uk', e.target.value)}
                      placeholder="Наші послуги"
                    />
                  </div>
                  <div>
                    <Label>Підзаголовок секції</Label>
                    <Textarea
                      value={content.servicesSectionSubtitle?.uk || ''}
                      onChange={(e) => updateContent('servicesSectionSubtitle', 'uk', e.target.value)}
                      placeholder="Опис секції послуг"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Послуги</Label>
                      <Button variant="outline" size="sm" onClick={addHomeService}>
                        <Plus className="mr-2 h-4 w-4" />
                        Додати послугу
                      </Button>
                    </div>
                    {content.homeServices?.map((service, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg space-y-4 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeHomeService(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-4 pr-10">
                          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground shrink-0">
                            {(() => {
                              const IconPreview = getIconComponent(service.icon);
                              return <IconPreview className="h-6 w-6" />;
                            })()}
                          </div>
                          <div className="flex-1">
                            <Label>Іконка</Label>
                            <Select
                              value={service.icon}
                              onValueChange={(value) => updateHomeService(index, 'icon', null, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableIcons.map((iconName) => {
                                  const IconItem = getIconComponent(iconName);
                                  return (
                                    <SelectItem key={iconName} value={iconName}>
                                      <div className="flex items-center gap-2">
                                        <IconItem className="h-4 w-4" />
                                        <span>{iconName}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Назва послуги {index + 1}</Label>
                          <Input
                            value={service.title.uk}
                            onChange={(e) => updateHomeService(index, 'title', 'uk', e.target.value)}
                            placeholder="Назва послуги"
                          />
                        </div>
                        <div>
                          <Label>Опис</Label>
                          <Textarea
                            value={service.description.uk}
                            onChange={(e) => updateHomeService(index, 'description', 'uk', e.target.value)}
                            placeholder="Опис послуги"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {slug === 'contact' && (
              <Card>
                <CardHeader>
                  <CardTitle>Контактна інформація</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={content.contactEmail || ''}
                      onChange={(e) => updateContactField('contactEmail', e.target.value)}
                      placeholder="info@csua.biz.ua"
                      type="email"
                    />
                  </div>
                  <div>
                    <Label>Телефон</Label>
                    <Input
                      value={content.contactPhone || ''}
                      onChange={(e) => updateContactField('contactPhone', e.target.value)}
                      placeholder="+380 (95) 8-777-99-7"
                      type="tel"
                    />
                  </div>
                  <div>
                    <Label>Адреса (Українською)</Label>
                    <Input
                      value={content.contactAddress?.uk || ''}
                      onChange={(e) => updateContactAddress('uk', e.target.value)}
                      placeholder="Київ, Україна"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {slug === 'about' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Наша місія</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={content.aboutMission?.uk || ''}
                      onChange={(e) => updateContent('aboutMission', 'uk', e.target.value)}
                      placeholder="Опис місії компанії"
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Наша історія</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={content.aboutHistory?.uk || ''}
                      onChange={(e) => updateContent('aboutHistory', 'uk', e.target.value)}
                      placeholder="Історія компанії"
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Наші цінності</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {content.aboutValues?.map((value, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                        <div>
                          <Label>Назва цінності {index + 1}</Label>
                          <Input
                            value={value.title.uk}
                            onChange={(e) => updateAboutValue(index, 'title', 'uk', e.target.value)}
                            placeholder="Назва цінності"
                          />
                        </div>
                        <div>
                          <Label>Опис</Label>
                          <Textarea
                            value={value.description.uk}
                            onChange={(e) => updateAboutValue(index, 'description', 'uk', e.target.value)}
                            placeholder="Опис цінності"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}

            {slug === 'about' && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Our Mission</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={content.aboutMission?.en || ''}
                      onChange={(e) => updateContent('aboutMission', 'en', e.target.value)}
                      placeholder="Company mission description"
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Our Story</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={content.aboutHistory?.en || ''}
                      onChange={(e) => updateContent('aboutHistory', 'en', e.target.value)}
                      placeholder="Company history"
                      rows={4}
                    />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Our Values</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {content.aboutValues?.map((value, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg space-y-4">
                        <div>
                          <Label>Value {index + 1} Title</Label>
                          <Input
                            value={value.title.en}
                            onChange={(e) => updateAboutValue(index, 'title', 'en', e.target.value)}
                            placeholder="Value title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={value.description.en}
                            onChange={(e) => updateAboutValue(index, 'description', 'en', e.target.value)}
                            placeholder="Value description"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </>
            )}
          </TabsContent>

          <TabsContent value="en" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Page Title</Label>
                  <Input
                    value={content.title.en}
                    onChange={(e) => updateContent('title', 'en', e.target.value)}
                    placeholder="Page title"
                  />
                </div>
                <div>
                  <Label>Meta Description</Label>
                  <Textarea
                    value={content.metaDescription.en}
                    onChange={(e) => updateContent('metaDescription', 'en', e.target.value)}
                    placeholder="Page description for search engines"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hero Section</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={content.heroTitle.en}
                    onChange={(e) => updateContent('heroTitle', 'en', e.target.value)}
                    placeholder="Main title"
                  />
                </div>
                <div>
                  <Label>Subtitle</Label>
                  <Textarea
                    value={content.heroSubtitle.en}
                    onChange={(e) => updateContent('heroSubtitle', 'en', e.target.value)}
                    placeholder="Subtitle or description"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>

            {slug === 'home' && (
              <Card>
                <CardHeader>
                  <CardTitle>"Our Services" Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={content.servicesSectionTitle?.en || ''}
                      onChange={(e) => updateContent('servicesSectionTitle', 'en', e.target.value)}
                      placeholder="Our Services"
                    />
                  </div>
                  <div>
                    <Label>Section Subtitle</Label>
                    <Textarea
                      value={content.servicesSectionSubtitle?.en || ''}
                      onChange={(e) => updateContent('servicesSectionSubtitle', 'en', e.target.value)}
                      placeholder="Services section description"
                      rows={2}
                    />
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold">Services</Label>
                      <Button variant="outline" size="sm" onClick={addHomeService}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Service
                      </Button>
                    </div>
                    {content.homeServices?.map((service, index) => (
                      <div key={index} className="p-4 border border-border rounded-lg space-y-4 relative">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => removeHomeService(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        <div className="flex items-center gap-4 pr-10">
                          <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground shrink-0">
                            {(() => {
                              const IconPreview = getIconComponent(service.icon);
                              return <IconPreview className="h-6 w-6" />;
                            })()}
                          </div>
                          <div className="flex-1">
                            <Label>Icon</Label>
                            <Select
                              value={service.icon}
                              onValueChange={(value) => updateHomeService(index, 'icon', null, value)}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {availableIcons.map((iconName) => {
                                  const IconItem = getIconComponent(iconName);
                                  return (
                                    <SelectItem key={iconName} value={iconName}>
                                      <div className="flex items-center gap-2">
                                        <IconItem className="h-4 w-4" />
                                        <span>{iconName}</span>
                                      </div>
                                    </SelectItem>
                                  );
                                })}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div>
                          <Label>Service {index + 1} Title</Label>
                          <Input
                            value={service.title.en}
                            onChange={(e) => updateHomeService(index, 'title', 'en', e.target.value)}
                            placeholder="Service title"
                          />
                        </div>
                        <div>
                          <Label>Description</Label>
                          <Textarea
                            value={service.description.en}
                            onChange={(e) => updateHomeService(index, 'description', 'en', e.target.value)}
                            placeholder="Service description"
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {slug === 'contact' && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Email</Label>
                    <Input
                      value={content.contactEmail || ''}
                      onChange={(e) => updateContactField('contactEmail', e.target.value)}
                      placeholder="info@csua.biz.ua"
                      type="email"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Edit in Ukrainian tab
                    </p>
                  </div>
                  <div>
                    <Label>Phone</Label>
                    <Input
                      value={content.contactPhone || ''}
                      onChange={(e) => updateContactField('contactPhone', e.target.value)}
                      placeholder="+380 (95) 8-777-99-7"
                      type="tel"
                      disabled
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Edit in Ukrainian tab
                    </p>
                  </div>
                  <div>
                    <Label>Address (English)</Label>
                    <Input
                      value={content.contactAddress?.en || ''}
                      onChange={(e) => updateContactAddress('en', e.target.value)}
                      placeholder="Kyiv, Ukraine"
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PageEditor;
