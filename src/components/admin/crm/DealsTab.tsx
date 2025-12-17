import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Handshake, GripVertical, Pencil, Trash2 } from 'lucide-react';
import { DealActivityDialog } from './DealActivityDialog';

type DealStage = 'new' | 'in_progress' | 'negotiation' | 'won' | 'lost';

type Deal = {
  id: string;
  title: string;
  company_id: string | null;
  contact_id: string | null;
  stage: DealStage;
  value: number;
  currency: string;
  expected_close_date: string | null;
  notes: string | null;
  sort_order: number;
  created_at: string | null;
};

type Company = { id: string; name: string };
type Contact = { id: string; first_name: string; last_name: string | null };

const STAGES: { key: DealStage; color: string }[] = [
  { key: 'new', color: 'bg-blue-500' },
  { key: 'in_progress', color: 'bg-yellow-500' },
  { key: 'negotiation', color: 'bg-purple-500' },
  { key: 'won', color: 'bg-green-500' },
  { key: 'lost', color: 'bg-red-500' },
];

export const DealsTab = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);
  const [activityDeal, setActivityDeal] = useState<Deal | null>(null);
  const [formData, setFormData] = useState({
    title: '', company_id: '', contact_id: '', stage: 'new' as DealStage,
    value: '', currency: 'UAH', expected_close_date: '', notes: ''
  });
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const stageLabels: Record<DealStage, { uk: string; en: string }> = {
    new: { uk: 'Новий', en: 'New' },
    in_progress: { uk: 'В роботі', en: 'In Progress' },
    negotiation: { uk: 'Переговори', en: 'Negotiation' },
    won: { uk: 'Виграно', en: 'Won' },
    lost: { uk: 'Програно', en: 'Lost' },
  };

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['crm-deals'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_deals')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return data as Deal[];
    },
  });

  const { data: companies = [] } = useQuery({
    queryKey: ['crm-companies-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_companies').select('id, name').order('name');
      if (error) throw error;
      return data as Company[];
    },
  });

  const { data: contacts = [] } = useQuery({
    queryKey: ['crm-contacts-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_contacts').select('id, first_name, last_name').order('first_name');
      if (error) throw error;
      return data as Contact[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = {
        ...data,
        company_id: data.company_id || null,
        contact_id: data.contact_id || null,
        value: parseFloat(data.value) || 0,
        expected_close_date: data.expected_close_date || null,
      };
      const { error } = await supabase.from('crm_deals').insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast({ title: t({ uk: 'Угоду створено', en: 'Deal created' }) });
      resetForm();
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Deal> }) => {
      const { error } = await supabase.from('crm_deals').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast({ title: t({ uk: 'Угоду оновлено', en: 'Deal updated' }) });
      resetForm();
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_deals').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-deals'] });
      toast({ title: t({ uk: 'Угоду видалено', en: 'Deal deleted' }) });
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ title: '', company_id: '', contact_id: '', stage: 'new', value: '', currency: 'UAH', expected_close_date: '', notes: '' });
    setEditingDeal(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (deal: Deal) => {
    setEditingDeal(deal);
    setFormData({
      title: deal.title,
      company_id: deal.company_id || '',
      contact_id: deal.contact_id || '',
      stage: deal.stage,
      value: deal.value.toString(),
      currency: deal.currency,
      expected_close_date: deal.expected_close_date || '',
      notes: deal.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingDeal) {
      updateMutation.mutate({
        id: editingDeal.id,
        data: {
          ...formData,
          company_id: formData.company_id || null,
          contact_id: formData.contact_id || null,
          value: parseFloat(formData.value) || 0,
          expected_close_date: formData.expected_close_date || null,
        }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDrop = (dealId: string, newStage: DealStage) => {
    updateMutation.mutate({ id: dealId, data: { stage: newStage } });
  };

  const getCompanyName = (id: string | null) => companies.find(c => c.id === id)?.name || '';
  const getContactName = (id: string | null) => {
    const c = contacts.find(c => c.id === id);
    return c ? `${c.first_name} ${c.last_name || ''}`.trim() : '';
  };

  const dealsByStage = STAGES.reduce((acc, { key }) => {
    acc[key] = deals.filter(d => d.stage === key);
    return acc;
  }, {} as Record<DealStage, Deal[]>);

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Handshake className="h-5 w-5" />
            {t({ uk: 'Воронка продажів', en: 'Sales Pipeline' })}
          </CardTitle>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()}>
                <Plus className="mr-2 h-4 w-4" />
                {t({ uk: 'Нова угода', en: 'New Deal' })}
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingDeal ? t({ uk: 'Редагувати угоду', en: 'Edit Deal' }) : t({ uk: 'Нова угода', en: 'New Deal' })}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>{t({ uk: 'Назва', en: 'Title' })} *</Label>
                  <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t({ uk: 'Сума', en: 'Value' })}</Label>
                    <Input type="number" value={formData.value} onChange={e => setFormData({ ...formData, value: e.target.value })} />
                  </div>
                  <div>
                    <Label>{t({ uk: 'Валюта', en: 'Currency' })}</Label>
                    <Select value={formData.currency} onValueChange={value => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="UAH">UAH</SelectItem>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>{t({ uk: 'Стадія', en: 'Stage' })}</Label>
                  <Select value={formData.stage} onValueChange={value => setFormData({ ...formData, stage: value as DealStage })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {STAGES.map(({ key }) => (
                        <SelectItem key={key} value={key}>{t(stageLabels[key])}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ uk: 'Компанія', en: 'Company' })}</Label>
                  <Select value={formData.company_id} onValueChange={value => setFormData({ ...formData, company_id: value })}>
                    <SelectTrigger><SelectValue placeholder={t({ uk: 'Оберіть компанію', en: 'Select company' })} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t({ uk: 'Без компанії', en: 'No company' })}</SelectItem>
                      {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ uk: 'Контакт', en: 'Contact' })}</Label>
                  <Select value={formData.contact_id} onValueChange={value => setFormData({ ...formData, contact_id: value })}>
                    <SelectTrigger><SelectValue placeholder={t({ uk: 'Оберіть контакт', en: 'Select contact' })} /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">{t({ uk: 'Без контакту', en: 'No contact' })}</SelectItem>
                      {contacts.map(c => <SelectItem key={c.id} value={c.id}>{c.first_name} {c.last_name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>{t({ uk: 'Очікувана дата закриття', en: 'Expected Close Date' })}</Label>
                  <Input type="date" value={formData.expected_close_date} onChange={e => setFormData({ ...formData, expected_close_date: e.target.value })} />
                </div>
                <div>
                  <Label>{t({ uk: 'Нотатки', en: 'Notes' })}</Label>
                  <Textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm}>{t({ uk: 'Скасувати', en: 'Cancel' })}</Button>
                  <Button type="submit">{t({ uk: 'Зберегти', en: 'Save' })}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-4">{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {STAGES.map(({ key, color }) => (
                <div
                  key={key}
                  className="flex-shrink-0 w-72 bg-muted/50 rounded-lg p-3"
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => {
                    e.preventDefault();
                    const dealId = e.dataTransfer.getData('dealId');
                    if (dealId) handleDrop(dealId, key);
                  }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-3 h-3 rounded-full ${color}`} />
                    <h3 className="font-semibold">{t(stageLabels[key])}</h3>
                    <span className="ml-auto text-muted-foreground text-sm">{dealsByStage[key].length}</span>
                  </div>
                  <div className="space-y-2">
                    {dealsByStage[key].map(deal => (
                      <div
                        key={deal.id}
                        draggable
                        onDragStart={e => e.dataTransfer.setData('dealId', deal.id)}
                        className="bg-background border border-border rounded-lg p-3 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium truncate">{deal.title}</p>
                            {(deal.company_id || deal.contact_id) && (
                              <p className="text-sm text-muted-foreground truncate">
                                {getCompanyName(deal.company_id) || getContactName(deal.contact_id)}
                              </p>
                            )}
                            <p className="text-sm font-semibold mt-1">
                              {deal.value.toLocaleString()} {deal.currency}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 mt-2 justify-end">
                          <Button variant="ghost" size="sm" onClick={() => setActivityDeal(deal)}>
                            {t({ uk: 'Історія', en: 'History' })}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(deal)}>
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteMutation.mutate(deal.id)}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {activityDeal && (
        <DealActivityDialog deal={activityDeal} onClose={() => setActivityDeal(null)} />
      )}
    </>
  );
};
