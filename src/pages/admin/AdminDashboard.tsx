import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, DollarSign, MapPin, Users } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    totalFields: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    const [bookingsRes, fieldsRes] = await Promise.all([
      supabase.from('bookings').select('total_amount, status'),
      supabase.from('fields').select('id'),
    ]);

    const bookings = bookingsRes.data || [];
    const totalBookings = bookings.length;
    const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
    const totalRevenue = bookings
      .filter((b) => b.status === 'paid')
      .reduce((sum, b) => sum + b.total_amount, 0);
    const totalFields = fieldsRes.data?.length || 0;

    setStats({
      totalBookings,
      pendingBookings,
      totalRevenue,
      totalFields,
    });
  };

  const statCards = [
    {
      title: 'Total Booking',
      value: stats.totalBookings,
      icon: Calendar,
      color: 'text-blue-600',
    },
    {
      title: 'Pending Booking',
      value: stats.pendingBookings,
      icon: Users,
      color: 'text-yellow-600',
    },
    {
      title: 'Total Pendapatan',
      value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`,
      icon: DollarSign,
      color: 'text-green-600',
    },
    {
      title: 'Total Lapangan',
      value: stats.totalFields,
      icon: MapPin,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Admin</h1>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="shadow-elegant">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboard;