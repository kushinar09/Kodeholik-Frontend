"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"

export default function Tabs({ tabs, defaultTab = 0, className }) {
  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className={cn("w-full", className)}>
      <div className="ml-6">
        <div className="flex">
          {tabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={cn(
                "px-4 py-2 text-sm font-medium mr-4",
                "focus:outline-none",
                activeTab === index ? "text-primary-text font-bold border-b-2 border-text-primary-text scale-110" : "text-primary-text hover:scale-110",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-4">
        {tabs.map((tab, index) => (
          <div key={index} className={cn(activeTab === index ? "block" : "hidden")}>
            {tab.content}
          </div>
        ))}
      </div>
    </div>
  )
}

