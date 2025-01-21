"use client"

import React, { useState, useEffect, useRef } from "react"
import { EditorView, basicSetup } from "codemirror"
import { keymap } from "@codemirror/view"
import { indentWithTab } from "@codemirror/commands"
import { markdown } from "@codemirror/lang-markdown"
import { EditorState } from "@codemirror/state"
import { marked } from "marked"
import { Button } from "@/components/ui/button"
import {
  Bold,
  Italic,
  LinkIcon,
  Quote,
  ListOrdered,
  List,
  Minus,
  Heading,
  Image,
  Code2Icon,
  CodeSquare
} from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import "./styles.css"
import { Separator } from "@/components/ui/separator"
import { java } from "@codemirror/lang-java"

const MarkdownEditor = () => {
  marked.use({
    // ALLOWS LINE BREAKS WITH RETURN BUTTON
    breaks: true,
    useNewRenderer: true,
    renderer: {
      // INSERTS target="_blank" INTO HREF TAG
      link({ href, text, title }) {
        return `<a target="_blank" href="${href}"${title ? ` title="${title}"` : ""} rel="noopener noreferrer nofollow ugc">${text}</a>`
      }
    }
  })

  // INITIAL MARKDOWN CONTENT
  const [markdownContent, setMarkdownContent] = useState("## Description")
  const editorViewRef = useRef(null)

  // Define keyboard shortcuts
  const shortcuts = {
    b: { key: "B", action: "**", label: "Bold" },
    i: { key: "I", action: "*", label: "Italic" },
    k: { key: "K", action: "[]()", label: "Link" },
    "`": { key: "`", action: "`", label: "Inline Code" },
    h: { key: "H", action: "#", label: "Heading" },
    l: { key: "L", action: "-", label: "List" },
    o: { key: "O", action: "1.", label: "Ordered List" },
    q: { key: "Q", action: ">", label: "Quote" }
  }

  useEffect(() => {
    const state = EditorState.create({
      doc: markdownContent,
      linesNumber: false,
      extensions: [
        basicSetup,
        java(),
        keymap.of([indentWithTab]),
        markdown(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            setMarkdownContent(update.state.doc.toString())
          }
        }),
        EditorView.theme({
          "&": { height: "calc(100vh - 8rem)" },
          ".cm-content": { fontFamily: "monospace" },
          ".cm-cursor, .cm-dropCursor": {
            borderLeftColor: "#000000",
            borderLeftWidth: "2px",
            borderLeftStyle: "solid"
          },
          ".cm-gutters": { display: "none" }
        })
      ]
    })

    editorViewRef.current = new EditorView({
      state,
      parent: document.getElementById("editor")
    })

    // Add keyboard event listener
    const handleKeyDown = (e) => {
      // Check if Ctrl/Cmd key is pressed
      if ((e.ctrlKey || e.metaKey) && shortcuts[e.key.toLowerCase()]) {
        e.preventDefault()
        applyMarkdown(shortcuts[e.key.toLowerCase()].action)
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      if (editorViewRef.current) {
        editorViewRef.current.destroy()
      }
      document.removeEventListener("keydown", handleKeyDown)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const applyMarkdown = (syntax) => {
    if (!editorViewRef.current) return

    const view = editorViewRef.current
    const state = view.state
    const selection = state.selection.main

    const from = selection.from
    const to = selection.to
    let text = state.doc.sliceString(from, to)

    let newText = ""
    let linkRegex
    switch (syntax) {
    case "**":
      if (from === to) {
        text = "Bold"
      }
      if (text.startsWith("**") && text.endsWith("**")) {
        newText = text.slice(2, -2)
      } else if (/^#+\s/.test(text)) {
        let pre
        let heading = text.replace(/^#+\s/, (match) => {
          pre = match
          return ""
        })
        if (heading.startsWith("**") && heading.endsWith("**")) {
          heading = heading.slice(2, -2)
          newText = pre + heading
        } else {
          newText = pre + `**${heading}**`
        }
      } else {
        newText = `**${text}**`
      }
      break
    case "#":
      if (from === to) {
        text = "Heading"
      }
      if (text.startsWith("#")) {
        newText = `#${text}`
      } else {
        newText = `# ${text}`
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
      }
      break
    case "*":
      if (from === to) {
        text = "Italic"
      }
      if (text.startsWith("*") && text.endsWith("*")) {
        newText = text.slice(1, -1)
      } else {
        newText = `*${text}*`
      }
      break
    case "`":
      if (from === to) {
        text = "code"
      }
      if (text.startsWith("`") && text.endsWith("`")) {
        newText = text.slice(1, -1)
      } else {
        newText = `\`${text}\``
      }
      break
    case "```":
      if (from === to) {
        text = "public static void main(String[] args) {\n  System.out.println(\"Hello, World!\");\n}"
      }
      if (text.startsWith("```\n") && text.endsWith("\n```")) {
        newText = text.slice(4, -4)
      } else {
        newText = `\`\`\`\n${text}\n\`\`\``
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
        newText = newText + "\n"
      }
      break
    case "[]()":
      if (from === to) {
        text = "link"
      }
      linkRegex = /^\[(.+)\]$$(.+)$$$/
      if (linkRegex.test(text)) {
        newText = text.match(linkRegex)[1]
      } else {
        newText = `[${text}](url)`
      }
      break
    case ">":
      if (from === to) {
        text = "Quote"
      }
      if (text.startsWith("> ")) {
        newText = text.slice(2)
      } else {
        newText = `> ${text}`
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
      }
      break
    case "1.":
      if (text.startsWith("1. ")) {
        newText = text.slice(3)
      } else {
        newText = `1. ${text}`
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
      }
      break
    case "-":
      if (text.startsWith("- ")) {
        newText = text.slice(2)
      } else {
        newText = `- ${text}`
        if (from > 0 && state.doc.sliceString(from - 1, from) !== "\n") {
          newText = "\n" + newText
        }
      }
      break
    case "---":
      newText = "\n---\n"
      break
    default:
      newText = text
    }

    const transaction = state.update({
      changes: {
        from,
        to,
        insert: newText
      },
      selection:
        selection.from === selection.to
          ? { anchor: from + newText.length }
          : { anchor: from, head: from + newText.length }
    })

    view.dispatch(transaction)
    view.focus()
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Toolbar */}
      <div className="border-b bg-muted/40">
        <TooltipProvider>
          <div className="flex flex-wrap items-center gap-2 my-4 ms-4">
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("#")}>
                    <Heading className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Heading: Ctrl + H</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("**")}>
                    <Bold className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Bold: Ctrl + B</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("*")}>
                    <Italic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Italic: Ctrl + I</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("`")}>
                    <CodeSquare className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Inline Code: Ctrl + `</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("```")}>
                    <Code2Icon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Code Block</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("1.")}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ordered List: Ctrl + O</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("-")}>
                    <List className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Unordered List: Ctrl + L</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("---")}>
                    <Minus className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Divider</TooltipContent>
              </Tooltip>
            </div>

            <Separator orientation="vertical" className="h-6" />

            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("[]()")}>
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Link: Ctrl + K</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown("---")}>
                    <Image className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Image</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => applyMarkdown(">")}>
                    <Quote className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Quote: Ctrl + Q</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>

      {/* Editor and Preview */}
      <div className="flex-1 grid grid-cols-2 divide-x">
        <div id="editor" className="min-h-0 overflow-auto focus-within:ring-1 focus-within:ring-ring" />
        <div className="min-h-0 overflow-auto">
          <div
            className="markdown prose prose-sm dark:prose-invert max-w-none p-4"
            dangerouslySetInnerHTML={{ __html: marked(markdownContent) }}
          />
        </div>
      </div>
    </div>
  )
}

export default MarkdownEditor

