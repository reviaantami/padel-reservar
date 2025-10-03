import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AdminSettings = () => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('settings').select('*');
    if (data) {
      const settingsObj: Record<string, string> = {};
      data.forEach((item) => {
        settingsObj[item.key] = item.value || '';
      });
      setSettings(settingsObj);
    }
  };

  const handleUpdate = async (key: string, value: string) => {
    setLoading(true);
    const { error } = await supabase
      .from('settings')
      .update({ value })
      .eq('key', key);

    if (error) {
      toast.error('Gagal mengupdate pengaturan');
    } else {
      toast.success('Pengaturan berhasil diupdate');
      fetchSettings();
    }
    setLoading(false);
  };

  const handleSubmit = (key: string) => (e: React.FormEvent) => {
    e.preventDefault();
    handleUpdate(key, settings[key]);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pengaturan Website</h1>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Informasi Website</CardTitle>
          <CardDescription>Pengaturan umum website</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit('site_name')} className="space-y-4">
            <div>
              <Label htmlFor="site_name">Nama Website</Label>
              <div className="flex gap-2">
                <Input
                  id="site_name"
                  value={settings.site_name || ''}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                />
                <Button type="submit" disabled={loading}>Simpan</Button>
              </div>
            </div>
          </form>

          <form onSubmit={handleSubmit('hero_banner')} className="space-y-4">
            <div>
              <Label htmlFor="hero_banner">URL Hero Banner</Label>
              <div className="flex gap-2">
                <Input
                  id="hero_banner"
                  type="url"
                  value={settings.hero_banner || ''}
                  onChange={(e) => setSettings({ ...settings, hero_banner: e.target.value })}
                  placeholder="https://example.com/banner.jpg"
                />
                <Button type="submit" disabled={loading}>Simpan</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Pembayaran</CardTitle>
          <CardDescription>Pengaturan metode pembayaran</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit('qris_image')} className="space-y-4">
            <div>
              <Label htmlFor="qris_image">URL Gambar QRIS</Label>
              <div className="flex gap-2">
                <Input
                  id="qris_image"
                  type="url"
                  value={settings.qris_image || ''}
                  onChange={(e) => setSettings({ ...settings, qris_image: e.target.value })}
                  placeholder="https://example.com/qris.jpg"
                />
                <Button type="submit" disabled={loading}>Simpan</Button>
              </div>
            </div>
          </form>

          <form onSubmit={handleSubmit('payment_instructions')} className="space-y-4">
            <div>
              <Label htmlFor="payment_instructions">Instruksi Pembayaran</Label>
              <div className="space-y-2">
                <Textarea
                  id="payment_instructions"
                  value={settings.payment_instructions || ''}
                  onChange={(e) => setSettings({ ...settings, payment_instructions: e.target.value })}
                  rows={5}
                />
                <Button type="submit" disabled={loading}>Simpan</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Kontak & Notifikasi</CardTitle>
          <CardDescription>Pengaturan WhatsApp dan webhook</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit('whatsapp_admin')} className="space-y-4">
            <div>
              <Label htmlFor="whatsapp_admin">Nomor WhatsApp Admin</Label>
              <div className="flex gap-2">
                <Input
                  id="whatsapp_admin"
                  value={settings.whatsapp_admin || ''}
                  onChange={(e) => setSettings({ ...settings, whatsapp_admin: e.target.value })}
                  placeholder="628123456789"
                />
                <Button type="submit" disabled={loading}>Simpan</Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Format: 628123456789 (tanpa +)</p>
            </div>
          </form>

          <form onSubmit={handleSubmit('webhook_booking')} className="space-y-4">
            <div>
              <Label htmlFor="webhook_booking">Webhook URL untuk Booking Baru</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook_booking"
                  type="url"
                  value={settings.webhook_booking || ''}
                  onChange={(e) => setSettings({ ...settings, webhook_booking: e.target.value })}
                  placeholder="https://n8n.example.com/webhook/booking"
                />
                <Button type="submit" disabled={loading}>Simpan</Button>
              </div>
            </div>
          </form>

          <form onSubmit={handleSubmit('webhook_payment')} className="space-y-4">
            <div>
              <Label htmlFor="webhook_payment">Webhook URL untuk Pembayaran Dikonfirmasi</Label>
              <div className="flex gap-2">
                <Input
                  id="webhook_payment"
                  type="url"
                  value={settings.webhook_payment || ''}
                  onChange={(e) => setSettings({ ...settings, webhook_payment: e.target.value })}
                  placeholder="https://n8n.example.com/webhook/payment"
                />
                <Button type="submit" disabled={loading}>Simpan</Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;