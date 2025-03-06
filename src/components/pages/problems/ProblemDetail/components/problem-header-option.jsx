"use client"

import { Button } from "@/components/ui/button"
import { ListChecksIcon, Bug, Play, Upload } from "lucide-react"
import { LOGO } from "@/lib/constants"
import UserActionMenu from "@/components/common/shared/other/user-action-menu"

/**
 * Header component for the problem detail page
 * @param {Object} props - Component props
 * @param {Function} props.onRun - Run code handler
 * @param {Function} props.onSubmit - Submit code handler
 */
export default function ProblemHeader({ onRun, onSubmit }) {
  return (
    <div className="relative h-12 w-full bg-bg-primary/50">
      <nav className="h-full w-full bg-bg-card flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <a href="/" className="flex items-center gap-2 font-medium text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <LOGO className="size-8" />
            </div>
          </a>
          <Button variant="ghost" className="w-fit p-2 px-3 bg-bg-primary/80 text-input-text">
            <ListChecksIcon className="w-6 h-6" />
            <span className="text-sm font-bold pl-2">Problem List</span>
          </Button>
        </div>
        <UserActionMenu />
      </nav>

      {/* Centered Button List */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-2">
        <Button
          variant="ghost"
          title="Debug"
          size="icon"
          className="h-8 w-8 bg-button-primary hover:bg-button-hover text-black transition"
        >
          <Bug className="h-4 w-4" />
        </Button>
        <Button
          onClick={onRun}
          variant="ghost"
          title="Run"
          className="h-8 bg-button-primary hover:bg-button-hover text-black transition"
        >
          <Play className="h-4 w-4" />
          Run
        </Button>
        <Button
          onClick={onSubmit}
          title="Submit"
          className="h-8 bg-button-primary hover:bg-button-hover text-black text-sm transition"
        >
          <Upload className="size-4" />
          Submit
        </Button>
      </div>
    </div>
  )
}

