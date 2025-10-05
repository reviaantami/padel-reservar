import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface Booking {
  id: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  total_amount: number;
  status: string;
  user_id: string;
  fields: { name: string };
  profiles: { full_name: string };
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTotalBookings();
  }, []);

  useEffect(() => {
    fetchBookings();
  }, [currentPage, limit]);

  const fetchTotalBookings = async () => {
    const { count } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true });
    if (count !== null) setTotalBookings(count);
  };

  const fetchBookings = async () => {
    setLoading(true);
    const start = (currentPage - 1) * limit;
    const end = start + limit - 1;

    const { data, error } = await supabase
      .from('bookings')
      .select('*, fields(name), profiles!bookings_user_id_fkey(full_name)')
      .order('booking_date', { ascending: false })
      .range(start, end);

    setLoading(false);

    if (error) {
      toast.error('Gagal memuat data booking');
      return;
    }
    if (data) setBookings(data);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const { data: updatedBooking, error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId)
      .select('*, fields(name), profiles(full_name, phone)')
      .single();

    if (error) {
      toast.error('Gagal mengupdate status');
      return;
    }

    const { data: settingsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'webhook_booking')
      .single();

    if (settingsData?.value && updatedBooking) {
      try {
        await fetch(settingsData.value, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            booking: updatedBooking,
            user: {
              id: updatedBooking.user_id,
              full_name: updatedBooking.profiles?.full_name || '',
              phone: updatedBooking.profiles?.phone || '',
            },
            field: updatedBooking.fields,
            status: newStatus,
          }),
        });
      } catch (err) {
        console.error('Webhook error:', err);
      }
    }

    toast.success('Status berhasil diupdate');
    fetchBookings();
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

  const totalPages = Math.ceil(totalBookings / limit);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Booking</h1>

      <Card className="shadow-elegant">
        <CardHeader className="flex justify-between items-center">
          <CardTitle>Semua Booking</CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Tampilkan:</span>
            <Select
              value={limit.toString()}
              onValueChange={(val) => {
                setLimit(parseInt(val));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-10 text-muted-foreground">Memuat data...</div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">Tidak ada data booking.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama</TableHead>
                    <TableHead>Lapangan</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Waktu</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.profiles?.full_name || 'User tidak ditemukan'}</TableCell>
                      <TableCell>{booking.fields.name}</TableCell>
                      <TableCell>
                        {format(new Date(booking.booking_date), 'dd MMM yyyy', { locale: id })}
                      </TableCell>
                      <TableCell>
                        {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                      </TableCell>
                      <TableCell>Rp {booking.total_amount.toLocaleString('id-ID')}</TableCell>
                      <TableCell>{getStatusBadge(booking.status)}</TableCell>
                      <TableCell>
                        <Select
                          value={booking.status}
                          onValueChange={(value) => handleStatusChange(booking.id, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="paid">Dibayar</SelectItem>
                            <SelectItem value="canceled">Dibatalkan</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Pagination controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <span className="text-sm text-muted-foreground">
                Halaman {currentPage} dari {totalPages}
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ← Sebelumnya
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Selanjutnya →
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;
