"use client"

import { cn } from "@/lib/utils"
import { FileText, Edit, Lightbulb, CheckCircle } from "lucide-react"

/**
 * Navigation tabs for the left panel
 * @param {Object} props - Component props
 * @param {string} props.activeTab - Currently active tab
 * @param {Function} props.onTabChange - Tab change handler
 * @param {boolean} props.isCompact - Whether the panel is in compact mode
 */
export default function TabNavigation({ isCompact }) {
  const tabs = [
    { id: "description", label: "Description", icon: FileText, lock: false }
  ]

  return (
    <div
      className={cn(
        "p-1 h-[40px] w-full bg-bg-card flex relative overflow-auto no-scrollbar",
        isCompact ? "flex-col h-full space-y-4" : "flex-row space-x-4"
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={cn(
            "rounded p-2 flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors bg-primary text-black",
            isCompact ? "flex-col w-[32px]" : "flex-row justify-start h-[32px]"
          )}
        >
          <tab.icon
            className="w-5 h-5"
          />
          <span
            className={cn(
              "text-sm transition-all duration-200 subpixel-antialiased",
              isCompact ? "writing-mode-vertical" : ""
            )}
          >
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  )
}

