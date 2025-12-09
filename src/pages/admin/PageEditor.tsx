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
    sections: []
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
      uk: 'CyberSecurity Ukraine - це команда професіоналів, які допомагають бізнесу досягати успіху', 
      en: 'CyberSecurity Ukraine is a team of professionals who help businesses succeed' 
    },
    sections: []
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
        contactAddress
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
