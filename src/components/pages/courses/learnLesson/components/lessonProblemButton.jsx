"use client"

import { Button } from "@/components/ui/button"

export default function LessonProblemButton({ problem }) {
  return (
    <Button
      variant="outline"
      className="w-full mt-2 bg-gray-800/50 hover:bg-gray-700 text-white border-gray-600 text-xs sm:text-sm py-1.5 sm:py-2 h-auto"
      onClick={() => {}}
    >
      {problem.title || `Problem ${problem.id}`}
    </Button>
  )
}
