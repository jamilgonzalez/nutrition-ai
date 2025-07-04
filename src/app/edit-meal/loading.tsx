export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header Skeleton */}
      <div className="bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12"></div>
          </div>
          <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="w-4"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="flex-1 px-4 py-6 max-w-2xl mx-auto w-full">
        {/* Meal Image Skeleton */}
        <div className="mb-6">
          <div className="relative">
            <div className="w-full h-64 bg-gray-200 rounded-lg animate-pulse"></div>
            {/* Action buttons overlay skeleton */}
            <div className="absolute top-2 right-2 flex gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>

        {/* Meal Details Input Skeleton */}
        <div className="mb-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-44 mb-2"></div>
          <div className="relative">
            <div className="min-h-[120px] bg-gray-200 rounded-md animate-pulse"></div>
            <div className="absolute bottom-3 right-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-64 mt-1"></div>
        </div>

        {/* Update Button Skeleton */}
        <div className="w-full h-12 bg-gray-200 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}