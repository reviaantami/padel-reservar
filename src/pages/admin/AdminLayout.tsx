import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, FileText, Settings, LayoutDashboard } from 'lucide-react';

const AdminLayout = () => {
  const { isAdmin, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate('/');
    }
  }, [isAdmin, loading, navigate]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  const isActive = (path: string) => location.pathname === path;

  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/fields', icon: MapPin, label: 'Lapangan' },
    { path: '/admin/bookings', icon: Calendar, label: 'Booking' },
    { path: '/admin/articles', icon: FileText, label: 'Artikel' },
    { path: '/admin/settings', icon: Settings, label: 'Pengaturan' },
  ];

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 space-y-2">
            <div className="bg-card border rounded-lg p-4 shadow-elegant sticky top-24">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Admin Panel
              </h2>
              <nav className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      variant={isActive(item.path) ? 'default' : 'ghost'}
                      className="w-full justify-start"
                      asChild
                    >
                      <Link to={item.path}>
                        <Icon className="mr-2 h-4 w-4" />
                        {item.label}
                      </Link>
                    </Button>
                  );
                })}
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminLayout;