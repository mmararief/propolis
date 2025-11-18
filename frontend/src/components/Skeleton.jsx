// Skeleton Loading Components
export const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
    <div className="w-full aspect-square bg-gray-200"></div>
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="h-6 bg-gray-200 rounded w-1/2"></div>
    </div>
  </div>
);

export const SkeletonProductCard = () => (
  <div className="w-full bg-[#f1f1f1] rounded-lg overflow-hidden animate-pulse">
    <div className="w-full aspect-square bg-gray-200"></div>
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-gray-200 rounded w-24"></div>
        <div className="h-8 bg-gray-200 rounded w-16"></div>
      </div>
    </div>
  </div>
);

export const SkeletonText = ({ lines = 1, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <div
        key={i}
        className={`h-4 bg-gray-200 rounded animate-pulse ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
      ></div>
    ))}
  </div>
);

export const SkeletonButton = ({ className = '' }) => (
  <div className={`h-10 bg-gray-200 rounded-lg animate-pulse ${className}`}></div>
);

export const SkeletonInput = ({ className = '' }) => (
  <div className={`h-10 bg-gray-200 rounded-lg animate-pulse ${className}`}></div>
);

export const SkeletonTable = ({ rows = 3, cols = 4 }) => (
  <div className="space-y-3">
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex gap-4">
        {Array.from({ length: cols }).map((_, colIndex) => (
          <div
            key={colIndex}
            className={`h-12 bg-gray-200 rounded animate-pulse ${
              colIndex === 0 ? 'w-1/4' : colIndex === cols - 1 ? 'w-1/6' : 'flex-1'
            }`}
          ></div>
        ))}
      </div>
    ))}
  </div>
);

export const SkeletonOrderCard = () => (
  <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
    <div className="p-6 border-b border-gray-200 space-y-3">
      <div className="h-6 bg-gray-200 rounded w-1/3"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-4 bg-gray-200 rounded w-1/5"></div>
    </div>
    <div className="p-6 space-y-4">
      {Array.from({ length: 2 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 pb-4 border-b last:border-0">
          <div className="w-16 h-16 bg-gray-200 rounded"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
          <div className="h-5 bg-gray-200 rounded w-24"></div>
        </div>
      ))}
      <div className="pt-4 border-t space-y-2">
        <div className="h-6 bg-gray-200 rounded w-1/3"></div>
        <div className="flex gap-3">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    </div>
  </div>
);

export const SkeletonProgressBar = () => (
  <div className="space-y-4 animate-pulse">
    <div className="flex items-center justify-between">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex-1 flex items-center">
          <div className="flex flex-col items-center flex-1">
            <div className="w-12 h-12 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
            <div className="h-3 bg-gray-200 rounded w-24"></div>
          </div>
          {i < 4 && <div className="h-0.5 bg-gray-200 flex-1 mx-2"></div>}
        </div>
      ))}
    </div>
  </div>
);

