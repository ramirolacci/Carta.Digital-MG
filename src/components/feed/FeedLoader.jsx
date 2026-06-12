// src/components/feed/FeedLoader.jsx

const SkeletonCard = () => (
  <div className="bg-white rounded-none sm:rounded-card border-x-0 border-y sm:border border-slate-800/40 mt-0 mb-6 overflow-hidden">
    {/* Image skeleton */}
    <div className="skeleton w-full aspect-video" />
    {/* Content skeleton */}
    <div className="p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="skeleton h-5 w-16 rounded-full" />
        <div className="skeleton h-4 w-24 rounded" />
      </div>
      <div className="skeleton h-6 w-3/4 rounded" />
      <div className="skeleton h-4 w-full rounded" />
      <div className="skeleton h-4 w-2/3 rounded" />
    </div>
  </div>
);

const FeedLoader = ({ count = 3 }) => (
  <div className="w-full max-w-feed mx-auto px-0 sm:px-4 mt-0">
    {Array.from({ length: count }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

export default FeedLoader;
