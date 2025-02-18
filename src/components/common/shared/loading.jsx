import { Loader2 } from "lucide-react"

export default function LoadingScreen({ text = "Loading..." }) {
  return (
    <div className="z-20 fixed inset-0 bg-bg-primary/50 backdrop-blur-sm">
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-lg text-input-text animate-pulse">{text}</p>
        </div>
      </div>
    </div>
  )
}