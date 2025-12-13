import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';

interface Visitor {
  id: string;
  ip_address: string;
  country: string | null;
  city: string | null;
  region: string | null;
  isp: string | null;
  connection_type: string | null;
  is_datacenter: boolean;
  is_vpn: boolean;
  is_proxy: boolean;
  is_tor: boolean;
  visit_count: number;
}

const PAGE_SIZE = 20;

export function VisitorsTable() {
  const { t } = useLanguage();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [connectionFilter, setConnectionFilter] = useState('all');
  const [countryFilter, setCountryFilter] = useState('all');
  const [countries, setCountries] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchVisitors();
    fetchCountries();
  }, [page, connectionFilter, countryFilter]);

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

    let query = supabase
      .from('ip_info')
      .select('*', { count: 'exact' });

    if (connectionFilter !== 'all') {
      switch (connectionFilter) {
        case 'vpn':
          query = query.eq('is_vpn', true);
          break;
        case 'proxy':
          query = query.eq('is_proxy', true);
          break;
        case 'tor':
          query = query.eq('is_tor', true);
          break;
        case 'datacenter':
          query = query.eq('is_datacenter', true);
          break;
        case 'residential':
          query = query.eq('connection_type', 'residential');
          break;
      }
    }

    if (countryFilter !== 'all') {
      query = query.eq('country', countryFilter);
    }

    if (search) {
      query = query.or(`ip_address.ilike.%${search}%,city.ilike.%${search}%,isp.ilike.%${search}%`);
    }

    const { data, count, error } = await query
      .order('created_at', { ascending: false })
      .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);

    if (error) {
      console.error('Error fetching visitors:', error);
      setLoading(false);
      return;
    }

    // Get visit counts for each IP
    const visitorsWithCounts = await Promise.all(
      (data || []).map(async (ip) => {
        const { count: visitCount } = await supabase
          .from('visitor_sessions')
          .select('*', { count: 'exact', head: true })
          .eq('ip_info_id', ip.id);

        return {
          ...ip,
          visit_count: visitCount || 0,
        };
      })
    );

    setVisitors(visitorsWithCounts);
    setTotalCount(count || 0);
    setLoading(false);
  };

  const handleSearch = () => {
    setPage(0);
    fetchVisitors();
  };

  const getConnectionBadge = (visitor: Visitor) => {
    if (visitor.is_tor) return <Badge variant="destructive">TOR</Badge>;
    if (visitor.is_vpn) return <Badge variant="destructive">VPN</Badge>;
    if (visitor.is_proxy) return <Badge variant="secondary">Proxy</Badge>;
    if (visitor.is_datacenter) return <Badge variant="outline">Datacenter</Badge>;
    return <Badge variant="default">{t({ uk: 'Реальна', en: 'Residential' })}</Badge>;
  };

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t({ uk: 'Відвідувачі', en: 'Visitors' })}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
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

          <Select value={connectionFilter} onValueChange={(v) => { setConnectionFilter(v); setPage(0); }}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t({ uk: 'Тип', en: 'Type' })} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ uk: 'Всі', en: 'All' })}</SelectItem>
              <SelectItem value="residential">{t({ uk: 'Реальні', en: 'Residential' })}</SelectItem>
              <SelectItem value="vpn">VPN</SelectItem>
              <SelectItem value="proxy">Proxy</SelectItem>
              <SelectItem value="tor">TOR</SelectItem>
              <SelectItem value="datacenter">Datacenter</SelectItem>
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
                    <TableCell className="max-w-48 truncate">{visitor.isp || '-'}</TableCell>
                    <TableCell>{getConnectionBadge(visitor)}</TableCell>
                    <TableCell>{visitor.visit_count}</TableCell>
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