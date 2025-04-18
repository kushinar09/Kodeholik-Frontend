import ExamCardSkeleton from "./ExamCardSkeleton"

export default function LoadingSkeleton() {
  return (
    <div className="py-8 px-36 flex-grow bg-bg-primary">
      {/* Happening Now Skeleton */}
      <div className="mb-10">
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-bg-card to-[#1E282C] shadow-lg p-6 md:p-8">
          <div className="flex items-center mb-4">
            <div className="h-8 w-40 bg-white/30 rounded-md animate-pulse"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white/20 rounded-lg overflow-hidden">
                <div className="p-4 border-b border-white/20">
                  <div className="flex justify-between items-start">
                    <div className="h-6 w-3/4 bg-white/30 rounded-md animate-pulse"></div>
                    <div className="h-6 w-20 bg-white/30 rounded-full animate-pulse"></div>
                  </div>
                  <div className="h-4 w-1/2 bg-white/30 rounded-md mt-2 animate-pulse"></div>
                </div>
                <div className="p-4 space-y-4">
                  <div className="h-4 w-full bg-white/30 rounded-md animate-pulse"></div>
                  <div className="h-4 w-full bg-white/30 rounded-md animate-pulse"></div>
                </div>
                <div className="p-4 pt-2 border-t border-white/20">
                  <div className="h-10 w-full bg-white/30 rounded-md animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="mb-6">
        <div className="flex border-b">
          <div className="h-10 w-32 bg-bg-card/70 rounded-md mr-4 animate-pulse"></div>
          <div className="h-10 w-32 bg-bg-card/70 rounded-md animate-pulse"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <ExamCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  )
}