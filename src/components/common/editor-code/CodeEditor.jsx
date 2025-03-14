"use client"

import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import { INITIAL_CODE_DEFAULT } from "./constants"
import { editorConfig } from "./editor-config"
import { JavaCompletionProvider } from "./completion-provider"
import { JavaDiagnosticsProvider } from "./diagnostics-provider"
import { JavaFormatter } from "./format-config"

let isCompletionProviderRegistered = false

self.MonacoEnvironment = {
  getWorkerUrl: function (moduleId, label) {
    const workerMap = {
      json: "json.worker.js",
      css: "css.worker.js",
      html: "html.worker.js",
      typescript: "ts.worker.js",
      javascript: "ts.worker.js",
      java: "editor.worker.js"
    }
    return `/monaco-editor-worker/${workerMap[label] || "editor.worker.js"}`
  }
}


export default function CodeEditor({ initialCode, onChange, className = "", language = "java" }) {
  const editorRef = useRef(null)
  const [editor, setEditor] = useState(null)
  const [breakpoints, setBreakpoints] = useState(new Map()) // Track breakpoints

  useEffect(() => {
    if (editorRef.current && !editor) {
      monaco.languages.register({ id: "java" })

      const editorInstance = monaco.editor.create(editorRef.current, {
        ...editorConfig,
        value: initialCode || INITIAL_CODE_DEFAULT,
        glyphMargin: true
      })

      if (!isCompletionProviderRegistered) {
        JavaCompletionProvider(monaco)
        isCompletionProviderRegistered = true
      }
      JavaDiagnosticsProvider(monaco)
      JavaFormatter(monaco)

      editorInstance.onDidChangeModelContent(() => {
        const updatedCode = editorInstance.getValue()
        if (onChange) {
          onChange(updatedCode)
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

  useEffect(() => {
    if (editor) {
      try {
        // Safely update the editor value
        const currentValue = editor.getValue()
        if (initialCode !== currentValue) {
          // Use the editor's edit operation to set the value
          editor.executeEdits("reset-content", [
            {
              range: editor.getModel().getFullModelRange(),
              text: initialCode || INITIAL_CODE_DEFAULT,
              forceMoveMarkers: true
            }
          ])

          // Alternative approach if the above doesn't work
          // editor.setValue(initialCode || INITIAL_CODE_DEFAULT);
        }
      } catch (error) {
        console.error("Error updating editor content:", error)
      }
    }
  }, [initialCode, editor])

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
        const newDecorations = editor.deltaDecorations([], [
          {
            range: new monaco.Range(lineNumber, 1, lineNumber, 1),
            options: {
              glyphMarginClassName: "breakpoint-icon"
            }
          }
        ])
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
        `}
      </style>
    </div>
  )
}


