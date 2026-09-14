// src/components/common/Revista.jsx
import { useState, useRef, useEffect } from 'react';
import HTMLFlipBook from 'react-pageflip';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFlip } from 'swiper/modules';
import Zoom from 'react-medium-image-zoom';
import { Loader2, ImageOff } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/effect-flip';
import 'react-medium-image-zoom/dist/styles.css';
import './Revista.css';
import tapaImg from '../../assets/tapa1.jpg';

const Revista = ({ promotions = [], loading = false }) => {
  const [paginaActual, setPaginaActual] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [flipbookDimensions] = useState({ width: 500, height: 700 });

  const flipBook = useRef(null);
  const swiperRef = useRef(null);

  // Ocultar la barra de scroll vertical del cuerpo mientras la vista Revista esté montada
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  // Tapa por defecto (importada directamente como asset para evitar 404 en servidor)
  const tapaUrl = tapaImg;

  // Extraer las imágenes de las promociones activas cargadas por el admin
  const promoPages = promotions
    .filter((p) => p && p.imageUrl)
    .map((p) => {
      const url = p.imageUrl;
      if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
        return url;
      }
      const baseUrl = import.meta.env.BASE_URL;
      const cleanUrl = url.startsWith('/') ? url.slice(1) : url;
      return `${baseUrl}${cleanUrl}`;
    });

  // La portada es tapa1.jpg y luego siguen las promociones de la carta digital
  const pages = [tapaUrl, ...promoPages];

  // Detectar tamaño de pantalla para cambiar entre Desktop (FlipBook) y Mobile (Swiper Flip)
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 900);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const totalPaginas = pages.length;
  const canGoPrev = paginaActual > 0;
  const canGoNext = paginaActual < totalPaginas - 1;

  const handlePrev = () => {
    if (isMobile) {
      swiperRef.current?.slidePrev();
    } else {
      flipBook.current?.pageFlip()?.flipPrev();
    }
  };

  const handleNext = () => {
    if (isMobile) {
      swiperRef.current?.slideNext();
    } else {
      flipBook.current?.pageFlip()?.flipNext();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 size={36} className="animate-spin text-primary" />
        <span className="text-sm font-semibold text-text-secondary">Cargando revista...</span>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-background-secondary flex items-center justify-center text-text-secondary">
          <ImageOff size={28} />
        </div>
        <p className="text-base font-bold text-text">No hay imágenes disponibles</p>
        <p className="text-xs text-text-secondary max-w-xs">
          Cargá promociones desde el panel de administración para verlas en la revista interactiva.
        </p>
      </div>
    );
  }

  const portada = pages[0];
  const paginasInternas = pages.slice(1);

  return (
    <div className="revista-section">
      <div className="revista-container max-w-[94vw] xl:max-w-[90vw] mx-auto w-full h-full">
        <div className="revista-content-wrapper">
          {isMobile ? (
            /* VISTA MÓVIL CON SWIPER EFFECT FLIP */
            <div className="revista-swiper-wrapper max-w-sm sm:max-w-md mx-auto">
              <Swiper
                key={`swiper-${pages.length}`}
                modules={[EffectFlip]}
                effect="flip"
                spaceBetween={0}
                slidesPerView={1}
                initialSlide={0}
                onSwiper={(swiper) => {
                  swiperRef.current = swiper;
                }}
                onSlideChange={(swiper) => setPaginaActual(swiper.activeIndex)}
                className="revista-swiper"
              >
                {pages.map((src, i) => (
                  <SwiperSlide key={i}>
                    <div className="revista-pagina">
                      <Zoom>
                        <img
                          src={src}
                          alt={i === 0 ? 'Portada de la revista' : `Página ${i}`}
                          className="revista-img"
                        />
                      </Zoom>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : (
            /* VISTA ESCRITORIO CON HTMLFlipBook */
            <div className="flipbook-wrapper">
              <HTMLFlipBook
                key={`flipbook-${pages.length}`}
                ref={flipBook}
                width={580}
                height={820}
                size="stretch"
                minWidth={360}
                maxWidth={800}
                minHeight={500}
                maxHeight={1000}
                drawShadow={true}
                showCover={true}
                mobileScrollSupport={true}
                className="revista-flipbook"
                startPage={0}
                flippingTime={450}
                usePortrait={true}
                maxShadowOpacity={0.6}
                useMouseEvents={true}
                disableFlipByClick={false}
                onFlip={(e) => setPaginaActual(e.data)}
                autoSize={true}
                swipeDistance={20}
                showPageCorners={false}
                style={{}}
                startZIndex={0}
              >
                {pages.map((src, i) => (
                  <div className="revista-pagina" key={i}>
                    <img
                      src={src}
                      alt={i === 0 ? 'Portada de la revista' : `Página ${i}`}
                      className="revista-img"
                    />
                  </div>
                ))}
              </HTMLFlipBook>
            </div>
          )}

          {/* Botones de Navegación Lateral */}
          {pages.length > 1 && (
            <>
              <button
                type="button"
                className={`revista-nav-button left ${!canGoPrev ? 'disabled' : ''}`}
                onClick={handlePrev}
                disabled={!canGoPrev}
                aria-label="Página anterior"
              >
                ❮
              </button>
              <button
                type="button"
                className={`revista-nav-button right ${!canGoNext ? 'disabled' : ''}`}
                onClick={handleNext}
                disabled={!canGoNext}
                aria-label="Página siguiente"
              >
                ❯
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Revista;

