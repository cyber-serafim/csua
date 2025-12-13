import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with webpack/vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapPoint {
  id: string;
  latitude: number;
  longitude: number;
  city: string | null;
  country: string | null;
  count: number;
  is_suspicious: boolean;
}

export function VisitorsMap() {
  const { t } = useLanguage();
  const [points, setPoints] = useState<MapPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMapData();
  }, []);

  const fetchMapData = async () => {
    setLoading(true);

    try {
      const { data: ipData } = await supabase
        .from('ip_info')
        .select('id, latitude, longitude, city, country, is_vpn, is_proxy, is_tor')
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (!ipData) {
        setPoints([]);
        return;
      }

      // Get visit counts for each IP
      const pointsWithCounts = await Promise.all(
        ipData.map(async (ip) => {
          const { count } = await supabase
            .from('visitor_sessions')
            .select('*', { count: 'exact', head: true })
            .eq('ip_info_id', ip.id);

          return {
            id: ip.id,
            latitude: Number(ip.latitude),
            longitude: Number(ip.longitude),
            city: ip.city,
            country: ip.country,
            count: count || 1,
            is_suspicious: ip.is_vpn || ip.is_proxy || ip.is_tor,
          };
        })
      );

      // Aggregate nearby points
      const aggregated = aggregatePoints(pointsWithCounts);
      setPoints(aggregated);
    } catch (error) {
      console.error('Error fetching map data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate points that are very close together
  const aggregatePoints = (rawPoints: MapPoint[]): MapPoint[] => {
    const threshold = 0.1; // degrees
    const aggregatedMap = new Map<string, MapPoint>();

    rawPoints.forEach((point) => {
      const key = `${Math.round(point.latitude / threshold) * threshold},${Math.round(point.longitude / threshold) * threshold}`;
      const existing = aggregatedMap.get(key);

      if (existing) {
        existing.count += point.count;
        if (point.is_suspicious) existing.is_suspicious = true;
      } else {
        aggregatedMap.set(key, { ...point });
      }
    });

    return Array.from(aggregatedMap.values());
  };

  const getMarkerColor = (point: MapPoint) => {
    if (point.is_suspicious) return '#ef4444'; // red
    return 'hsl(var(--primary))';
  };

  const getMarkerRadius = (count: number) => {
    return Math.min(8 + Math.log2(count) * 4, 30);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t({ uk: 'Карта відвідувачів', en: 'Visitors Map' })}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
          </div>
        ) : points.length === 0 ? (
          <div className="h-96 flex items-center justify-center">
            <p className="text-muted-foreground">{t({ uk: 'Немає даних для відображення', en: 'No data to display' })}</p>
          </div>
        ) : (
          <div className="h-96 rounded-lg overflow-hidden">
            <MapContainer
              center={[48.3794, 31.1656]} // Ukraine center
              zoom={4}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {points.map((point) => (
                <CircleMarker
                  key={point.id}
                  center={[point.latitude, point.longitude]}
                  radius={getMarkerRadius(point.count)}
                  pathOptions={{
                    fillColor: getMarkerColor(point),
                    fillOpacity: 0.6,
                    color: getMarkerColor(point),
                    weight: 2,
                  }}
                >
                  <Popup>
                    <div className="text-sm">
                      <p className="font-medium">
                        {[point.city, point.country].filter(Boolean).join(', ') || t({ uk: 'Невідомо', en: 'Unknown' })}
                      </p>
                      <p>{t({ uk: 'Відвідувань:', en: 'Visits:' })} {point.count}</p>
                      {point.is_suspicious && (
                        <p className="text-destructive font-medium">
                          {t({ uk: 'Підозрілий (VPN/Proxy)', en: 'Suspicious (VPN/Proxy)' })}
                        </p>
                      )}
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        )}
        
        {/* Legend */}
        <div className="mt-4 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-primary opacity-60" />
            <span>{t({ uk: 'Звичайні відвідувачі', en: 'Regular visitors' })}</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-destructive opacity-60" />
            <span>{t({ uk: 'VPN/Proxy/TOR', en: 'VPN/Proxy/TOR' })}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}