import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Phone, Mail, Calendar, FileText, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

type ActivityType = 'note' | 'call' | 'meeting' | 'email';

type Activity = {
  id: string;
  deal_id: string | null;
  contact_id: string | null;
  company_id: string | null;
  activity_type: ActivityType;
  title: string;
  description: string | null;
  created_at: string;
};

type Deal = {
  id: string;
  title: string;
  company_id: string | null;
  contact_id: string | null;
};

interface DealActivityDialogProps {
  deal: Deal;
  onClose: () => void;
}

const activityIcons: Record<ActivityType, typeof Phone> = {
  note: FileText,
  call: Phone,
  meeting: Calendar,
  email: Mail,
};

const activityColors: Record<ActivityType, string> = {
  note: 'bg-blue-100 text-blue-600',
  call: 'bg-green-100 text-green-600',
  meeting: 'bg-purple-100 text-purple-600',
  email: 'bg-orange-100 text-orange-600',
};

export const DealActivityDialog = ({ deal, onClose }: DealActivityDialogProps) => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ activity_type: 'note' as ActivityType, title: '', description: '' });
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const activityLabels: Record<ActivityType, { uk: string; en: string }> = {
    note: { uk: 'Нотатка', en: 'Note' },
    call: { uk: 'Дзвінок', en: 'Call' },
    meeting: { uk: 'Зустріч', en: 'Meeting' },
    email: { uk: 'Email', en: 'Email' },
  };

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['crm-activities', deal.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_activities')
        .select('*')
        .eq('deal_id', deal.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Activity[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await supabase.from('crm_activities').insert([{
        ...data,
        deal_id: deal.id,
        contact_id: deal.contact_id,
        company_id: deal.company_id,
      }]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', deal.id] });
      toast({ title: t({ uk: 'Активність додано', en: 'Activity added' }) });
      setFormData({ activity_type: 'note', title: '', description: '' });
      setShowForm(false);
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_activities').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-activities', deal.id] });
      toast({ title: t({ uk: 'Активність видалено', en: 'Activity deleted' }) });
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{deal.title} - {t({ uk: 'Історія активностей', en: 'Activity History' })}</DialogTitle>
        </DialogHeader>

        {!showForm ? (
          <Button onClick={() => setShowForm(true)} className="mb-4">
            <Plus className="mr-2 h-4 w-4" />
            {t({ uk: 'Додати активність', en: 'Add Activity' })}
          </Button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mb-4 p-4 bg-muted/50 rounded-lg">
            <div>
              <Label>{t({ uk: 'Тип', en: 'Type' })}</Label>
              <Select value={formData.activity_type} onValueChange={(v: ActivityType) => setFormData({ ...formData, activity_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(activityLabels) as ActivityType[]).map(type => (
                    <SelectItem key={type} value={type}>{t(activityLabels[type])}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{t({ uk: 'Заголовок', en: 'Title' })} *</Label>
              <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
            </div>
            <div>
              <Label>{t({ uk: 'Опис', en: 'Description' })}</Label>
              <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                {t({ uk: 'Скасувати', en: 'Cancel' })}
              </Button>
              <Button type="submit">{t({ uk: 'Зберегти', en: 'Save' })}</Button>
            </div>
          </form>
        )}

        {isLoading ? (
          <p className="text-center py-4">{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
        ) : activities.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">{t({ uk: 'Немає активностей', en: 'No activities' })}</p>
        ) : (
          <div className="space-y-3">
            {activities.map(activity => {
              const Icon = activityIcons[activity.activity_type];
              return (
                <div key={activity.id} className="flex gap-3 p-3 border rounded-lg">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${activityColors[activity.activity_type]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {t(activityLabels[activity.activity_type])} • {format(new Date(activity.created_at), 'dd MMM yyyy HH:mm', { locale: language === 'uk' ? uk : enUS })}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(activity.id)}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{activity.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
