"use client"

import Split from "react-split"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { FileText, Edit, Lightbulb, CheckCircle } from "lucide-react"
import "./styles.css"

export default function ProblemDetail() {
  const [horizontalSizes, setHorizontalSizes] = useState([50, 50])
  const [verticalSizes, setVerticalSizes] = useState([50, 50])
  const [activeTab, setActiveTab] = useState("description")

  const isCompactLeft = horizontalSizes[0] <= 6
  const isCompactRight = horizontalSizes[1] <= 6

  const tabs = [
    { id: "description", label: "Description", icon: FileText },
    { id: "editorial", label: "Editorial", icon: Edit },
    { id: "solutions", label: "Solutions", icon: Lightbulb },
    { id: "submissions", label: "Submissions", icon: CheckCircle }
  ]


  return (
    <>
      <div className="bg-bg-primary px-1">
        <Split sizes={horizontalSizes}
          minSize={60.5}
          gutterSize={4}
          className="split h-screen bg-bg-primary"
          direction="horizontal"
          onDragEnd={(sizes) => setHorizontalSizes(sizes)}
          onDrag={(sizes) => setHorizontalSizes(sizes)}
        >
          {/* Left Panel */}
          <div className="h-full overflow-auto bg-background rounded-md">
            <div className={cn("h-full transition-all duration-200", isCompactLeft ? "w-[60px]" : "")}>
              {/* after:content-[''] after:absolute after:inset-y-0 after:right-0 after:w-4 after:bg-gradient-to-r after:from-transparent after:to-white/80 after:dark:to-black/50 after:pointer-events-none */}
              <div className={cn("bg-bg-card flex relative", isCompactLeft ? "flex-col h-full" : "flex-row border-b")} >
                {tabs.map((tab) => (
                  <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={cn("flex items-center gap-2 p-4 hover:bg-primary hover:text-black transition-colors",
                      activeTab === tab.id && "bg-primary", isCompactLeft ? "flex-col w-full py-4" : "flex-row justify-start h-[60px]")}
                  >
                    <tab.icon className={cn("w-5 h-5", activeTab === tab.id ? "text-black" : "text-muted-foreground")} />
                    <span className={cn("text-sm transition-all duration-200", activeTab === tab.id ? "text-black font-bold" : "text-muted-foreground", isCompactLeft ? "writing-mode-vertical text-xs" : "")} >
                      {tab.label}
                    </span>
                  </button>))}
              </div>

              <div className={cn("p-4 min-w-96", isCompactLeft ? "hidden" : "block")}>
                {activeTab === "description" && (
                  <div className="prose dark:prose-invert">
                    <h2 className="text-xl font-bold mb-4">Problem Description</h2>
                    <p>
                      Given an array of integers nums and an integer target, return indices of the two numbers such that
                      they add up to target.
                    </p>
                  </div>
                )}
                {activeTab === "editorial" && <div>Editorial content</div>}
                {activeTab === "solutions" && <div>Solutions content</div>}
                {activeTab === "submissions" && <div>Submissions content</div>}
              </div>
            </div>
          </div>

          {/* Right Split Panels */}
          <Split
            sizes={verticalSizes}
            minSize={60}
            gutterSize={4}
            direction="vertical"
            className="split-vertical"
            onDragEnd={(sizes) => setVerticalSizes(sizes)}
          >
            {/* Right Top Panel */}
            <div className="overflow-auto bg-background border-b rounded-md">
              <div className="p-4">
                <h2 className={cn("text-xl font-bold mb-4", isCompactRight ? "writing-mode-vertical" : "")}>Code Editor</h2>
                <div className={cn("font-mono bg-muted p-4 rounded-lg", isCompactRight ? "hidden" : "block")}>
                  <pre className="text-sm">
                    {`function solution(nums, target) {

// Your code here for (let i = 0; i < nums.length; i++) { for (let j = i + 1; j < nums.length; j++) { if (nums[i] + nums[j] === target) { return [i, j]; } } } return []; }`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Right Bottom Panel */}
            <div className="overflow-auto bg-background rounded-md">
              <div className="p-4">
                <h2 className={cn("text-xl font-bold mb-4", isCompactRight ? "writing-mode-vertical" : "")}>Test Cases</h2>
                <div className={cn("space-y-4", isCompactRight ? "hidden" : "block")}>
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="font-mono text-sm">
                      Input: nums = [2,7,11,15], target = 9{"\n"}
                      Output: [0,1]
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Split>
        </Split>
      </div>
    </>

  )
}