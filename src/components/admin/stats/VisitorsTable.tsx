import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, ChevronLeft, ChevronRight, Monitor, Smartphone, Tablet, CalendarIcon, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Visitor {
  id: string;
  ip_address: string;
  country: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  device_type: string | null;
  visit_count: number;
}

const PAGE_SIZE = 20;

export function VisitorsTable() {
  const { t } = useLanguage();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deviceFilter, setDeviceFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [dateFrom, setDateFrom] = useState<Date | undefined>(undefined);
  const [dateTo, setDateTo] = useState<Date | undefined>(undefined);

  useEffect(() => {
    fetchVisitors();
    fetchCountries();
  }, [page, deviceFilter, countryFilter, dateFrom, dateTo]);

  const fetchCountries = async () => {
    const { data } = await supabase
      .from('ip_info')
      .select('country')
      .not('country', 'is', null);

    const uniqueCountries = [...new Set(data?.map((d) => d.country).filter(Boolean))] as string[];
    setCountries(uniqueCountries.sort());
  };

  const fetchVisitors = async () => {
    setLoading(true);

    // First, get visitor sessions with their IP info and aggregate visit counts
    let query = supabase
      .from('visitor_sessions')
      .select(`
        id,
        device_type,
        total_visits,
        ip_info:ip_info_id (
          id,
          ip_address,
          country,
          region,
          city,
          isp
        )
      `, { count: 'exact' });

    if (deviceFilter !== 'all') {
      query = query.eq('device_type', deviceFilter);
    }

    if (dateFrom) {
      query = query.gte('first_visit_at', dateFrom.toISOString());
    }

    if (dateTo) {
      const endOfDay = new Date(dateTo);
      endOfDay.setHours(23, 59, 59, 999);
      query = query.lte('first_visit_at', endOfDay.toISOString());
    }

    const { data: sessions, count, error } = await query
      .order('last_visit_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('Error fetching visitors:', error);
      setLoading(false);
      return;
    }

    // Transform and filter data
    const visitorsData: Visitor[] = (sessions || [])
      .filter((session) => session.ip_info)
      .map((session) => {
        const ipInfo = session.ip_info as any;
        return {
          id: session.id,
          ip_address: ipInfo?.ip_address || 'Unknown',
          country: ipInfo?.country,
          city: ipInfo?.city,
          region: ipInfo?.region,
          isp: ipInfo?.isp,
          device_type: session.device_type,
          visit_count: session.total_visits || 1,
        };
      });

    // Apply country filter client-side (after join)
    let filteredVisitors = visitorsData;
    if (countryFilter !== 'all') {
      filteredVisitors = visitorsData.filter((v) => v.country === countryFilter);
    }

    // Apply search filter client-side
    if (search) {
      const searchLower = search.toLowerCase();
      filteredVisitors = filteredVisitors.filter(
        (v) =>
          v.ip_address.toLowerCase().includes(searchLower) ||
          v.city?.toLowerCase().includes(searchLower) ||
          v.isp?.toLowerCase().includes(searchLower)
      );
    }

    setVisitors(filteredVisitors);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(0);
    fetchVisitors();
  };

  const getDeviceIcon = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const getDeviceLabel = (deviceType: string | null) => {
    switch (deviceType) {
      case 'mobile':
        return t({ uk: 'Мобільний', en: 'Mobile' });
      case 'tablet':
        return t({ uk: 'Планшет', en: 'Tablet' });
      default:
        return t({ uk: 'Десктоп', en: 'Desktop' });
    }
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t({ uk: 'Відвідувачі', en: 'Visitors' })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <Input
                placeholder={t({ uk: 'Пошук по IP, місту, ISP...', en: 'Search by IP, city, ISP...' })}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Button variant="secondary" onClick={handleSearch}>
                <Search className="h-4 w-4" />
              </Button>
            </div>

            <Select value={deviceFilter} onValueChange={(v) => { setDeviceFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t({ uk: 'Пристрій', en: 'Device' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ uk: 'Всі', en: 'All' })}</SelectItem>
                <SelectItem value="desktop">{t({ uk: 'Десктоп', en: 'Desktop' })}</SelectItem>
                <SelectItem value="mobile">{t({ uk: 'Мобільний', en: 'Mobile' })}</SelectItem>
                <SelectItem value="tablet">{t({ uk: 'Планшет', en: 'Tablet' })}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={countryFilter} onValueChange={(v) => { setCountryFilter(v); setPage(0); }}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={t({ uk: 'Країна', en: 'Country' })} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t({ uk: 'Всі країни', en: 'All countries' })}</SelectItem>
                {countries.map((country) => (
                  <SelectItem key={country} value={country}>{country}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date Range Filter */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{t({ uk: 'Період:', en: 'Period:' })}</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !dateFrom && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFrom ? format(dateFrom, "dd.MM.yyyy") : t({ uk: 'Від', en: 'From' })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateFrom}
                  onSelect={(date) => { setDateFrom(date); setPage(0); }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] justify-start text-left font-normal",
                    !dateTo && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateTo ? format(dateTo, "dd.MM.yyyy") : t({ uk: 'До', en: 'To' })}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateTo}
                  onSelect={(date) => { setDateTo(date); setPage(0); }}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>

            {(dateFrom || dateTo) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setDateFrom(undefined); setDateTo(undefined); setPage(0); }}
              >
                <X className="h-4 w-4 mr-1" />
                {t({ uk: 'Скинути', en: 'Clear' })}
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP</TableHead>
                <TableHead>{t({ uk: 'Локація', en: 'Location' })}</TableHead>
                <TableHead>ISP</TableHead>
                <TableHead>{t({ uk: 'Тип', en: 'Type' })}</TableHead>
                <TableHead>{t({ uk: 'Візити', en: 'Visits' })}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    {t({ uk: 'Завантаження...', en: 'Loading...' })}
                  </TableCell>
                </TableRow>
              ) : visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    {t({ uk: 'Немає даних', en: 'No data' })}
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((visitor) => (
                  <TableRow key={visitor.id}>
                    <TableCell className="font-mono text-sm">{visitor.ip_address}</TableCell>
                    <TableCell>
                      {[visitor.city, visitor.region, visitor.country].filter(Boolean).join(', ') || '-'}
                    </TableCell>
                    <TableCell className="max-w-48 truncate" title={visitor.isp || undefined}>
                      {visitor.isp || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getDeviceIcon(visitor.device_type)}
                        <span>{getDeviceLabel(visitor.device_type)}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{visitor.visit_count}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {t({ uk: `Показано ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalCount)} з ${totalCount}`, en: `Showing ${page * PAGE_SIZE + 1}-${Math.min((page + 1) * PAGE_SIZE, totalCount)} of ${totalCount}` })}
          </p>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p - 1)} 
              disabled={page === 0}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setPage(p => p + 1)} 
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