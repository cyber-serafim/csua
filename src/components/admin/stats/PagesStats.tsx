import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage } from '@/contexts/LanguageContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PageStat {
  page_path: string;
  views: number;
  avg_duration: number;
  total_duration: number;
}

export function PagesStats() {
  const { t } = useLanguage();
  const [pageStats, setPageStats] = useState<PageStat[]>([]);
  const [period, setPeriod] = useState('week');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageStats();
  }, [period]);

  const getDateRange = () => {
    const end = new Date();
    const start = new Date();
    
    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
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

  const fetchPageStats = async () => {
    setLoading(true);
    const { start, end } = getDateRange();

    try {
      const { data } = await supabase
        .from('page_views')
        .select('page_path, duration_seconds')
        .gte('entered_at', start)
        .lte('entered_at', end);

      if (!data) {
        setPageStats([]);
        return;
      }

      // Aggregate by page path
      const statsMap = new Map<string, { views: number; durations: number[] }>();

      data.forEach((pv) => {
        const existing = statsMap.get(pv.page_path);
        if (existing) {
          existing.views++;
          if (pv.duration_seconds) {
            existing.durations.push(pv.duration_seconds);
          }
        } else {
          statsMap.set(pv.page_path, {
            views: 1,
            durations: pv.duration_seconds ? [pv.duration_seconds] : [],
          });
        }
      });

      const stats: PageStat[] = Array.from(statsMap.entries())
        .map(([path, data]) => ({
          page_path: path,
          views: data.views,
          avg_duration: data.durations.length > 0 
            ? Math.round(data.durations.reduce((a, b) => a + b, 0) / data.durations.length)
            : 0,
          total_duration: data.durations.reduce((a, b) => a + b, 0),
        }))
        .sort((a, b) => b.views - a.views);

      setPageStats(stats);
    } catch (error) {
      console.error('Error fetching page stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}с`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}хв ${secs}с`;
  };

  const chartData = pageStats.slice(0, 10).map((p) => ({
    path: p.page_path.length > 20 ? p.page_path.slice(0, 20) + '...' : p.page_path,
    views: p.views,
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
            <SelectItem value="week">{t({ uk: 'Тиждень', en: 'Week' })}</SelectItem>
            <SelectItem value="month">{t({ uk: 'Місяць', en: 'Month' })}</SelectItem>
            <SelectItem value="year">{t({ uk: 'Рік', en: 'Year' })}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ uk: 'Топ сторінок', en: 'Top Pages' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" />
                <YAxis dataKey="path" type="category" width={150} className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))' 
                  }} 
                />
                <Bar dataKey="views" fill="hsl(var(--primary))" name={t({ uk: 'Перегляди', en: 'Views' })} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t({ uk: 'Статистика сторінок', en: 'Page Statistics' })}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t({ uk: 'Сторінка', en: 'Page' })}</TableHead>
                  <TableHead className="text-right">{t({ uk: 'Перегляди', en: 'Views' })}</TableHead>
                  <TableHead className="text-right">{t({ uk: 'Сер. час', en: 'Avg. Time' })}</TableHead>
                  <TableHead className="text-right">{t({ uk: 'Заг. час', en: 'Total Time' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      {t({ uk: 'Завантаження...', en: 'Loading...' })}
                    </TableCell>
                  </TableRow>
                ) : pageStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      {t({ uk: 'Немає даних', en: 'No data' })}
                    </TableCell>
                  </TableRow>
                ) : (
                  pageStats.map((page) => (
                    <TableRow key={page.page_path}>
                      <TableCell className="font-mono text-sm">{page.page_path}</TableCell>
                      <TableCell className="text-right">{page.views}</TableCell>
                      <TableCell className="text-right">{formatDuration(page.avg_duration)}</TableCell>
                      <TableCell className="text-right">{formatDuration(page.total_duration)}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}