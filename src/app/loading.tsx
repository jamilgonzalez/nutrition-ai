export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="text-center max-w-4xl w-full">
          {/* MacroCard Skeleton */}
          <div className="w-full max-w-4xl mx-auto mb-8">
            <div className="bg-white rounded-lg border shadow-sm">
              {/* Header Skeleton */}
              <div className="px-6 py-4 border-b">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-48 mx-auto"></div>
              </div>
              
              <div className="p-6 space-y-6">
                {/* Calories Overview Skeleton */}
                <div className="text-center space-y-2">
                  <div className="h-12 bg-gray-200 rounded animate-pulse w-24 mx-auto"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-56 mx-auto"></div>
                  <div className="h-3 bg-gray-200 rounded-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-40 mx-auto"></div>
                </div>

                {/* Macronutrients Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-32"></div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="space-y-1">
                        <div className="text-center">
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-16 mx-auto mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded animate-pulse w-12 mx-auto"></div>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Location Suggestions Skeleton */}
                <div className="space-y-3">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-48"></div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[...Array(2)].map((_, i) => (
                      <div key={i} className="p-4 border rounded-lg">
                        <div className="h-4 bg-gray-200 rounded animate-pulse w-32 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Image Upload Skeleton */}
          <div className="mb-8">
            <div className="w-full max-w-md mx-auto h-64 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </main>

      {/* Floating Action Button Skeleton */}
      <div className="fixed bottom-6 right-6">
        <div className="w-14 h-14 bg-gray-200 rounded-full animate-pulse"></div>
      </div>
    </div>
  )
}