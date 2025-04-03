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
      java: "editor.worker.js"
    }
    return `/monaco-editor-worker/${workerMap[label] || "editor.worker.js"}`
  }
}

export default function CodeEditor({ initialCode, staticCode = "", onChange, className = "", language = "java" }) {
  const editorRef = useRef(null)
  const staticEditorRef = useRef(null)
  const containerRef = useRef(null)
  const [editor, setEditor] = useState(null)
  const [staticEditor, setStaticEditor] = useState(null)
  const [breakpoints, setBreakpoints] = useState(new Map()) // Track breakpoints
  const previousInitialCodeRef = useRef("")
  const previousStaticCodeRef = useRef("")
  const resizeObserverRef = useRef(null)
  const [staticEditorHeight, setStaticEditorHeight] = useState(0) // Track static editor height

  // Create or update static editor
  const setupStaticEditor = (code) => {
    if (!staticEditorRef.current) return null

    // If editor already exists, update its content
    if (staticEditor) {
      try {
        const model = staticEditor.getModel()
        if (model) {
          model.setValue(code)
        }
        return staticEditor
      } catch (error) {
        console.error("Error updating static editor:", error)
      }
    }

    // Create new editor
    try {
      const staticEditorInstance = monaco.editor.create(staticEditorRef.current, {
        ...editorConfig,
        value: code,
        readOnly: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        renderLineHighlight: "none",
        hideCursorInOverviewRuler: true,
        overviewRulerBorder: false,
        overviewRulerLanes: 0,
        lineNumbers: "off",
        scrollbar: {
          vertical: "hidden",
          horizontal: "hidden"
        },
        glyphMargin: false,
        folding: false,
        lineDecorationsWidth: 0,
        lineNumbersMinChars: 0,
        language: language.toLowerCase(),
        wordWrap: "on" // Enable word wrap for better display
      })

      return staticEditorInstance
    } catch (error) {
      console.error("Error creating static editor:", error)
      return null
    }
  }

  // Adjust editor heights based on content
  const adjustEditorHeights = () => {
    if (!staticEditor || !staticCode) return

    try {
      // Get the content height directly from the editor
      const contentHeight = staticEditor.getContentHeight()

      // Update state with the new height
      setStaticEditorHeight(contentHeight)

      // Set the height of the container
      if (staticEditorRef.current) {
        staticEditorRef.current.style.height = `${contentHeight}px`

        // Force layout update
        staticEditor.layout()

        // Also update the main editor layout to ensure proper coordination
        if (editor) {
          editor.layout()
        }
      }
    } catch (error) {
      console.error("Error adjusting editor heights:", error)
    }
  }

  // Initialize editors
  useEffect(() => {
    // Initialize main editor
    if (editorRef.current && !editor) {
      monaco.languages.register({ id: "java" })

      previousInitialCodeRef.current = initialCode || INITIAL_CODE_DEFAULT

      const editorInstance = monaco.editor.create(editorRef.current, {
        ...editorConfig,
        value: initialCode || INITIAL_CODE_DEFAULT,
        glyphMargin: true,
        scrollBeyondLastLine: true,
        language: language.toLowerCase(),
        scrollbar: {
          // Configure scrollbars to work with container
          vertical: "auto",
          horizontal: "auto"
        }
      })

      if (!isCompletionProviderRegistered) {
        JavaCompletionProvider(monaco)
        isCompletionProviderRegistered = true
      }
      JavaDiagnosticsProvider(monaco)
      JavaFormatter(monaco)

      editorInstance.onDidChangeModelContent((e) => {
        // Report all changes to the entire editor content
        if (onChange) {
          const fullCode = editorInstance.getValue()
          onChange(fullCode)
        }
      })

      editorInstance.onMouseDown((e) => {
        if (e.target.type === monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN) {
          const lineNumber = e.target.position.lineNumber
          toggleBreakpoint(editorInstance, lineNumber)
        }
      })

      setEditor(editorInstance)
    }

    // Initialize static editor if there's static code
    if (staticEditorRef.current && staticCode && !staticEditor) {
      const newStaticEditor = setupStaticEditor(staticCode)
      if (newStaticEditor) {
        setStaticEditor(newStaticEditor)
        previousStaticCodeRef.current = staticCode

        // Initial height adjustment after a short delay
        setTimeout(() => {
          adjustEditorHeights()
        }, 50)
      }
    }

    return () => {
      if (editor) {
        editor.getModel()?.dispose()
        editor.dispose()
      }

      if (staticEditor) {
        staticEditor.getModel()?.dispose()
        staticEditor.dispose()
      }

      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Set up ResizeObserver for container
  useEffect(() => {
    if (containerRef.current && !resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        if (editor) editor.layout()
        if (staticEditor) {
          staticEditor.layout()
          adjustEditorHeights()
        }
      })

      resizeObserverRef.current.observe(containerRef.current)
    }

    return () => {
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect()
        resizeObserverRef.current = null
      }
    }
  }, [editor, staticEditor])

  // Handle changes to initialCode
  useEffect(() => {
    if (!editor || initialCode === previousInitialCodeRef.current) return

    try {
      const model = editor.getModel()
      if (!model) return

      // Store cursor position and selections before update
      const currentPosition = editor.getPosition()
      const currentSelections = editor.getSelections()

      // Update content
      editor.executeEdits("update-content", [
        {
          range: model.getFullModelRange(),
          text: initialCode || INITIAL_CODE_DEFAULT,
          forceMoveMarkers: true
        }
      ])

      // Restore cursor position and selections if possible
      if (currentPosition) {
        editor.setPosition(currentPosition)
      }

      if (currentSelections) {
        editor.setSelections(currentSelections)
      }

      previousInitialCodeRef.current = initialCode || INITIAL_CODE_DEFAULT

      // Adjust static editor height after initialCode changes
      // This is important as the container might resize
      if (staticEditor) {
        setTimeout(adjustEditorHeights, 0)
      }
    } catch (error) {
      console.error("Error updating initialCode:", error)
    }
  }, [initialCode, editor])

  // Handle changes to staticCode
  useEffect(() => {
    if (staticCode === previousStaticCodeRef.current) return

    try {
      // If we have a static editor, update it
      if (staticEditor) {
        const model = staticEditor.getModel()
        if (model) {
          model.setValue(staticCode)
        }
      }
      // Otherwise create a new one if we have static code
      else if (staticCode && staticEditorRef.current) {
        const newStaticEditor = setupStaticEditor(staticCode)
        if (newStaticEditor) {
          setStaticEditor(newStaticEditor)
        }
      }

      previousStaticCodeRef.current = staticCode

      // Adjust height after content update
      // Use setTimeout to ensure the editor has processed the content change
      setTimeout(adjustEditorHeights, 0)
    } catch (error) {
      console.error("Error updating staticCode:", error)
    }
  }, [staticCode, staticEditor])

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

    if (staticEditor) {
      try {
        const model = staticEditor.getModel()
        if (model) {
          monaco.editor.setModelLanguage(model, language.toLowerCase())
        }
      } catch (error) {
        console.error("Error updating static editor language:", error)
      }
    }
  }, [language, editor, staticEditor])

  // Adjust heights whenever static editor or code changes
  useEffect(() => {
    if (staticEditor && staticCode) {
      // Initial adjustment
      adjustEditorHeights()

      // Also set up a listener for content height changes
      const contentChangeDisposable = staticEditor.onDidContentSizeChange(() => {
        adjustEditorHeights()
      })

      return () => {
        contentChangeDisposable.dispose()
      }
    }
  }, [staticEditor, staticCode])

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
                glyphMarginClassName: "breakpoint-icon"
              }
            }
          ]
        )
        updatedBreakpoints.set(lineNumber, newDecorations[0])
      }

      return new Map(updatedBreakpoints)
    })
  }

  return (
    <div ref={containerRef} className={`code-editor-container w-full ${className} no-scrollbar`}>
      {/* Wrapper div to control the layout */}
      <div className="editors-wrapper">
        {/* Static code editor (read-only with syntax highlighting) */}
        {staticCode && <div ref={staticEditorRef} className="static-code-editor" />}

        {/* Divider between editors */}
        {staticCode && <div className="static-code-divider" />}

        {/* Main editor for editable code */}
        <div ref={editorRef} className="main-code-editor" />
      </div>

      <style>
        {`
          .code-editor-container {
            display: flex;
            flex-direction: column;
            border: 1px solid #e0e0e0;
            overflow: auto;
            height: 100%;
          }
          
          .editors-wrapper {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
          }
          
          .static-code-editor {
            background-color: rgba(0, 0, 0, 0.03);
            margin-left: 43px;
            min-height: 20px;
            flex-shrink: 0; /* Prevent shrinking */
          }
          
          .static-code-divider {
            height: 1px;
            background-color: #e0e0e0;
            width: 100%;
            flex-shrink: 0; /* Prevent shrinking */
          }
          
          .main-code-editor {
            width: 100%;
            flex: 1 1 0%;
            min-height: 100px; /* Ensure minimum height */
          }
          
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

