import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error('Gagal keluar');
    } else {
      toast.success('Berhasil keluar');
      navigate('/');
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Padel Reservar
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Beranda
          </Link>
          {user && (
            <>
              <Link
                to="/booking"
                className={`text-sm font-medium transition-colors ${
                  isActive('/booking') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Booking
              </Link>
              <Link
                to="/dashboard"
                className={`text-sm font-medium transition-colors ${
                  isActive('/dashboard') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Dashboard
              </Link>
              {isAdmin && (
                <Link
                  to="/admin"
                  className={`text-sm font-medium transition-colors ${
                    isActive('/admin') ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Shield className="inline h-4 w-4 mr-1" />
                  Admin
                </Link>
              )}
            </>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2" asChild>
                <Link to="/dashboard">
                  <User className="h-4 w-4" />
                  Profil
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">Masuk</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/auth">Daftar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};