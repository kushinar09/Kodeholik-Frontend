import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

export default function DocumentLesson({ attachedFile, onDownload, resourceError }) {
  const getDisplayFileName = (file) => {
    return file ? file.replace("lessons/", "") : ""
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center h-64 bg-gray-900/50 p-6">
        <FileText className="h-16 w-16 text-blue-400 mb-4" />
        <p className="text-gray-300 mb-4 text-center">{getDisplayFileName(attachedFile)}</p>
        <Button
          onClick={onDownload}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          <Download className="h-4 w-4 mr-2" /> Download Document
        </Button>
      </div>
      {resourceError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 p-3 text-center">
          <p className="text-red-200 text-sm">{resourceError}</p>
        </div>
      )}
    </>
  )
}