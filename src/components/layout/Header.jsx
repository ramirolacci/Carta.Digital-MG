// src/components/layout/Header.jsx
import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { ChevronDown, Search, X } from 'lucide-react';
import { sucursales } from '../../data/sucursalesData';

const Header = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeSucursal = searchParams.get('sucursal') || '';
  const isAdmin = location.pathname.startsWith('/admin');

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredSucursales = sucursales.filter((s) =>
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectSucursal = (nombre) => {
    setSearchParams({ sucursal: nombre });
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSearchParams({});
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-feed md:max-w-none mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="https://migusto.com.ar/" className="flex items-center gap-2.5 group">
          <img
            src={`${import.meta.env.BASE_URL}Logo Mi Gusto 2025.png`}
            alt="Mi Gusto Logo"
            className="w-12 h-12 object-contain rounded-btn"
          />
        </a>

        {/* Nav */}
        <nav className="flex items-center gap-2 sm:gap-4">
          {!isAdmin && (
            <>
              {/* Sucursales Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors px-3 py-2 rounded-btn"
                >
                  <span>{activeSucursal || 'Sucursales'}</span>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {isOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-background-secondary border border-slate-800 rounded-card shadow-lg z-50 overflow-hidden">
                    {/* Search inside dropdown */}
                    <div className="p-2 border-b border-slate-800 flex items-center gap-2">
                      <Search size={14} className="text-text-secondary opacity-50" />
                      <input
                        type="text"
                        placeholder="Buscar sucursal..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-xs text-text outline-none placeholder-text-secondary"
                        autoFocus
                      />
                      {searchTerm && (
                        <button onClick={() => setSearchTerm('')}>
                          <X size={14} className="text-text-secondary hover:text-text" />
                        </button>
                      )}
                    </div>

                    {/* Scrollable List */}
                    <ul className="max-h-60 overflow-y-auto scrollbar-thin py-1">
                      {filteredSucursales.length > 0 ? (
                        filteredSucursales.map((s) => (
                          <li key={s.nombre}>
                            <button
                              onClick={() => handleSelectSucursal(s.nombre)}
                              className={`w-full text-left px-4 py-2 text-xs transition-colors hover:bg-primary/10 hover:text-primary ${
                                activeSucursal === s.nombre ? 'bg-primary/5 text-primary font-semibold' : 'text-text-secondary'
                              }`}
                            >
                              {s.nombre}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li className="px-4 py-3 text-xs text-text-secondary text-center">
                          No se encontraron sucursales
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>

              {/* Carta Digital Link */}
              <button
                onClick={handleClear}
                className={`text-sm font-semibold transition-colors px-3 py-2 rounded-btn ${
                  !activeSucursal ? 'text-primary font-bold' : 'text-text-secondary hover:text-primary'
                }`}
              >
                Carta Digital
              </button>
            </>
          )}

          {isAdmin && (
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm font-semibold text-text-secondary hover:text-primary transition-colors px-3 py-2 rounded-btn hover:bg-primary/5"
            >
              Ver Feed
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
