import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, User, Shield, Menu, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState } from 'react';

export const Navbar = () => {
  const { user, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

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

  const navItems = [
    { path: '/', label: 'Beranda' },
    { path: '/booking', label: 'Booking' },
    { path: '/dashboard', label: 'Dashboard' },
    ...(isAdmin ? [{ path: '/admin', label: 'Admin', icon: <Shield className="inline h-4 w-4 mr-1" /> }] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent"
        >
          Padel Reservar
        </Link>

        {/* Tombol menu mobile */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>

        {/* Menu utama (desktop) */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`text-sm font-medium transition-colors ${
                isActive(item.path)
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Tombol kanan */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                asChild
              >
                <Link to="/profile">
                  <User className="h-4 w-4" />
                  Profil
                </Link>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="gap-2"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/auth">Masuk</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Menu dropdown mobile */}
      {menuOpen && (
        <div className="md:hidden bg-background border-t border-border">
          <div className="flex flex-col px-4 py-3 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMenuOpen(false)}
                className={`text-sm font-medium ${
                  isActive(item.path)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}

            <div className="border-t pt-3">
              {user ? (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2"
                    asChild
                  >
                    <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                      <User className="h-4 w-4" />
                      Profil
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                    Keluar
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="w-full"
                  asChild
                  onClick={() => setMenuOpen(false)}
                >
                  <Link to="/auth">Masuk</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
