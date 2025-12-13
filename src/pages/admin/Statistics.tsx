import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { LogOut, ArrowLeft, Users, Eye, Globe, Shield, Clock } from 'lucide-react';
import { StatsOverview } from '@/components/admin/stats/StatsOverview';
import { VisitorsTable } from '@/components/admin/stats/VisitorsTable';
import { PagesStats } from '@/components/admin/stats/PagesStats';
import { DetailedLog } from '@/components/admin/stats/DetailedLog';
import { VisitorsMap } from '@/components/admin/stats/VisitorsMap';

const Statistics = () => {
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

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roles) {
      toast({
        title: t({ uk: 'Доступ заборонено', en: 'Access Denied' }),
        description: t({ uk: 'У вас немає прав адміністратора', en: 'You do not have administrator rights' }),
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
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/admin/dashboard')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {t({ uk: 'Статистика', en: 'Statistics' })}
            </h1>
          </div>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="mr-2 h-4 w-4" />
            {t({ uk: 'Вийти', en: 'Logout' })}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              {t({ uk: 'Огляд', en: 'Overview' })}
            </TabsTrigger>
            <TabsTrigger value="visitors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t({ uk: 'Відвідувачі', en: 'Visitors' })}
            </TabsTrigger>
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t({ uk: 'Сторінки', en: 'Pages' })}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t({ uk: 'Карта', en: 'Map' })}
            </TabsTrigger>
            <TabsTrigger value="log" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {t({ uk: 'Лог', en: 'Log' })}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <StatsOverview />
          </TabsContent>

          <TabsContent value="visitors">
            <VisitorsTable />
          </TabsContent>

          <TabsContent value="pages">
            <PagesStats />
          </TabsContent>

          <TabsContent value="map">
            <VisitorsMap />
          </TabsContent>

          <TabsContent value="log">
            <DetailedLog />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Statistics;