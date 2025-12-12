import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GripVertical, Trash2 } from 'lucide-react';
import * as Icons from 'lucide-react';

const availableIcons = [
  'Code', 'Server', 'Shield', 'Zap', 'Cloud', 'Database', 'Lock', 
  'Smartphone', 'FileSearch', 'Camera', 'DoorOpen', 'Bell', 'Monitor',
  'Cpu', 'HardDrive', 'Wifi', 'Globe', 'Mail', 'MessageSquare', 'Users',
  'Settings', 'Tool', 'Wrench', 'Key', 'Eye', 'ShieldCheck', 'AlertTriangle',
  'Briefcase', 'Scan', 'Network', 'Fingerprint', 'UserCheck', 'ShieldAlert'
];

const getIconComponent = (iconName: string) => {
  const IconComponent = (Icons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  return IconComponent || Icons.Briefcase;
};

interface HomeService {
  icon: string;
  title: { uk: string; en: string };
  description: { uk: string; en: string };
}

interface SortableServiceItemProps {
  id: string;
  index: number;
  service: HomeService;
  lang: 'uk' | 'en';
  onUpdate: (index: number, field: 'icon' | 'title' | 'description', lang: 'uk' | 'en' | null, value: string) => void;
  onRemove: (index: number) => void;
}

const SortableServiceItem = ({ id, index, service, lang, onUpdate, onRemove }: SortableServiceItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1000 : 1
  };

  const IconPreview = getIconComponent(service.icon);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`p-4 border border-border rounded-lg space-y-4 relative bg-background ${isDragging ? 'shadow-lg ring-2 ring-primary' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute top-4 left-4 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={() => onRemove(index)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
      
      <div className="flex items-center gap-4 pl-8 pr-10">
        <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-primary-foreground shrink-0">
          <IconPreview className="h-6 w-6" />
        </div>
        <div className="flex-1">
          <Label>{lang === 'uk' ? 'Іконка' : 'Icon'}</Label>
          <Select
            value={service.icon}
            onValueChange={(value) => onUpdate(index, 'icon', null, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableIcons.map((iconName) => {
                const IconItem = getIconComponent(iconName);
                return (
                  <SelectItem key={iconName} value={iconName}>
                    <div className="flex items-center gap-2">
                      <IconItem className="h-4 w-4" />
                      <span>{iconName}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="pl-8">
        <Label>{lang === 'uk' ? `Назва послуги ${index + 1}` : `Service ${index + 1} Title`}</Label>
        <Input
          value={service.title[lang]}
          onChange={(e) => onUpdate(index, 'title', lang, e.target.value)}
          placeholder={lang === 'uk' ? 'Назва послуги' : 'Service title'}
        />
      </div>
      
      <div className="pl-8">
        <Label>{lang === 'uk' ? 'Опис' : 'Description'}</Label>
        <Textarea
          value={service.description[lang]}
          onChange={(e) => onUpdate(index, 'description', lang, e.target.value)}
          placeholder={lang === 'uk' ? 'Опис послуги' : 'Service description'}
          rows={2}
        />
      </div>
    </div>
  );
};

export default SortableServiceItem;
