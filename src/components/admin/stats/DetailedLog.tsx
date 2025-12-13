import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { Download, ChevronLeft, ChevronRight, Search, Calendar } from 'lucide-react';

interface LogEntry {
  id: string;
  page_path: string;
  page_url: string;
  referer: string | null;
  entered_at: string;
  exited_at: string | null;
  duration_seconds: number | null;
  session: {
    id: string;
    browser: string | null;
    os: string | null;
    device_type: string | null;
    ip_info: {
      ip_address: string;
      country: string | null;
      city: string | null;
      connection_type: string | null;
    } | null;
  };
}

const PAGE_SIZE = 50;

export function DetailedLog() {
  const { t } = useLanguage();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  
  // Filters
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [pathFilter, setPathFilter] = useState('');
  const [ipFilter, setIpFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);

    let query = supabase
      .from('page_views')
      .select(`
        id,
        page_path,
        page_url,
        referer,
        entered_at,
        exited_at,
        duration_seconds,
        session:visitor_sessions!inner (
          id,
          browser,
          os,
          device_type,
          ip_info:ip_info (
            ip_address,
            country,
            city,
            connection_type
          )
        )
      `, { count: 'exact' });

    if (dateFrom) {
      query = query.gte('entered_at', new Date(dateFrom).toISOString());
    }
    if (dateTo) {
      const endDate = new Date(dateTo);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte('entered_at', endDate.toISOString());
    }
    if (pathFilter) {
      query = query.ilike('page_path', `%${pathFilter}%`);
    }

    const { data, count, error } = await query
      .order('entered_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('Error fetching logs:', error);
      setLoading(false);
      return;
    }

    // Filter by IP if specified (client-side since it's a nested relation)
    let filteredData = data || [];
    if (ipFilter && filteredData.length > 0) {
      filteredData = filteredData.filter((log: any) => 
        log.session?.ip_info?.ip_address?.includes(ipFilter)
      );
    }

    setLogs(filteredData as unknown as LogEntry[]);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(0);
    fetchLogs();
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return '-';
    if (seconds < 60) return `${seconds}с`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}хв ${secs}с`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const exportToCSV = () => {
    const headers = ['Date', 'IP', 'Country', 'City', 'Page', 'Referer', 'Duration', 'Browser', 'OS', 'Device'];
    const rows = logs.map((log) => [
      formatDate(log.entered_at),
      log.session?.ip_info?.ip_address || '-',
      log.session?.ip_info?.country || '-',
      log.session?.ip_info?.city || '-',
      log.page_path,
      log.referer || '-',
      log.duration_seconds?.toString() || '-',
      log.session?.browser || '-',
      log.session?.os || '-',
      log.session?.device_type || '-',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `visit_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t({ uk: 'Детальний лог', en: 'Detailed Log' })}</CardTitle>
        <Button variant="outline" onClick={exportToCSV}>
          <Download className="h-4 w-4 mr-2" />
          {t({ uk: 'Експорт CSV', en: 'Export CSV' })}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder={t({ uk: 'Від', en: 'From' })}
            />
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder={t({ uk: 'До', en: 'To' })}
            />
          </div>
          <Input
            placeholder={t({ uk: 'Сторінка...', en: 'Page...' })}
            value={pathFilter}
            onChange={(e) => setPathFilter(e.target.value)}
          />
          <Input
            placeholder={t({ uk: 'IP адреса...', en: 'IP address...' })}
            value={ipFilter}
            onChange={(e) => setIpFilter(e.target.value)}
          />
          <Button onClick={handleSearch}>
            <Search className="h-4 w-4 mr-2" />
            {t({ uk: 'Пошук', en: 'Search' })}
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t({ uk: 'Дата', en: 'Date' })}</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>{t({ uk: 'Локація', en: 'Location' })}</TableHead>
                <TableHead>{t({ uk: 'Сторінка', en: 'Page' })}</TableHead>
                <TableHead>{t({ uk: 'Джерело', en: 'Referer' })}</TableHead>
                <TableHead>{t({ uk: 'Час', en: 'Duration' })}</TableHead>
                <TableHead>{t({ uk: 'Пристрій', en: 'Device' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    {t({ uk: 'Завантаження...', en: 'Loading...' })}
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {t({ uk: 'Немає даних', en: 'No data' })}
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(log.entered_at)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {log.session?.ip_info?.ip_address || '-'}
                    </TableCell>
                    <TableCell className="text-sm">
                      {[log.session?.ip_info?.city, log.session?.ip_info?.country].filter(Boolean).join(', ') || '-'}
                    </TableCell>
                    <TableCell className="max-w-32 truncate text-sm" title={log.page_path}>
                      {log.page_path}
                    </TableCell>
                    <TableCell className="max-w-32 truncate text-sm" title={log.referer || ''}>
                      {log.referer || '-'}
                    </TableCell>
                    <TableCell>{formatDuration(log.duration_seconds)}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant="outline" className="text-xs">
                          {log.session?.browser || '-'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {log.session?.os} / {log.session?.device_type}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t({ 
              uk: `Показано ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalCount)} з ${totalCount}`, 
              en: `Showing ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalCount)} of ${totalCount}` 
            })}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => p - 1)} 
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage((p) => p + 1)} 
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}