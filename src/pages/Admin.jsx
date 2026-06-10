// src/pages/Admin.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import AdminPanel from '../components/admin/AdminPanel';
import ToastContainer from '../components/common/ToastContainer';
import { LogOut, Loader2, ShieldCheck, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';

const Admin = () => {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-secondary">
        <Loader2 size={32} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background-secondary">
      {/* Admin header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between max-w-7xl mx-auto">
          {/* Logo */}
          <a href="https://migusto.com.ar/" className="flex items-center gap-2.5 group">
            <img
              src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
              alt="Mi Gusto Logo"
              className="w-10 h-10 object-contain rounded-btn"
            />
            <div>
              <span className="text-[10px] text-text-secondary leading-none tracking-wide uppercase flex items-center gap-1 font-bold">
                <ShieldCheck size={10} />
                Admin
              </span>
            </div>
          </a>

          {/* User info & logout */}
          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary
                         hover:text-primary px-3 py-2 rounded-btn hover:bg-primary/10 transition-colors"
            >
              <Eye size={16} />
              <span className="hidden sm:inline">Ver Sitio</span>
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary
                         hover:text-primary px-3 py-2 rounded-btn hover:bg-primary/10 transition-colors"
              aria-label="Cerrar sesión"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-7xl mx-auto w-full">
        <AdminPanel />
      </main>

      <ToastContainer />
    </div>
  );
};

export default Admin;
