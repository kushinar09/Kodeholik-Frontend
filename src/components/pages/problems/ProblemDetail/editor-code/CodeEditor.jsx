"use client"

import { useEffect, useRef, useState } from "react"
import * as monaco from "monaco-editor"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { JavaCompletionProvider } from "./completion-provider"
import { JavaDiagnosticsProvider } from "./diagnostics-provider"
import { JavaFormatter } from "./format-config"
import { INITIAL_CODE } from "./constants"
import { editorConfig } from "./editor-config"

let isCompletionProviderRegistered = false

export default function CodeEditor() {
  const editorRef = useRef(null)
  const [editor, setEditor] = useState(null)

  useEffect(() => {
    if (editorRef.current && !editor) {
      // console.log(JSON.stringify(INITIAL_CODE))
      // JSON.stringify to convert to type /n /t
      // Configure Monaco editor
      monaco.languages.register({ id: "java" })

      // Initialize the editor with configuration
      const editor = monaco.editor.create(editorRef.current, {
        ...editorConfig,
        value: INITIAL_CODE
      })

      // Register completion and diagnostics providers
      if (!isCompletionProviderRegistered) {
        JavaCompletionProvider(monaco)
        isCompletionProviderRegistered = true
      }
      JavaDiagnosticsProvider(monaco)
      JavaFormatter(monaco)

      setEditor(editor)

      return () => {
        editor.dispose()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleReset = () => {
    if (editor) {
      editor.setValue(INITIAL_CODE)
    }
  }

  return (
    <div className="w-full h-full">
      <div ref={editorRef} className="w-full h-full"/>
      {/* <CardHeader>
        <CardTitle>Java Code Editor</CardTitle>
      </CardHeader>
      <CardContent>
      </CardContent>
      <CardFooter className="flex justify-end space-x-2">
        <Button onClick={handleReset} variant="outline">
          Reset Code
        </Button>
      </CardFooter> */}
    </div>
  )
}

