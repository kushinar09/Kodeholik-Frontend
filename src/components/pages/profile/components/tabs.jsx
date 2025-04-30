"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export default function Tabs({ tabs, defaultTab = 0, className }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className={cn("w-full", className)}>
      <div className="ml-2 sm:ml-4 md:ml-6 overflow-x-auto pb-2">
        <div className="flex min-w-max">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-2 sm:px-4 py-1 sm:py-2 text-xs sm:text-sm font-medium mr-2 sm:mr-4",
                "focus:outline-none whitespace-nowrap",
                activeTab === index
                  ? "text-primary-text font-bold border-b-2 border-text-primary-text scale-105"
                  : "text-primary-text hover:scale-105",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-2 sm:mt-4">
        {tabs.map((tab, index) => (
          <div key={index} className={cn(activeTab === index ? "block" : "hidden")}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}
