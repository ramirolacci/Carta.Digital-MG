// src/pages/Login.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../components/common/Button';
import Alert from '../components/common/Alert';
import logoImg from '../assets/logo-migusto-2025.png';

const Login = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, error: authError, login, clearError } = useAuth();
  const [code, setCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLogging, setIsLogging] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      navigate('/admin', { replace: true });
    }
  }, [user, authLoading, navigate]);

  const onSubmit = async (e) => {
    e.preventDefault();
    clearError();
    setIsLogging(true);
    const success = await login(code);
    if (success) {
      navigate('/admin', { replace: true });
    }
    setIsLogging(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <img
              src={logoImg}
              alt="Mi Gusto Logo"
              className="w-16 h-16 object-contain rounded-card shadow-md"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-text">Mi Gusto</h1>
          <p className="text-text-secondary text-sm mt-1">Panel de administración</p>
        </div>

        {/* Form card */}
        <div className="bg-white rounded-card shadow-card p-6">
          <h2 className="font-bold text-text text-lg mb-5">Ingresar al Panel</h2>

          {authError && (
            <Alert
              type="error"
              message={authError}
              onClose={clearError}
              className="mb-4"
            />
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            {/* Clave de Acceso */}
            <div>
              <label className="label" htmlFor="code">Clave de acceso</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary pointer-events-none" />
                <input
                  id="code"
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="input-field pl-10 pr-10"
                  placeholder="Ingrese clave numérica"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              fullWidth
              loading={isLogging}
              className="mt-2"
            >
              Ingresar
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-text-secondary mt-4">
          Solo usuarios autorizados pueden acceder al panel.
        </p>
      </div>
    </div>
  );
};

export default Login;
