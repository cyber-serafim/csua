import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { FileText, Plus, LogOut, BarChart3, HardDrive } from 'lucide-react';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      navigate('/admin/login');
      return;
    }

    setUser(user);

    // Check if user is admin
    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      toast({
        title: t({ uk: 'Доступ заборонено', en: 'Access Denied' }),
        description: t({ 
          uk: 'У вас немає прав адміністратора', 
          en: 'You do not have administrator rights' 
        }),
        variant: 'destructive',
      });
      navigate('/');
      return;
    }

    setIsAdmin(true);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            {t({ uk: 'Адмін-панель', en: 'Admin Panel' })}
          </h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            {t({ uk: 'Вийти', en: 'Logout' })}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
                <FileText className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>
                {t({ uk: 'Сторінки', en: 'Pages' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  uk: 'Керування сторінками сайту', 
                  en: 'Manage website pages' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/admin/pages')}>
                <Plus className="mr-2 h-4 w-4" />
                {t({ uk: 'Керувати сторінками', en: 'Manage Pages' })}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>
                {t({ uk: 'Статистика', en: 'Statistics' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  uk: 'Перегляд статистики сайту', 
                  en: 'View website statistics' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/admin/statistics')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                {t({ uk: 'Переглянути статистику', en: 'View Statistics' })}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-large transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mb-2">
                <HardDrive className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>
                {t({ uk: 'Backup сайту', en: 'Site Backup' })}
              </CardTitle>
              <CardDescription>
                {t({ 
                  uk: 'Резервне копіювання та відновлення', 
                  en: 'Backup and restore' 
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => navigate('/admin/backup')}>
                <HardDrive className="mr-2 h-4 w-4" />
                {t({ uk: 'Керувати бекапами', en: 'Manage Backups' })}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
