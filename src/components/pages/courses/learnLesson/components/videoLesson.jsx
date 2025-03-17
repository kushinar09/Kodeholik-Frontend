import YouTubePlayer from "./youtubePlayer"
import { AlertCircle } from "lucide-react"

export default function VideoLesson({ videoUrl, lessonId, resourceError }) {
  return (
    <>
      {videoUrl ? (
        <div className="bg-black">
          {videoUrl.match(/^[a-zA-Z0-9_-]{11}$/) ? (
            <YouTubePlayer key={lessonId} videoId={videoUrl} />
          ) : (
            <video width="100%" height="auto" controls className="aspect-video mx-auto">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 bg-gray-900">
          <AlertCircle className="h-12 w-12 text-red-400 mb-2" />
          <p className="text-red-400">Video not available</p>
        </div>
      )}
      {resourceError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 p-3 text-center">
          <p className="text-red-200 text-sm">{resourceError}</p>
        </div>
      )}
    </>
  )
}