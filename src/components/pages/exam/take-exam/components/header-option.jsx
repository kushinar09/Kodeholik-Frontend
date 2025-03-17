"use client"

import { Button } from "@/components/ui/button"
import { ListChecksIcon, Play, Clock } from "lucide-react"
import { LOGO } from "@/lib/constants"
import UserActionMenu from "@/components/common/shared/other/user-action-menu"
import CountdownTimer from "@/components/common/shared/other/countdown-timer"

export default function HeaderOption({ onRun, handleBack }) {
  return (
    <div className="relative h-12 w-full bg-bg-primary/50">
      <nav className="h-full w-full bg-bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 font-medium text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <LOGO className="size-8" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handleBack} variant="ghost" className="w-fit p-2 px-3 bg-bg-primary/80 text-input-text">
              <ListChecksIcon className="w-6 h-6" />
              <span className="text-sm font-bold pl-2">Back to Question list</span>
            </Button>
            <div className="flex items-center gap-2 bg-bg-primary/80 p-2 px-4 rounded-md text-input-text">
              <Clock className="w-4 h-4 text-primary" />
              <CountdownTimer initialMinutes={30} />
            </div>
          </div>
        </div>
      </nav>

      {/* Centered Button List */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button
          onClick={onRun}
          variant="ghost"
          title="Run"
          className="h-8 bg-button-primary hover:bg-button-hover text-black transition"
        >
          <Play className="h-4 w-4" />
          Run
        </Button>
      </div>
    </div>
  )
}

