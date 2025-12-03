import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      // Get the hash fragment from URL
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token');
      const type = hashParams.get('type');

      if (accessToken && refreshToken) {
        // Set the session manually
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
          navigate('/admin/login');
          return;
        }

        // Check if this is an invite/recovery flow (user needs to set password)
        if (type === 'invite' || type === 'recovery' || type === 'signup') {
          navigate('/admin/set-password');
        } else {
          navigate('/admin/dashboard');
        }
      } else {
        // No tokens in URL, check for existing session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          navigate('/admin/dashboard');
        } else {
          navigate('/admin/login');
        }
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-hero">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Перенаправлення...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
