import React from 'react';

interface SkeletonLoaderProps {
  type?: 'todo' | 'calendar' | 'header' | 'sidebar';
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type = 'todo', count = 3 }) => {
  const renderTodoSkeleton = () => (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, index) => (
        <div 
          key={index} 
          className="flex items-center space-x-4 p-4 bg-white/90 backdrop-blur-xl rounded-xl border border-red-100 animate-pulse"
          style={{ animationDelay: `${index * 0.1}s` }}
        >
          {/* Checkbox skeleton */}
          <div className="w-6 h-6 bg-gray-200 rounded-lg shimmer"></div>
          
          {/* Content skeleton */}
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded shimmer" style={{ width: `${70 + Math.random() * 20}%` }}></div>
            <div className="flex space-x-2">
              <div className="h-3 w-16 bg-gray-200 rounded-full shimmer"></div>
              <div className="h-3 w-12 bg-gray-200 rounded-full shimmer"></div>
            </div>
          </div>
          
          {/* Actions skeleton */}
          <div className="flex space-x-2">
            <div className="w-8 h-8 bg-gray-200 rounded-lg shimmer"></div>
            <div className="w-8 h-8 bg-gray-200 rounded-lg shimmer"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderCalendarSkeleton = () => (
    <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-red-100 shadow-lg p-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="h-6 w-32 bg-gray-200 rounded shimmer"></div>
        <div className="flex space-x-2">
          <div className="w-8 h-8 bg-gray-200 rounded-lg shimmer"></div>
          <div className="w-8 h-8 bg-gray-200 rounded-lg shimmer"></div>
        </div>
      </div>

      {/* Calendar grid skeleton */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* Day headers */}
        {Array.from({ length: 7 }).map((_, index) => (
          <div key={index} className="p-2 text-center">
            <div className="h-4 w-8 bg-gray-200 rounded shimmer mx-auto"></div>
          </div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: 35 }).map((_, index) => (
          <div key={index} className="min-h-[80px] p-1 border border-gray-100 bg-white">
            <div className="h-4 w-6 bg-gray-200 rounded shimmer mb-2"></div>
            {Math.random() > 0.7 && (
              <div className="space-y-1">
                <div className="h-3 bg-gray-200 rounded shimmer"></div>
                {Math.random() > 0.5 && <div className="h-3 bg-gray-200 rounded shimmer"></div>}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderHeaderSkeleton = () => (
    <div className="bg-white/80 backdrop-blur-xl border-b border-red-100 px-6 lg:px-8 py-6 shadow-lg animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
        <div>
          <div className="h-8 w-48 bg-gray-200 rounded shimmer mb-2"></div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full shimmer"></div>
              <div className="h-4 w-16 bg-gray-200 rounded shimmer"></div>
            </div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-gray-200 rounded-full shimmer"></div>
              <div className="h-4 w-20 bg-gray-200 rounded shimmer"></div>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="h-10 w-24 bg-gray-200 rounded-lg shimmer"></div>
          <div className="h-10 w-28 bg-gray-200 rounded-lg shimmer"></div>
        </div>
      </div>
    </div>
  );

  const renderSidebarSkeleton = () => (
    <div className="w-full lg:w-64 bg-white/90 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-red-100 flex flex-col shadow-xl animate-pulse">
      {/* Logo skeleton */}
      <div className="p-6 border-b border-red-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-200 rounded-xl shimmer"></div>
          <div>
            <div className="h-5 w-24 bg-gray-200 rounded shimmer mb-1"></div>
            <div className="h-3 w-20 bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
      </div>

      {/* Navigation skeleton */}
      <div className="flex-1 p-4">
        <div className="space-y-2 mb-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl">
              <div className="w-5 h-5 bg-gray-200 rounded shimmer"></div>
              <div className="h-4 w-20 bg-gray-200 rounded shimmer"></div>
            </div>
          ))}
        </div>

        {/* Categories skeleton */}
        <div className="hidden lg:block">
          <div className="h-4 w-16 bg-gray-200 rounded shimmer mb-3"></div>
          <div className="space-y-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="w-full flex items-center space-x-3 px-3 py-2">
                <div className="w-2 h-2 bg-gray-200 rounded-full shimmer"></div>
                <div className="h-3 w-16 bg-gray-200 rounded shimmer"></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User section skeleton */}
      <div className="p-4 border-t border-red-100">
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full shimmer"></div>
          <div className="flex-1">
            <div className="h-4 w-20 bg-gray-200 rounded shimmer mb-1"></div>
            <div className="h-3 w-12 bg-gray-200 rounded shimmer"></div>
          </div>
        </div>
        <div className="w-full h-8 bg-gray-200 rounded-lg shimmer"></div>
      </div>
    </div>
  );

  switch (type) {
    case 'calendar':
      return renderCalendarSkeleton();
    case 'header':
      return renderHeaderSkeleton();
    case 'sidebar':
      return renderSidebarSkeleton();
    default:
      return renderTodoSkeleton();
  }
};

export default SkeletonLoader;