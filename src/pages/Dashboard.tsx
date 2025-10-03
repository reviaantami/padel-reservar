import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  fields: {
    name: string;
  };
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBookings();
  }, [user, navigate]);

  const fetchBookings = async () => {
    if (!user) return;

    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('*, fields(name)')
      .eq('user_id', user.id)
      .order('booking_date', { ascending: false });
    
    if (data) setBookings(data);
    setLoading(false);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'Pending', variant: 'secondary' as const },
      paid: { label: 'Dibayar', variant: 'default' as const },
      canceled: { label: 'Dibatalkan', variant: 'destructive' as const },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8">Dashboard Saya</h1>

        <Card className="mb-8 shadow-elegant">
          <CardHeader>
            <CardTitle>Riwayat Booking</CardTitle>
            <CardDescription>
              Lihat semua booking yang pernah Anda buat
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-center text-muted-foreground">Memuat...</p>
            ) : bookings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Belum ada booking</p>
                <Badge variant="outline" className="cursor-pointer" onClick={() => navigate('/booking')}>
                  Buat Booking Sekarang
                </Badge>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="hover:shadow-elegant transition-all duration-300">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            <span className="font-semibold">{booking.fields.name}</span>
                            {getStatusBadge(booking.status)}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {format(new Date(booking.booking_date), 'dd MMMM yyyy', { locale: id })}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            Rp {booking.total_amount.toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;