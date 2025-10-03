import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
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
}

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    const { data } = await supabase
      .from('bookings')
      .select('*, fields(name)')
      .order('booking_date', { ascending: false });
    
    if (data) setBookings(data);
  };

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);

    if (error) {
      toast.error('Gagal mengupdate status');
    } else {
      toast.success('Status berhasil diupdate');
      fetchBookings();
    }
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
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Manajemen Booking</h1>

      <Card className="shadow-elegant">
        <CardHeader>
          <CardTitle>Semua Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
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
                    <TableCell>{booking.user_id.slice(0, 8)}...</TableCell>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminBookings;