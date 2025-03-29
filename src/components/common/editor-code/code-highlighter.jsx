"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

// Import core and base languages first
import "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"

// Then import specific languages that depend on clike
import "prismjs/components/prism-java"
import "prismjs/components/prism-c"

// Import styles
import "./css/prism-darcula.css"
// import "./css/prism-atom-dark.css"

import "prismjs/plugins/line-numbers/prism-line-numbers.css"
import "prismjs/plugins/line-numbers/prism-line-numbers"

export function CodeHighlighter({ code, language = "javascript", showLineNumbers = true, className = "" }) {
  const [highlightedCode, setHighlightedCode] = useState("")

  useEffect(() => {
    // Dynamically import Prism to avoid SSR issues
    import("prismjs").then((Prism) => {
      // Import the core
      import("prismjs/components/prism-core")

      // Import additional plugins if needed
      if (showLineNumbers) {
        import("prismjs/plugins/line-numbers/prism-line-numbers")
      }

      // Highlight the code
      const highlighted = Prism.default.highlight(
        code,
        Prism.default.languages[language.toLowerCase()] || Prism.default.languages.javascript,
        language.toLowerCase()
      )
      setHighlightedCode(highlighted)
    })
  }, [code, language, showLineNumbers])


  return (
    <div className={cn("relative bg-bg-card overflow-hidden", className)}>
      <pre className={cn("!m-0 !rounded-none p-4 overflow-x-auto text-sm", showLineNumbers && "line-numbers")}>
        <code className={`language-${language.toLowerCase()} font-code`} dangerouslySetInnerHTML={{ __html: highlightedCode }} />
      </pre>
    </div>
  )
}
