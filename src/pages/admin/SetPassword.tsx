import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const SetPassword = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: t({ uk: 'Помилка', en: 'Error' }),
          description: t({ 
            uk: 'Посилання недійсне або застаріло. Спробуйте ще раз.', 
            en: 'Link is invalid or expired. Please try again.' 
          }),
          variant: 'destructive',
        });
        navigate('/admin/login');
        return;
      }
      
      setChecking(false);
    };

    checkSession();
  }, [navigate, toast, t]);

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Паролі не співпадають', en: 'Passwords do not match' }),
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Пароль має бути мінімум 6 символів', en: 'Password must be at least 6 characters' }),
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) throw error;

      toast({
        title: t({ uk: 'Успішно!', en: 'Success!' }),
        description: t({ uk: 'Пароль встановлено', en: 'Password has been set' }),
      });
      
      navigate('/admin/dashboard');
    } catch (error: any) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
        <Card className="w-full max-w-md shadow-large">
          <CardContent className="p-6 text-center">
            {t({ uk: 'Перевірка...', en: 'Checking...' })}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
            CyberSecurity Ukraine
          </CardTitle>
          <CardDescription>
            {t({ uk: 'Встановлення пароля', en: 'Set Password' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">
                {t({ uk: 'Новий пароль', en: 'New Password' })}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">
                {t({ uk: 'Підтвердіть пароль', en: 'Confirm Password' })}
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading 
                ? t({ uk: 'Збереження...', en: 'Saving...' }) 
                : t({ uk: 'Встановити пароль', en: 'Set Password' })
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SetPassword;
