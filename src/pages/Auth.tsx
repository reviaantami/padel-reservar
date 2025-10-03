import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { z } from 'zod';

const signUpSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
  fullName: z.string().min(2, { message: 'Nama minimal 2 karakter' }),
  phone: z.string().optional(),
});

const signInSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid' }),
  password: z.string().min(1, { message: 'Password tidak boleh kosong' }),
});

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validData = signUpSchema.parse(signUpData);
      setLoading(true);

      const { error } = await supabase.auth.signUp({
        email: validData.email,
        password: validData.password,
        options: {
          data: {
            full_name: validData.fullName,
            phone: validData.phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success('Akun berhasil dibuat! Silakan cek email Anda.');
      setSignUpData({ email: '', password: '', fullName: '', phone: '' });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || 'Gagal mendaftar');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validData = signInSchema.parse(signInData);
      setLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: validData.email,
        password: validData.password,
      });

      if (error) throw error;

      toast.success('Berhasil masuk!');
      navigate('/');
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.message || 'Gagal masuk');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5">
      <Card className="w-full max-w-md shadow-elegant">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Selamat Datang</CardTitle>
          <CardDescription className="text-center">
            Masuk atau daftar untuk booking lapangan padel
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Masuk</TabsTrigger>
              <TabsTrigger value="signup">Daftar</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="email@example.com"
                    value={signInData.email}
                    onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={signInData.password}
                    onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Nama Lengkap</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={signUpData.fullName}
                    onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="email@example.com"
                    value={signUpData.email}
                    onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Nomor Telepon</Label>
                  <Input
                    id="signup-phone"
                    type="tel"
                    placeholder="08123456789"
                    value={signUpData.phone}
                    onChange={(e) => setSignUpData({ ...signUpData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={signUpData.password}
                    onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? 'Memproses...' : 'Daftar'}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;