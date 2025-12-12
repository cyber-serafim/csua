import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Edit, Eye, GripVertical } from 'lucide-react';
import * as Icons from 'lucide-react';

interface ServiceItem {
  id: string;
  icon_name: string;
  title: { uk: string; en: string };
}

interface SortableServiceCardProps {
  service: ServiceItem;
}

const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  return IconComponent || Icons.Briefcase;
};

const SortableServiceCard = ({ service }: SortableServiceCardProps) => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  const IconComponent = getIconComponent(service.icon_name);

  return (
    <Card 
      ref={setNodeRef} 
      style={style}
      className={`hover:shadow-large transition-all duration-300 ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
          >
            <GripVertical className="h-5 w-5" />
          </div>
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <IconComponent className="h-5 w-5 text-primary-foreground" />
          </div>
          <CardTitle className="text-lg">{t(service.title)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Button 
            className="flex-1"
            size="sm"
            onClick={() => navigate(`/admin/services/${service.id}`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {t({ uk: 'Редагувати', en: 'Edit' })}
          </Button>
          <Button 
            variant="outline"
            size="sm"
            onClick={() => window.open(`/services/${service.id}`, '_blank')}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SortableServiceCard;
