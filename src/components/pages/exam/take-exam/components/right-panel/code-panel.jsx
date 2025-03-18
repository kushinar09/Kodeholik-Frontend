"use client"

import { cn } from "@/lib/utils"
import CodeEditor from "@/components/common/editor-code/CodeEditor"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

export default function CodePanel({
  isCompact,
  code,
  onCodeChange,
  language,
  onLanguageChange,
  availableLanguages
}) {

  const [selectedLanguage, setSelectedLanguage] = useState(language)

  const handleLanguageChange = (value) => {
    setSelectedLanguage(value)
    if (onLanguageChange) {
      onLanguageChange(value)
    }
  }

  return (
    <div className="h-full bg-background flex flex-col">
      <div
        className={cn(
          "bg-bg-card flex items-center p-1 relative overflow-auto no-scrollbar",
          isCompact ? "flex-col h-full space-y-4" : "flex-row space-x-4 h-[40px]"
        )}
      >
        <div
          className={cn(
            "rounded p-2 flex items-center gap-2 cursor-pointer transition-colors duration-200 bg-primary text-black",
            isCompact ? "flex-col w-full" : "flex-row justify-start h-[32px]"
          )}
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>

          <span
            className={cn(
              "text-sm transition-all duration-200 subpixel-antialiased",
              isCompact ? "writing-mode-vertical" : ""
            )}
          >
            Code
          </span>
        </div>
      </div>
      <div className={cn("overflow-auto flex-1", isCompact ? "justify-center hidden" : "")}>
        <div className="min-w-[420px] h-full">
          {code && (
            <>
              <div className={cn("m-1", isCompact ? "w-full mt-4" : "flex-shrink-0")}>
                <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger
                    className={cn("h-8 w-full border-bg-card focus:ring-none", isCompact ? "w-full" : "w-[100px]")}
                  >
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLanguages.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <CodeEditor initialCode={code} onChange={onCodeChange} language={selectedLanguage} />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
