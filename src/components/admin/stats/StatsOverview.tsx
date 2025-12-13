import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, Eye, Globe, Shield, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface DailyStats {
  date: string;
  total_visits: number;
  unique_visitors: number;
  total_page_views: number;
  vpn_visits: number;
  proxy_visits: number;
}

interface CountryStats {
  country: string;
  country_code: string;
  count: number;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', '#10b981', '#f59e0b'];

export function StatsOverview() {
  const { t } = useLanguage();
  const [period, setPeriod] = useState('week');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [countryStats, setCountryStats] = useState<CountryStats[]>([]);
  const [totals, setTotals] = useState({
    totalVisits: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    vpnPercent: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, [period]);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      default:
        start.setDate(start.getDate() - 7);
    }
    
    return { start: start.toISOString(), end: end.toISOString() };
  };

  const fetchStats = async () => {
    setLoading(true);
    const { start, end } = getDateRange();
    const startDate = start.split('T')[0];
    const endDate = end.split('T')[0];

    try {
      // Fetch daily stats
      const { data: dailyData } = await supabase
        .from('daily_stats')
        .select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true });

      setDailyStats(dailyData || []);

      // Calculate totals
      const totalVisits = dailyData?.reduce((sum, d) => sum + (d.total_visits || 0), 0) || 0;
      const pageViews = dailyData?.reduce((sum, d) => sum + (d.total_page_views || 0), 0) || 0;
      const vpnVisits = dailyData?.reduce((sum, d) => sum + (d.vpn_visits || 0), 0) || 0;

      // Get unique visitors count
      const { count: uniqueCount } = await supabase
        .from('visitor_sessions')
        .select('*', { count: 'exact', head: true })
        .gte('first_visit_at', start)
        .lte('first_visit_at', end);

      // Get country distribution
      const { data: ipData } = await supabase
        .from('ip_info')
        .select('country, country_code');

      const countryMap = new Map<string, { country: string; code: string; count: number }>();
      ipData?.forEach((ip) => {
        const key = ip.country_code || 'Unknown';
        const existing = countryMap.get(key);
        if (existing) {
          existing.count++;
        } else {
          countryMap.set(key, { country: ip.country || 'Unknown', code: key, count: 1 });
        }
      });

      const sortedCountries = Array.from(countryMap.values())
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
        .map((c) => ({ country: c.country, country_code: c.code, count: c.count }));

      setCountryStats(sortedCountries);

      setTotals({
        totalVisits,
        uniqueVisitors: uniqueCount || 0,
        pageViews,
        vpnPercent: totalVisits > 0 ? Math.round((vpnVisits / totalVisits) * 100) : 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = dailyStats.map((d) => ({
    date: new Date(d.date).toLocaleDateString('uk-UA', { day: '2-digit', month: '2-digit' }),
    visits: d.total_visits,
    pageViews: d.total_page_views,
  }));

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">{t({ uk: 'Сьогодні', en: 'Today' })}</SelectItem>
            <SelectItem value="yesterday">{t({ uk: 'Вчора', en: 'Yesterday' })}</SelectItem>
            <SelectItem value="week">{t({ uk: 'Тиждень', en: 'Week' })}</SelectItem>
            <SelectItem value="month">{t({ uk: 'Місяць', en: 'Month' })}</SelectItem>
            <SelectItem value="year">{t({ uk: 'Рік', en: 'Year' })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t({ uk: 'Всього відвідувань', en: 'Total Visits' })}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.totalVisits.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t({ uk: 'Унікальні відвідувачі', en: 'Unique Visitors' })}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.uniqueVisitors.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t({ uk: 'Перегляди сторінок', en: 'Page Views' })}
            </CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.pageViews.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t({ uk: 'VPN/Проксі', en: 'VPN/Proxy' })}
            </CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totals.vpnPercent}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>{t({ uk: 'Динаміка відвідувань', en: 'Visit Trends' })}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))' 
                    }} 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="visits" 
                    stroke="hsl(var(--primary))" 
                    fill="hsl(var(--primary))" 
                    fillOpacity={0.3} 
                    name={t({ uk: 'Відвідування', en: 'Visits' })}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="pageViews" 
                    stroke="hsl(var(--secondary))" 
                    fill="hsl(var(--secondary))" 
                    fillOpacity={0.3} 
                    name={t({ uk: 'Перегляди', en: 'Page Views' })}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t({ uk: 'Топ країн', en: 'Top Countries' })}</CardTitle>
          </CardHeader>
          <CardContent>
            {countryStats.length > 0 ? (
              <div className="space-y-4">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={countryStats}
                        dataKey="count"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={({ country_code }) => country_code}
                      >
                        {countryStats.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2">
                  {countryStats.map((c, i) => (
                    <div key={c.country_code} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }} 
                        />
                        <span>{c.country || c.country_code}</span>
                      </div>
                      <span className="font-medium">{c.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                {t({ uk: 'Немає даних', en: 'No data' })}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}