export default function ExamCardSkeleton() {
  return (
    <div className="rounded-lg shadow-sm overflow-hidden bg-bg-card/70">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start">
          <div className="h-6 w-3/4 bg-gray-700 rounded-md animate-pulse"></div>
          <div className="h-6 w-20 bg-gray-700 rounded-full animate-pulse"></div>
        </div>
        <div className="h-4 w-1/2 bg-gray-700 rounded-md mt-2 animate-pulse"></div>
      </div>
      <div className="p-4 space-y-4">
        <div className="h-4 w-full bg-gray-700 rounded-md animate-pulse"></div>
        <div className="h-4 w-full bg-gray-700 rounded-md animate-pulse"></div>
      </div>
      <div className="p-4 pt-2 border-t">
        <div className="h-10 w-full bg-gray-700 rounded-md animate-pulse"></div>
      </div>
    </div>
  )
}