"use client"

import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import { editorConfig } from "./js/java/editor-config"
import { INITIAL_CODE_DEFAULT } from "./js/java/constants"
import { JavaCompletionProvider } from "./js/java/completion-provider"
import { JavaDiagnosticsProvider } from "./js/java/diagnostics-provider"
import { JavaFormatter } from "./js/java/format-config"

let isCompletionProviderRegistered = false

self.MonacoEnvironment = {
  getWorkerUrl: (moduleId, label) => {
    const workerMap = {
      json: "json.worker.js",
      css: "css.worker.js",
      html: "html.worker.js",
      typescript: "ts.worker.js",
      javascript: "ts.worker.js",
      java: "editor.worker.js",
    }
    return `/monaco-editor-worker/${workerMap[label] || "editor.worker.js"}`
  },
}

export default function CodeEditor({ initialCode, staticCode = "", onChange, className = "", language = "java" }) {
  const editorRef = useRef(null)
  const [editor, setEditor] = useState(null)
  const [breakpoints, setBreakpoints] = useState(new Map()) // Track breakpoints
  const staticDecorationsRef = useRef([])
  const staticCodeLengthRef = useRef(0)
  const isUpdatingRef = useRef(false)
  const previousStaticCodeRef = useRef("")
  const previousInitialCodeRef = useRef("")

  // Process static code to ensure it ends with a newline if needed
  const processStaticCode = (code) => {
    return code ? (code.endsWith("\n") ? code : code + "\n") : ""
  }

  // Combine static code with editable code
  const getFullCode = (staticCode, editableCode) => {
    const processedStatic = processStaticCode(staticCode)
    return processedStatic + (editableCode || "")
  }

  // Extract editable part from full code
  const getEditableCode = (fullCode, staticCode) => {
    const processedStatic = processStaticCode(staticCode)
    if (!processedStatic) return fullCode
    return fullCode.substring(processedStatic.length)
  }

  // Apply read-only decoration to static code
  const applyStaticCodeDecoration = (editorInstance, staticCode) => {
    if (!editorInstance) return

    const processedStatic = processStaticCode(staticCode)
    staticCodeLengthRef.current = processedStatic.length

    if (!processedStatic) {
      // Clear decorations if no static code
      if (staticDecorationsRef.current.length) {
        editorInstance.deltaDecorations(staticDecorationsRef.current, [])
        staticDecorationsRef.current = []
      }
      return
    }

    const model = editorInstance.getModel()
    if (!model) return

    const staticCodeEndPos = model.getPositionAt(processedStatic.length)

    // Clear previous decorations
    if (staticDecorationsRef.current.length) {
      editorInstance.deltaDecorations(staticDecorationsRef.current, [])
    }

    // Apply new decoration - allow selection but prevent editing
    staticDecorationsRef.current = editorInstance.deltaDecorations(
      [],
      [
        {
          range: new monaco.Range(1, 1, staticCodeEndPos.lineNumber, staticCodeEndPos.column),
          options: {
            inlineClassName: "static-code",
            isWholeLine: false,
            stickiness: monaco.editor.TrackedRangeStickiness.GrowsOnlyWhenTypingBefore,
          },
        },
      ],
    )
  }

  // Safely update editor content
  const safelyUpdateEditorContent = (editorInstance, newFullCode) => {
    if (!editorInstance || isUpdatingRef.current) return

    try {
      isUpdatingRef.current = true

      const currentPosition = editorInstance.getPosition()
      const currentSelections = editorInstance.getSelections()

      editorInstance.executeEdits("update-content", [
        {
          range: editorInstance.getModel().getFullModelRange(),
          text: newFullCode,
          forceMoveMarkers: true,
        },
      ])

      // Restore cursor position and selections if possible
      if (currentPosition) {
        editorInstance.setPosition(currentPosition)
      }

      if (currentSelections) {
        editorInstance.setSelections(currentSelections)
      }
    } catch (error) {
      console.error("Error updating editor content:", error)
    } finally {
      isUpdatingRef.current = false
    }
  }

  // Initialize editor
  useEffect(() => {
    if (editorRef.current && !editor) {
      monaco.languages.register({ id: "java" })

      const processedStatic = processStaticCode(staticCode)
      previousStaticCodeRef.current = staticCode
      previousInitialCodeRef.current = initialCode || INITIAL_CODE_DEFAULT

      const fullInitialCode = getFullCode(staticCode, initialCode || INITIAL_CODE_DEFAULT)

      const editorInstance = monaco.editor.create(editorRef.current, {
        ...editorConfig,
        value: fullInitialCode,
        glyphMargin: true,
        scrollBeyondLastLine: true, // Enable proper scrolling
      })

      if (!isCompletionProviderRegistered) {
        JavaCompletionProvider(monaco)
        isCompletionProviderRegistered = true
      }
      JavaDiagnosticsProvider(monaco)
      JavaFormatter(monaco)

      // Apply read-only decoration to static code if it exists
      applyStaticCodeDecoration(editorInstance, staticCode)

      // Handle key events to prevent backspace at boundary
      editorInstance.onKeyDown((e) => {
        const position = editorInstance.getPosition()
        const model = editorInstance.getModel()

        if (!model || !position) return

        const offset = model.getOffsetAt(position)

        // If at boundary and backspace is pressed, prevent default
        if (offset === staticCodeLengthRef.current && e.keyCode === monaco.KeyCode.Backspace) {
          e.preventDefault()
          e.stopPropagation()
          return false
        }
      })

      editorInstance.onDidChangeModelContent((e) => {
        if (isUpdatingRef.current) return

        const model = editorInstance.getModel()
        if (!model) return

        const fullCode = editorInstance.getValue()
        const processedStatic = processStaticCode(staticCode)

        // Check if static code was modified
        if (fullCode.substring(0, processedStatic.length) !== processedStatic) {
          // Restore the full code with static part intact
          const editableCode = getEditableCode(fullCode, staticCode)
          const correctedCode = getFullCode(staticCode, editableCode)

          safelyUpdateEditorContent(editorInstance, correctedCode)
          applyStaticCodeDecoration(editorInstance, staticCode)
          return
        }

        // Only report changes to the editable portion
        if (onChange) {
          const editableCode = getEditableCode(fullCode, staticCode)
          onChange(editableCode)
        }
      })

      editorInstance.onMouseDown((e) => {
        if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
          const lineNumber = e.target.position.lineNumber
          toggleBreakpoint(editorInstance, lineNumber)
        }
      })

      setEditor(editorInstance)

      return () => {
        editorInstance.getModel()?.dispose()
        editorInstance.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Handle changes to initialCode
  useEffect(() => {
    if (!editor || initialCode === previousInitialCodeRef.current) return

    try {
      const processedStatic = processStaticCode(staticCode)
      const newFullCode = getFullCode(staticCode, initialCode || INITIAL_CODE_DEFAULT)

      safelyUpdateEditorContent(editor, newFullCode)
      previousInitialCodeRef.current = initialCode || INITIAL_CODE_DEFAULT
    } catch (error) {
      console.error("Error updating initialCode:", error)
    }
  }, [initialCode, editor, staticCode])

  // Handle changes to staticCode
  useEffect(() => {
    if (!editor || staticCode === previousStaticCodeRef.current) return

    try {
      // Get current editable content
      const currentFullCode = editor.getValue()
      const currentEditableCode = getEditableCode(currentFullCode, previousStaticCodeRef.current)

      // Create new full code with updated static code
      const newFullCode = getFullCode(staticCode, currentEditableCode)

      safelyUpdateEditorContent(editor, newFullCode)
      applyStaticCodeDecoration(editor, staticCode)

      previousStaticCodeRef.current = staticCode
    } catch (error) {
      console.error("Error updating staticCode:", error)
    }
  }, [staticCode, editor])

  // Handle language changes
  useEffect(() => {
    if (editor) {
      try {
        const model = editor.getModel()
        if (model) {
          monaco.editor.setModelLanguage(model, language.toLowerCase())
        }
      } catch (error) {
        console.error("Error updating editor language:", error)
      }
    }
  }, [language, editor])

  const toggleBreakpoint = (editor, lineNumber) => {
    setBreakpoints((prev) => {
      const updatedBreakpoints = new Map(prev)

      if (updatedBreakpoints.has(lineNumber)) {
        const decorationId = updatedBreakpoints.get(lineNumber)
        editor.deltaDecorations([decorationId], [])
        updatedBreakpoints.delete(lineNumber)
      } else {
        const newDecorations = editor.deltaDecorations(
          [],
          [
            {
              range: new monaco.Range(lineNumber, 1, lineNumber, 1),
              options: {
                glyphMarginClassName: "breakpoint-icon",
              },
            },
          ],
        )
        updatedBreakpoints.set(lineNumber, newDecorations[0])
      }

      return new Map(updatedBreakpoints)
    })
  }

  return (
    <div className={`w-full h-full ${className}`}>
      <div ref={editorRef} className="w-full h-full min-h-[200px]" />
      <style>
        {`
          .breakpoint-icon::after {
            border-radius: 100%;
            content: "";
            cursor: pointer;
            display: block;
            margin-left: 4px;
            height: 10px;
            width: 10px;
            background-color: rgb(226, 74, 66);
          }
          
          .static-code {
            background-color: rgba(0, 0, 0, 0.05);
            opacity: 0.8;
          }
          
          /* Ensure editor container allows scrolling */
          .monaco-editor {
            overflow: auto !important;
          }
        `}
      </style>
    </div>
  )
}

