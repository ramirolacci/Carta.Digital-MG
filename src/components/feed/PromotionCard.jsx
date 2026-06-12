// src/components/feed/PromotionCard.jsx
import { memo, useState } from 'react';
import { ImageOff } from 'lucide-react';

const PromotionCard = memo(({ promotion }) => {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <article className="feed-card !opacity-100 bg-background-secondary rounded-none sm:rounded-card overflow-hidden mt-0 mb-6 border-x-0 border-y sm:border border-slate-800/40 shadow-md">
      <div className="relative w-full min-h-[150px] bg-background-secondary flex items-center justify-center">
        {/* Skeleton while loading */}
        {!imgLoaded && !imgError && (
          <div className="absolute inset-0 skeleton animate-pulse" />
        )}

        {/* Error state */}
        {imgError ? (
          <div className="flex flex-col items-center justify-center text-text-secondary p-8 gap-2">
            <ImageOff size={32} className="opacity-30" />
            <span className="text-sm opacity-50">Imagen no disponible</span>
          </div>
        ) : (
          <img
            src={promotion.imageUrl?.startsWith('/') ? `${import.meta.env.BASE_URL}${promotion.imageUrl.slice(1)}` : promotion.imageUrl}
            alt={promotion.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setImgLoaded(true)}
            onError={() => { setImgError(true); setImgLoaded(true); }}
            className={`
              w-full h-auto transition-opacity duration-300
              ${imgLoaded ? 'opacity-100' : 'opacity-0'}
            `}
          />
        )}
      </div>
    </article>
  );
});

PromotionCard.displayName = 'PromotionCard';

export default PromotionCard;
