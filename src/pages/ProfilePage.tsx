import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Profile {
  full_name: string | null;
  phone: string | null;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        // Ambil user dari auth
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          toast.error('Gagal memuat user');
          setLoading(false);
          return;
        }

        setUserEmail(user.email);

        // Ambil data dari tabel profiles
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone')
          .eq('id', user.id)
          .single();

        if (profileError) {
          toast.error('Gagal memuat profil');
        } else {
          setProfile(profileData);
        }
      } catch (err) {
        console.error(err);
        toast.error('Terjadi kesalahan');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleResetPassword = async () => {
    if (!userEmail) return;

    const { error } = await supabase.auth.resetPasswordForEmail(userEmail, {
      redirectTo: `${window.location.origin}/auth/reset`,
    });

    if (error) {
      toast.error('Gagal mengirim email reset password');
    } else {
      toast.success('Link reset password telah dikirim ke email Anda');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[70vh]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-md mt-24">
      <Card className="shadow-lg border-border/60">
        <CardHeader>
          <CardTitle>Profil Saya</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nama Lengkap</label>
            <Input value={profile?.full_name || ''} disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Email</label>
            <Input value={userEmail || ''} disabled />
          </div>
          <div>
            <label className="text-sm font-medium text-muted-foreground">Nomor Telepon</label>
            <Input value={profile?.phone || ''} disabled />
          </div>

          <div className="pt-4">
            <Button
              onClick={handleResetPassword}
              className="w-full"
              variant="outline"
            >
              Kirim Link Reset Password ke Email
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
