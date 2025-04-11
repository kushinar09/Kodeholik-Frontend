"use client"

import { marked } from "marked"
import { useMemo, useEffect, useRef } from "react"
import { ENDPOINTS } from "@/lib/constants"
import "./styles.css"

// Import ReactDOM for client-side rendering
import { createRoot } from "react-dom/client"
import { CodeHighlighter } from "../editor-code/code-highlighter"

const imageUrlCache = new Map()

export default function RenderMarkdown({ content, className = "" }) {
  const markdownContent = content || ""
  const containerRef = useRef(null)

  const renderMarkdown = (content) => {
    const customRenderer = new marked.Renderer()
    const lockedCodeRegex = /LOCKED-CODE\s*([\s\S]*?)\s*LOCKED-CODE/g

    content = content.replace(lockedCodeRegex, (match, codeContent) => {
      return `<div 
      class="locked-code code-highlighter-placeholder"
      data-code="${encodeURIComponent(codeContent.trim())}" 
        data-language="${"java"}"
      ></div>`
    })

    customRenderer.image = (href) => {
      const title = href.title || ""
      const text = href.text || ""

      if (href.href.startsWith("s3:")) {
        const key = href.href.substring(3)
        const placeholderSrc = "/placeholder.svg?height=200&width=300"

        // Generate a unique ID for this image
        const uniqueId = `img-${key.replace(/[^a-zA-Z0-9]/g, "")}`

        // Check if we already have the URL in cache
        if (!imageUrlCache.has(key)) {
          // If not in cache, set up lazy loading
          imageUrlCache.set(key, null) // Set a null placeholder

          // Use requestAnimationFrame to defer the fetch until after rendering
          requestAnimationFrame(() => {
            if (!document.getElementById(uniqueId)) return // If the image is no longer in the DOM, don't fetch

            fetch(ENDPOINTS.GET_IMAGE(key))
              .then((response) => response.text())
              .then((imageUrl) => {
                imageUrlCache.set(key, imageUrl)
                const imgElement = document.getElementById(uniqueId)
                if (imgElement) {
                  imgElement.src = imageUrl
                }
              })
              .catch((error) => {
                console.error("Error fetching image URL:", error)
                imageUrlCache.delete(key) // Remove from cache on error
              })
          })
        }

        const cachedUrl = imageUrlCache.get(key)
        const initialSrc = cachedUrl || placeholderSrc

        return `<img loading="lazy" 
          id="${uniqueId}"
          src="${initialSrc}" 
          alt="${text}" 
          title="${title || ""}" 
          data-s3-key="${key}"
          onerror="this.onerror=null; this.src='${placeholderSrc}'; this.alt='Image failed to load';"
        />`
      }

      return `<img loading="lazy" src="${href.href}" alt="${text}" title="${title || ""}" />`
    }

    // For code blocks, create a placeholder with data attributes
    customRenderer.code = (code) => {
      // Create a unique ID for this code block
      const id = `code-${Math.random().toString(36).substring(2, 11)}`

      // Return a placeholder div with data attributes
      return `<div 
        id="${id}" 
        class="code-highlighter-placeholder" 
        data-code="${encodeURIComponent(code.text)}" 
        data-language="${"java"}"
      ></div>`
    }

    marked.use({
      renderer: customRenderer
    })

    return marked(content)
  }

  // Memoize the rendered markdown
  const renderedMarkdown = useMemo(() => renderMarkdown(markdownContent), [markdownContent])

  // After the component renders, replace placeholders with React components
  useEffect(() => {
    if (!containerRef.current) return

    // Find all code block placeholders
    const placeholders = containerRef.current.querySelectorAll(".code-highlighter-placeholder")

    // Replace each placeholder with the CodeHighlighter component
    placeholders.forEach((placeholder) => {
      const code = decodeURIComponent(placeholder.getAttribute("data-code"))
      const language = placeholder.getAttribute("data-language")

      // Create a root for this placeholder
      const root = createRoot(placeholder)

      // Render the CodeHighlighter component
      root.render(<CodeHighlighter code={code} language={language} showLineNumbers={true} className="rounded-md my-2" />)
    })
  }, [renderedMarkdown])

  return (
    <div>
      <div
        ref={containerRef}
        className={`markdown prose prose-sm dark:prose-invert max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedMarkdown }}
      />
    </div>
  )
}

