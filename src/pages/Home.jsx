// src/pages/Home.jsx
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFeedPromotions } from '../hooks/usePromotions';
import FeedList from '../components/feed/FeedList';
import { sucursales } from '../data/sucursalesData';

const Home = () => {
  const [searchParams] = useSearchParams();
  const sucursalName = searchParams.get('sucursal') || '';

  const {
    promotions,
    loading,
    loadingMore,
    error,
    hasMore,
    fetchInitial,
    fetchMore,
    retry,
  } = useFeedPromotions();

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  const sucursal = sucursales.find(
    (s) => s.nombre.toLowerCase() === sucursalName.toLowerCase()
  );

  if (sucursal) {
    return (
      <div className="min-h-screen bg-background py-10">
        <div className="max-w-xl mx-auto px-4 flex flex-col items-center text-center">
          {/* Sucursal Title */}
          <h1 className="font-display text-2xl sm:text-4xl md:text-5xl font-black text-text tracking-wide sm:tracking-widest uppercase mb-6 sm:mb-10 border-b-2 border-primary pb-2 sm:pb-3 inline-block max-w-full break-words">
            {sucursal.nombre}
          </h1>

          {/* Dirección Section */}
          <div className="w-full mb-8">
            <h2 className="text-xs font-extrabold tracking-widest text-text uppercase mb-2">
              DIRECCIÓN:
            </h2>
            <p className="text-text-secondary text-sm uppercase mb-4">
              {sucursal.direccion}
            </p>
            {/* Google Map Embed */}
            <div className="w-full h-64 sm:h-80 rounded-card overflow-hidden border border-slate-800 shadow-lg">
              <iframe
                src={sucursal.mapaEmbedUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title={`Mapa de ${sucursal.nombre}`}
              />
            </div>
          </div>

          {/* Teléfonos Section */}
          <div className="w-full mb-8">
            <h2 className="text-xs font-extrabold tracking-widest text-text uppercase mb-2">
              TELÉFONOS:
            </h2>
            <p className="text-text-secondary text-sm uppercase tracking-wide">
              {sucursal.telefono} / <span className="font-bold text-green-500">WHATSAPP</span>
            </p>
          </div>

          {/* Horarios Section */}
          <div className="w-full mb-8">
            <h2 className="text-xs font-extrabold tracking-widest text-text uppercase mb-4">
              HORARIOS:
            </h2>
            <div className="flex flex-col gap-4">
              {sucursal.horario.split('|').map((part) => {
                const line = part.trim();
                const match = line.match(/(?:\d{2}:\d{2})/);
                if (match) {
                  const index = match.index;
                  const days = line.substring(0, index).trim();
                  const hours = line.substring(index).trim();
                  return (
                    <div key={line}>
                      <span className="font-bold text-text text-sm block mb-0.5 tracking-wider">
                        {days.toUpperCase()}
                      </span>
                      <span className="text-text-secondary text-sm tracking-wide">
                        {hours.toUpperCase()}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={line}>
                    <span className="text-text-secondary text-sm tracking-wide uppercase">
                      {line.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Banner Hace tu pedido */}
        <div className="w-full bg-black py-4 my-8 border-y border-slate-900">
          <a
            href="https://www.tepido.com.ar/restaurantes?q=migusto"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-yellow-400 hover:text-yellow-300 font-extrabold text-lg sm:text-xl tracking-widest transition-transform hover:scale-105"
          >
            <span>👉 HACE TU PEDIDO ONLINE ACÁ 👈</span>
          </a>
        </div>

        <div className="max-w-xl mx-auto px-4 text-center">
          {/* App Disclaimer */}
          <div className="text-[10px] sm:text-xs text-yellow-500/80 font-semibold tracking-wider uppercase mb-10">
            ⚡ CONSULTA DE CUPONES Y PROMOCIONES EXCLUSIVAS EN NUESTRA APP ⚡
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background mt-0 pt-0 pb-6 sm:py-6">
      <FeedList
        promotions={promotions}
        loading={loading}
        loadingMore={loadingMore}
        error={error}
        hasMore={hasMore}
        onRetry={retry}
        onLoadMore={fetchMore}
      />
    </div>
  );
};

export default Home;
