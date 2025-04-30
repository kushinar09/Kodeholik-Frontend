"use client"

import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

export default function DocumentLesson({ attachedFile, onDownload, resourceError }) {
  const getDisplayFileName = (file) => {
    return file ? file.replace("lessons/", "").split("-").pop() : ""
  }

  return (
    <>
      <div className="relative flex flex-col items-center justify-center h-48 sm:h-64 bg-gray-900/50 p-4 sm:p-6">
        <FileText className="h-12 w-12 sm:h-16 sm:w-16 text-blue-400 mb-3 sm:mb-4" />
        <p className="text-gray-300 mb-3 sm:mb-4 text-center text-xs sm:text-base">
          {getDisplayFileName(attachedFile)}
        </p>
        <Button
          onClick={onDownload}
          size="icon"
          className="absolute top-2 right-2 bg-transparent hover:text-bg-card transition-all h-8 w-8 sm:h-10 sm:w-10"
        >
          <Download className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>
      {resourceError && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-900/80 p-2 sm:p-3 text-center">
          <p className="text-red-200 text-xs sm:text-sm">{resourceError}</p>
        </div>
      )}
    </>
  )
}
