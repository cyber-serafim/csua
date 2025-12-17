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
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, CheckSquare, Pencil, Trash2, Search, Calendar, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { uk, enUS } from 'date-fns/locale';

type Task = {
  id: string;
  deal_id: string | null;
  contact_id: string | null;
  title: string;
  description: string | null;
  due_date: string | null;
  completed: boolean;
  completed_at: string | null;
  created_at: string | null;
};

type Deal = { id: string; title: string };
type Contact = { id: string; first_name: string; last_name: string | null };

export const TasksTab = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({ title: '', description: '', deal_id: '', contact_id: '', due_date: '' });
  const { toast } = useToast();
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['crm-tasks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_tasks')
        .select('*')
        .order('due_date', { ascending: true, nullsFirst: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const { data: deals = [] } = useQuery({
    queryKey: ['crm-deals-list'],
    queryFn: async () => {
      const { data, error } = await supabase.from('crm_deals').select('id, title').order('title');
      if (error) throw error;
      return data as Deal[];
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
        deal_id: data.deal_id || null,
        contact_id: data.contact_id || null,
        due_date: data.due_date || null,
      };
      const { error } = await supabase.from('crm_tasks').insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({ title: t({ uk: 'Задачу створено', en: 'Task created' }) });
      resetForm();
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Task> }) => {
      const { error } = await supabase.from('crm_tasks').update(data).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({ title: t({ uk: 'Задачу оновлено', en: 'Task updated' }) });
      resetForm();
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_tasks').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-tasks'] });
      toast({ title: t({ uk: 'Задачу видалено', en: 'Task deleted' }) });
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const toggleComplete = (task: Task) => {
    updateMutation.mutate({
      id: task.id,
      data: {
        completed: !task.completed,
        completed_at: !task.completed ? new Date().toISOString() : null,
      },
    });
  };

  const resetForm = () => {
    setFormData({ title: '', description: '', deal_id: '', contact_id: '', due_date: '' });
    setEditingTask(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      deal_id: task.deal_id || '',
      contact_id: task.contact_id || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      updateMutation.mutate({
        id: editingTask.id,
        data: {
          ...formData,
          deal_id: formData.deal_id || null,
          contact_id: formData.contact_id || null,
          due_date: formData.due_date || null,
        }
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getDealTitle = (id: string | null) => deals.find(d => d.id === id)?.title || '';
  const getContactName = (id: string | null) => {
    const c = contacts.find(c => c.id === id);
    return c ? `${c.first_name} ${c.last_name || ''}`.trim() : '';
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'all' || (filter === 'completed' ? task.completed : !task.completed);
    return matchesSearch && matchesFilter;
  });

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date() && !dueDate.startsWith(new Date().toISOString().split('T')[0]);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between flex-wrap gap-4">
        <CardTitle className="flex items-center gap-2">
          <CheckSquare className="h-5 w-5" />
          {t({ uk: 'Задачі', en: 'Tasks' })}
        </CardTitle>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              {t({ uk: 'Додати', en: 'Add' })}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? t({ uk: 'Редагувати задачу', en: 'Edit Task' }) : t({ uk: 'Нова задача', en: 'New Task' })}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>{t({ uk: 'Назва', en: 'Title' })} *</Label>
                <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div>
                <Label>{t({ uk: 'Опис', en: 'Description' })}</Label>
                <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div>
                <Label>{t({ uk: 'Термін виконання', en: 'Due Date' })}</Label>
                <Input type="datetime-local" value={formData.due_date} onChange={e => setFormData({ ...formData, due_date: e.target.value })} />
              </div>
              <div>
                <Label>{t({ uk: 'Угода', en: 'Deal' })}</Label>
                <Select value={formData.deal_id} onValueChange={value => setFormData({ ...formData, deal_id: value })}>
                  <SelectTrigger><SelectValue placeholder={t({ uk: 'Оберіть угоду', en: 'Select deal' })} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">{t({ uk: 'Без угоди', en: 'No deal' })}</SelectItem>
                    {deals.map(d => <SelectItem key={d.id} value={d.id}>{d.title}</SelectItem>)}
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
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>{t({ uk: 'Скасувати', en: 'Cancel' })}</Button>
                <Button type="submit">{t({ uk: 'Зберегти', en: 'Save' })}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t({ uk: 'Пошук...', en: 'Search...' })}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={(v: typeof filter) => setFilter(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t({ uk: 'Всі задачі', en: 'All tasks' })}</SelectItem>
              <SelectItem value="pending">{t({ uk: 'Невиконані', en: 'Pending' })}</SelectItem>
              <SelectItem value="completed">{t({ uk: 'Виконані', en: 'Completed' })}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {isLoading ? (
          <p className="text-center py-4">{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
        ) : filteredTasks.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">{t({ uk: 'Немає задач', en: 'No tasks' })}</p>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map(task => (
              <div
                key={task.id}
                className={`flex items-start gap-3 p-3 rounded-lg border ${
                  task.completed ? 'bg-muted/30' : isOverdue(task.due_date) ? 'border-destructive/50 bg-destructive/5' : 'bg-background'
                }`}
              >
                <Checkbox
                  checked={task.completed}
                  onCheckedChange={() => toggleComplete(task)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
                  )}
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                    {task.due_date && (
                      <span className={`flex items-center gap-1 ${isOverdue(task.due_date) && !task.completed ? 'text-destructive' : ''}`}>
                        <Calendar className="h-3 w-3" />
                        {format(new Date(task.due_date), 'dd MMM yyyy HH:mm', { locale: language === 'uk' ? uk : enUS })}
                      </span>
                    )}
                    {task.deal_id && (
                      <span className="flex items-center gap-1">
                        {t({ uk: 'Угода:', en: 'Deal:' })} {getDealTitle(task.deal_id)}
                      </span>
                    )}
                    {task.contact_id && (
                      <span className="flex items-center gap-1">
                        {t({ uk: 'Контакт:', en: 'Contact:' })} {getContactName(task.contact_id)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(task)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteMutation.mutate(task.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
