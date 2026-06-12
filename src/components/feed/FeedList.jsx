// src/components/feed/FeedList.jsx
import { useEffect, useRef, useCallback } from 'react';
import { RefreshCw, Inbox, Loader2 } from 'lucide-react';
import PromotionCard from './PromotionCard';
import FeedLoader from './FeedLoader';
import Button from '../common/Button';

const FeedList = ({
  promotions,
  loading,
  loadingMore,
  error,
  hasMore,
  onRetry,
  onLoadMore,
}) => {
  const sentinelRef = useRef(null);

  // Intersection Observer for infinite scroll
  const handleObserver = useCallback(
    (entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !loadingMore && !loading) {
        onLoadMore();
      }
    },
    [hasMore, loadingMore, loading, onLoadMore]
  );

  useEffect(() => {
    const sentinel = sentinelRef.current;
    const observer = new IntersectionObserver(handleObserver, {
      root: null,
      rootMargin: '200px',
      threshold: 0,
    });
    if (sentinel) observer.observe(sentinel);
    return () => { if (sentinel) observer.unobserve(sentinel); };
  }, [handleObserver]);

  // Loading state
  if (loading) return <FeedLoader count={4} />;

  // Error state
  if (error) {
    return (
      <div className="max-w-feed mx-auto px-4 py-16 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
          <RefreshCw size={24} className="text-error" />
        </div>
        <h3 className="font-bold text-text text-lg">Algo salió mal</h3>
        <p className="text-text-secondary text-sm max-w-xs">{error}</p>
        <Button onClick={onRetry} variant="outline" icon={RefreshCw} size="sm">
          Intentar de nuevo
        </Button>
      </div>
    );
  }

  // Empty state
  if (!promotions.length) {
    return (
      <div className="max-w-feed mx-auto px-4 py-20 flex flex-col items-center gap-4 text-center">
        <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center">
          <Inbox size={32} className="text-text-secondary opacity-50" />
        </div>
        <h3 className="font-display font-bold text-text text-xl">Sin promociones</h3>
        <p className="text-text-secondary text-sm max-w-xs">
          Todavía no hay promociones activas. ¡Volvé pronto!
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-feed mx-auto px-0 sm:px-4 mt-0 pt-0 pb-6 sm:py-6">
      {promotions.map((promotion) => (
        <PromotionCard key={promotion.id} promotion={promotion} />
      ))}

      {/* Infinite scroll sentinel */}
      <div ref={sentinelRef} className="h-4" />

      {/* Loading more indicator */}
      {loadingMore && (
        <div className="flex justify-center py-6">
          <Loader2 size={24} className="animate-spin text-primary" />
        </div>
      )}

      {/* End of feed */}
      {!hasMore && promotions.length > 0 && (
        <div className="text-center py-8 text-text-secondary text-sm">
          <div className="inline-flex items-center gap-2">
            <span className="w-8 h-px bg-gray-200" />
            <span>Fin de las promociones</span>
            <span className="w-8 h-px bg-gray-200" />
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedList;
