import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast({
        title: t({ uk: 'Успішно!', en: 'Success!' }),
        description: t({ uk: 'Ви увійшли в систему', en: 'You are logged in' }),
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

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: t({ uk: 'Введіть email адресу', en: 'Please enter your email address' }),
        variant: 'destructive',
      });
      return;
    }

    setResetLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/auth/callback`,
      });

      if (error) throw error;

      toast({
        title: t({ uk: 'Перевірте пошту', en: 'Check your email' }),
        description: t({ 
          uk: 'Посилання для скидання пароля надіслано на вашу пошту', 
          en: 'Password reset link has been sent to your email' 
        }),
      });
    } catch (error: any) {
      toast({
        title: t({ uk: 'Помилка', en: 'Error' }),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero p-4">
      <Card className="w-full max-w-md shadow-large">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl bg-gradient-primary bg-clip-text text-transparent">
            CyberSecurity Ukraine
          </CardTitle>
          <CardDescription>
            {t({ uk: 'Адміністративна панель', en: 'Admin Panel' })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">
                {t({ uk: 'Пароль', en: 'Password' })}
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t({ uk: 'Завантаження...', en: 'Loading...' }) : t({ uk: 'Увійти', en: 'Login' })}
            </Button>
            <Button 
              type="button" 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-foreground"
              onClick={handleForgotPassword}
              disabled={resetLoading}
            >
              {resetLoading 
                ? t({ uk: 'Надсилання...', en: 'Sending...' }) 
                : t({ uk: 'Забули пароль?', en: 'Forgot password?' })
              }
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
