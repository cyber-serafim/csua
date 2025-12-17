import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Plus, Pencil, Trash2, Users, Search } from 'lucide-react';

type Contact = {
  id: string;
  company_id: string | null;
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  position: string | null;
  notes: string | null;
  created_at: string | null;
};

type Company = { id: string; name: string };

export const ContactsTab = () => {
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [formData, setFormData] = useState({ first_name: '', last_name: '', email: '', phone: '', position: '', company_id: '', notes: '' });
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const { data: contacts = [], isLoading } = useQuery({
    queryKey: ['crm-contacts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('crm_contacts')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as Contact[];
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

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const insertData = { ...data, company_id: data.company_id || null };
      const { error } = await supabase.from('crm_contacts').insert([insertData]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({ title: t({ uk: 'Контакт створено', en: 'Contact created' }) });
      resetForm();
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: typeof formData }) => {
      const updateData = { ...data, company_id: data.company_id || null };
      const { error } = await supabase.from('crm_contacts').update(updateData).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({ title: t({ uk: 'Контакт оновлено', en: 'Contact updated' }) });
      resetForm();
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('crm_contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['crm-contacts'] });
      toast({ title: t({ uk: 'Контакт видалено', en: 'Contact deleted' }) });
    },
    onError: () => {
      toast({ title: t({ uk: 'Помилка', en: 'Error' }), variant: 'destructive' });
    },
  });

  const resetForm = () => {
    setFormData({ first_name: '', last_name: '', email: '', phone: '', position: '', company_id: '', notes: '' });
    setEditingContact(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormData({
      first_name: contact.first_name,
      last_name: contact.last_name || '',
      email: contact.email || '',
      phone: contact.phone || '',
      position: contact.position || '',
      company_id: contact.company_id || '',
      notes: contact.notes || '',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateMutation.mutate({ id: editingContact.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getCompanyName = (companyId: string | null) => {
    if (!companyId) return '-';
    const company = companies.find(c => c.id === companyId);
    return company?.name || '-';
  };

  const filteredContacts = contacts.filter(c =>
    c.first_name.toLowerCase().includes(search.toLowerCase()) ||
    c.last_name?.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          {t({ uk: 'Контакти', en: 'Contacts' })}
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
                {editingContact ? t({ uk: 'Редагувати контакт', en: 'Edit Contact' }) : t({ uk: 'Новий контакт', en: 'New Contact' })}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>{t({ uk: "Ім'я", en: 'First Name' })} *</Label>
                  <Input value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                </div>
                <div>
                  <Label>{t({ uk: 'Прізвище', en: 'Last Name' })}</Label>
                  <Input value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <Label>{t({ uk: 'Телефон', en: 'Phone' })}</Label>
                <Input value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <Label>{t({ uk: 'Посада', en: 'Position' })}</Label>
                <Input value={formData.position} onChange={e => setFormData({ ...formData, position: e.target.value })} />
              </div>
              <div>
                <Label>{t({ uk: 'Компанія', en: 'Company' })}</Label>
                <Select value={formData.company_id || 'none'} onValueChange={value => setFormData({ ...formData, company_id: value === 'none' ? '' : value })}>
                  <SelectTrigger>
                    <SelectValue placeholder={t({ uk: 'Оберіть компанію', en: 'Select company' })} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{t({ uk: 'Без компанії', en: 'No company' })}</SelectItem>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t({ uk: 'Пошук...', en: 'Search...' })}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        {isLoading ? (
          <p className="text-center py-4">{t({ uk: 'Завантаження...', en: 'Loading...' })}</p>
        ) : filteredContacts.length === 0 ? (
          <p className="text-center py-4 text-muted-foreground">{t({ uk: 'Немає контактів', en: 'No contacts' })}</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t({ uk: "Ім'я", en: 'Name' })}</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>{t({ uk: 'Телефон', en: 'Phone' })}</TableHead>
                  <TableHead>{t({ uk: 'Компанія', en: 'Company' })}</TableHead>
                  <TableHead className="text-right">{t({ uk: 'Дії', en: 'Actions' })}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map(contact => (
                  <TableRow key={contact.id}>
                    <TableCell className="font-medium">{contact.first_name} {contact.last_name}</TableCell>
                    <TableCell>{contact.email}</TableCell>
                    <TableCell>{contact.phone}</TableCell>
                    <TableCell>{getCompanyName(contact.company_id)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(contact)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(contact.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
