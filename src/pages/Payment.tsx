import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { MessageCircle, CheckCircle2 } from 'lucide-react';

const Payment = () => {
  const location = useLocation();
  const { fieldName, date, time, amount } = location.state || {};
  const [qrisImage, setQrisImage] = useState('');
  const [instructions, setInstructions] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
    fetchPaymentInfo();
  }, []);

  const fetchPaymentInfo = async () => {
    const { data } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['qris_image', 'payment_instructions', 'whatsapp_admin']);
    
    if (data) {
      data.forEach((setting) => {
        if (setting.key === 'qris_image') setQrisImage(setting.value || '');
        if (setting.key === 'payment_instructions') setInstructions(setting.value || '');
        if (setting.key === 'whatsapp_admin') setWhatsappNumber(setting.value || '');
      });
    }
  };

  const handleWhatsAppConfirm = () => {
    const message = encodeURIComponent(
      `Halo, saya ingin mengkonfirmasi pembayaran booking:\n\n` +
      `Lapangan: ${fieldName}\n` +
      `Tanggal: ${date}\n` +
      `Waktu: ${time}\n` +
      `Total: Rp ${amount?.toLocaleString('id-ID')}\n\n` +
      `Mohon konfirmasi pembayaran saya. Terima kasih!`
    );
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-4xl">
        <Card className="shadow-elegant">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle2 className="h-16 w-16 text-primary" />
            </div>
            <CardTitle className="text-3xl">Booking Berhasil!</CardTitle>
            <CardDescription>
              Silakan lakukan pembayaran untuk mengkonfirmasi booking Anda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Booking Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Detail Booking</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Lapangan:</span>
                  <span className="font-semibold">{fieldName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tanggal:</span>
                  <span className="font-semibold">{date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Waktu:</span>
                  <span className="font-semibold">{time}</span>
                </div>
                <div className="pt-4 border-t flex justify-between items-center">
                  <span className="text-lg font-semibold">Total Pembayaran:</span>
                  <span className="text-2xl font-bold text-primary">
                    Rp {amount?.toLocaleString('id-ID')}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* QRIS Payment */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Scan kode QRIS berikut untuk melakukan pembayaran
                  </p>
                  {qrisImage ? (
                    <div className="flex justify-center">
                      <img
                        src={qrisImage}
                        alt="QRIS Payment"
                        className="max-w-sm w-full border-2 border-border rounded-lg shadow-lg"
                      />
                    </div>
                  ) : (
                    <div className="bg-muted p-8 rounded-lg">
                      <p className="text-muted-foreground">QRIS belum tersedia</p>
                    </div>
                  )}
                </div>

                {/* Instructions */}
                {instructions && (
                  <div className="bg-primary/5 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Instruksi Pembayaran:</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-line">
                      {instructions}
                    </p>
                  </div>
                )}

                {/* WhatsApp Confirmation */}
                <div className="pt-4 border-t space-y-3">
                  <h4 className="font-semibold text-center">Konfirmasi Pembayaran</h4>
                  <p className="text-sm text-muted-foreground text-center">
                    Setelah melakukan pembayaran, klik tombol di bawah untuk konfirmasi via WhatsApp
                  </p>
                  <Button
                    size="lg"
                    className="w-full shadow-glow"
                    onClick={handleWhatsAppConfirm}
                    disabled={!whatsappNumber}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Konfirmasi via WhatsApp Admin
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Status Info */}
            <Card className="bg-muted">
              <CardContent className="pt-6">
                <p className="text-sm text-center text-muted-foreground">
                  Status booking Anda saat ini adalah <span className="font-semibold text-yellow-600">PENDING</span>.
                  Setelah admin mengkonfirmasi pembayaran, status akan berubah menjadi <span className="font-semibold text-green-600">PAID</span>.
                </p>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment;