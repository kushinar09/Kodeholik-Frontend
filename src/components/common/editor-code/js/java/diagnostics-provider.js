export function JavaDiagnosticsProvider(monaco) {
  // Register a model change listener for Java language
  monaco.editor.onDidCreateModel((model) => {
    if (model.getLanguageId() === "java") {
      const checkDiagnostics = () => {
        const text = model.getValue()
        const diagnostics = []
        const lines = text.split("\n")

        // Track braces and parentheses with their positions
        const bracesStack = []
        const parenStack = []
        const bracketsStack = []

        // Track state for context-aware checks
        let inComment = false
        let inString = false
        let inBlockComment = false

        // Check for Google Style line length (100 chars)
        lines.forEach((line, lineIndex) => {
          if (line.length > 100) {
            diagnostics.push({
              severity: monaco.MarkerSeverity.Warning,
              message: "Line exceeds 100 characters (Google Style)",
              startLineNumber: lineIndex + 1,
              startColumn: 100,
              endLineNumber: lineIndex + 1,
              endColumn: line.length + 1
            })
          }
        })

        // Process each character for brace/parenthesis matching
        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex]

          for (let colIndex = 0; colIndex < line.length; colIndex++) {
            const char = line[colIndex]
            const nextChar = colIndex + 1 < line.length ? line[colIndex + 1] : null

            // Handle comments and strings to avoid false positives
            if (!inComment && !inBlockComment && char === "/" && nextChar === "/") {
              inComment = true
              continue
            }

            if (!inComment && !inBlockComment && !inString && char === "/" && nextChar === "*") {
              inBlockComment = true
              colIndex++ // Skip the next character
              continue
            }

            if (inBlockComment && char === "*" && nextChar === "/") {
              inBlockComment = false
              colIndex++ // Skip the next character
              continue
            }

            if (inComment) {
              // Skip the rest of the line if in a line comment
              continue
            }

            if (!inBlockComment && !inString && char === "\"" && (colIndex === 0 || line[colIndex - 1] !== "\\")) {
              inString = !inString
              continue
            }

            // Skip processing if in a comment or string
            if (inBlockComment || inString) {
              continue
            }

            // Track braces
            if (char === "{") {
              bracesStack.push({
                line: lineIndex + 1,
                column: colIndex + 1
              })
            } else if (char === "}") {
              if (bracesStack.length === 0) {
                diagnostics.push({
                  severity: monaco.MarkerSeverity.Error,
                  message: "Unmatched closing brace '}'",
                  startLineNumber: lineIndex + 1,
                  startColumn: colIndex + 1,
                  endLineNumber: lineIndex + 1,
                  endColumn: colIndex + 2
                })
              } else {
                bracesStack.pop()
              }
            }

            // Track parentheses
            if (char === "(") {
              parenStack.push({
                line: lineIndex + 1,
                column: colIndex + 1
              })
            } else if (char === ")") {
              if (parenStack.length === 0) {
                diagnostics.push({
                  severity: monaco.MarkerSeverity.Error,
                  message: "Unmatched closing parenthesis ')'",
                  startLineNumber: lineIndex + 1,
                  startColumn: colIndex + 1,
                  endLineNumber: lineIndex + 1,
                  endColumn: colIndex + 2
                })
              } else {
                parenStack.pop()
              }
            }

            // Track brackets
            if (char === "[") {
              bracketsStack.push({
                line: lineIndex + 1,
                column: colIndex + 1
              })
            } else if (char === "]") {
              if (bracketsStack.length === 0) {
                diagnostics.push({
                  severity: monaco.MarkerSeverity.Error,
                  message: "Unmatched closing bracket ']'",
                  startLineNumber: lineIndex + 1,
                  startColumn: colIndex + 1,
                  endLineNumber: lineIndex + 1,
                  endColumn: colIndex + 2
                })
              } else {
                bracketsStack.pop()
              }
            }
          }

          // Reset line comment flag at end of line
          inComment = false
        }

        // Report unmatched opening braces
        bracesStack.forEach(pos => {
          diagnostics.push({
            severity: monaco.MarkerSeverity.Error,
            message: "Unmatched opening brace '{'",
            startLineNumber: pos.line,
            startColumn: pos.column,
            endLineNumber: pos.line,
            endColumn: pos.column + 1
          })
        })

        // Report unmatched opening parentheses
        parenStack.forEach(pos => {
          diagnostics.push({
            severity: monaco.MarkerSeverity.Error,
            message: "Unmatched opening parenthesis '('",
            startLineNumber: pos.line,
            startColumn: pos.column,
            endLineNumber: pos.line,
            endColumn: pos.column + 1
          })
        })

        // Report unmatched opening brackets
        bracketsStack.forEach(pos => {
          diagnostics.push({
            severity: monaco.MarkerSeverity.Error,
            message: "Unmatched opening bracket '['",
            startLineNumber: pos.line,
            startColumn: pos.column,
            endLineNumber: pos.line,
            endColumn: pos.column + 1
          })
        })

        // Check for missing semicolons with improved context awareness
        checkMissingSemicolons(lines, diagnostics, monaco)

        // Check for Google Style indentation (2 spaces)
        checkIndentation(lines, diagnostics, monaco)

        // Check for naming conventions
        checkNamingConventions(lines, diagnostics, monaco)

        // Check for common Java issues
        checkCommonJavaIssues(lines, diagnostics, monaco)

        // Set the markers on the model
        monaco.editor.setModelMarkers(model, "java", diagnostics)
      }

      // Check diagnostics initially
      checkDiagnostics()

      // Re-check diagnostics on content change
      model.onDidChangeContent(() => checkDiagnostics())
    }
  })
}

function checkMissingSemicolons(lines, diagnostics, monaco) {
  // Track multi-line statement context
  let inMultiLineStatement = false
  let bracesDepth = 0

  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith("//") || trimmed.startsWith("/*") || trimmed.startsWith("*")) {
      return
    }

    // Track brace depth for context
    const openBraces = (trimmed.match(/\{/g) || []).length
    const closeBraces = (trimmed.match(/\}/g) || []).length
    bracesDepth += openBraces - closeBraces

    // Check if this line needs a semicolon
    if (
      !trimmed.endsWith(";") &&
      !trimmed.endsWith("{") &&
      !trimmed.endsWith("}") &&
      !trimmed.endsWith(",") && // For multi-line parameters/arguments
      !trimmed.endsWith("(") && // For multi-line method calls
      !inMultiLineStatement &&
      !isControlStatement(trimmed) &&
      !isMethodOrClassDeclaration(trimmed) &&
      !isAnnotation(trimmed) &&
      !isPackageOrImport(trimmed) &&
      bracesDepth >= 0 // Ensure we're not in an unbalanced state
    ) {
      // Check if this is the start of a multi-line statement
      if (isStartOfMultiLineStatement(trimmed)) {
        inMultiLineStatement = true
      } else {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Warning,
          message: "Missing semicolon at the end of the statement",
          startLineNumber: index + 1,
          startColumn: Math.max(1, line.length),
          endLineNumber: index + 1,
          endColumn: line.length + 1
        })
      }
    } else if (inMultiLineStatement && isEndOfMultiLineStatement(trimmed)) {
      inMultiLineStatement = false
    }
  })
}

function checkIndentation(lines, diagnostics, monaco) {
  let expectedIndent = 0
  const INDENT_SIZE = 2 // Google Style uses 2 spaces

  lines.forEach((line, index) => {
    // Skip empty lines
    if (!line.trim()) {
      return
    }

    // Calculate expected indentation
    const leadingSpaces = line.search(/\S|$/)

    // Adjust expected indent based on this line's content
    if (line.trim().startsWith("}")) {
      expectedIndent = Math.max(0, expectedIndent - 1)
    }

    // Check if indentation matches expected
    if (leadingSpaces !== expectedIndent * INDENT_SIZE && !isSpecialIndentationCase(line.trim())) {
      diagnostics.push({
        severity: monaco.MarkerSeverity.Warning,
        message: `Incorrect indentation. Expected ${expectedIndent * INDENT_SIZE} spaces, found ${leadingSpaces}`,
        startLineNumber: index + 1,
        startColumn: 1,
        endLineNumber: index + 1,
        endColumn: leadingSpaces + 1
      })
    }

    // Update expected indent for next line
    if (line.trim().endsWith("{")) {
      expectedIndent++
    }
  })
}

function checkNamingConventions(lines, diagnostics, monaco) {
  // Check class names (PascalCase)
  const classRegex = /\bclass\s+([a-zA-Z0-9_]+)/g

  // Check method names (camelCase)
  const methodRegex = /\b(?:public|protected|private|static|\s) +[\w<>[]]+\s+([a-zA-Z0-9_]+) *\(/g

  // Check variable names (camelCase)
  const variableRegex = /\b(?:int|boolean|String|double|float|long|char|byte|short)\s+([a-zA-Z0-9_]+)\s*[;=]/g

  // Check constant names (UPPER_SNAKE_CASE)
  const constantRegex = /\b(?:static final|final static)\s+[\w<>[]]+\s+([a-zA-Z0-9_]+)\s*[;=]/g

  lines.forEach((line, index) => {
    // Check class names
    let match
    while ((match = classRegex.exec(line)) !== null) {
      const className = match[1]
      if (!/^[A-Z][a-zA-Z0-9]*$/.test(className)) {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Warning,
          message: `Class name '${className}' should use PascalCase`,
          startLineNumber: index + 1,
          startColumn: match.index + match[0].indexOf(className) + 1,
          endLineNumber: index + 1,
          endColumn: match.index + match[0].indexOf(className) + className.length + 1
        })
      }
    }

    // Check method names
    methodRegex.lastIndex = 0
    while ((match = methodRegex.exec(line)) !== null) {
      const methodName = match[1]
      if (!/^[a-z][a-zA-Z0-9]*$/.test(methodName)) {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Warning,
          message: `Method name '${methodName}' should use camelCase`,
          startLineNumber: index + 1,
          startColumn: match.index + match[0].indexOf(methodName) + 1,
          endLineNumber: index + 1,
          endColumn: match.index + match[0].indexOf(methodName) + methodName.length + 1
        })
      }
    }

    // Check variable names
    variableRegex.lastIndex = 0
    while ((match = variableRegex.exec(line)) !== null) {
      const varName = match[1]
      if (!/^[a-z][a-zA-Z0-9]*$/.test(varName)) {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Warning,
          message: `Variable name '${varName}' should use camelCase`,
          startLineNumber: index + 1,
          startColumn: match.index + match[0].indexOf(varName) + 1,
          endLineNumber: index + 1,
          endColumn: match.index + match[0].indexOf(varName) + varName.length + 1
        })
      }
    }

    // Check constant names
    constantRegex.lastIndex = 0
    while ((match = constantRegex.exec(line)) !== null) {
      const constName = match[1]
      if (!/^[A-Z][A-Z0-9_]*$/.test(constName)) {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Warning,
          message: `Constant name '${constName}' should use UPPER_SNAKE_CASE`,
          startLineNumber: index + 1,
          startColumn: match.index + match[0].indexOf(constName) + 1,
          endLineNumber: index + 1,
          endColumn: match.index + match[0].indexOf(constName) + constName.length + 1
        })
      }
    }
  })
}

function checkCommonJavaIssues(lines, diagnostics, monaco) {
  lines.forEach((line, index) => {
    const trimmed = line.trim()

    // Check for potential null pointer issues
    if (trimmed.includes(".") && !trimmed.includes("null !=") && !trimmed.includes("!= null") &&
        !trimmed.includes("null ==") && !trimmed.includes("== null")) {

      // Extract the object being dereferenced
      const match = /(\w+)\./.exec(trimmed)
      if (match && !["this", "super", "System", "Math", "String"].includes(match[1])) {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Info,
          message: `Consider null check for '${match[1]}' before dereferencing`,
          startLineNumber: index + 1,
          startColumn: line.indexOf(match[1]) + 1,
          endLineNumber: index + 1,
          endColumn: line.indexOf(match[1]) + match[1].length + 1
        })
      }
    }

    // Check for empty catch blocks
    if (trimmed.includes("catch") && lines[index + 1] && lines[index + 1].trim() === "}") {
      diagnostics.push({
        severity: monaco.MarkerSeverity.Warning,
        message: "Empty catch block",
        startLineNumber: index + 1,
        startColumn: 1,
        endLineNumber: index + 2,
        endColumn: lines[index + 1].length + 1
      })
    }

    // Check for hardcoded strings that might need localization
    const stringMatches = trimmed.match(/"[^"]{10,}"/g)
    if (stringMatches) {
      stringMatches.forEach(str => {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Info,
          message: "Consider extracting long string to a constant or resource",
          startLineNumber: index + 1,
          startColumn: line.indexOf(str) + 1,
          endLineNumber: index + 1,
          endColumn: line.indexOf(str) + str.length + 1
        })
      })
    }

    // Check for potential integer division issues
    if (trimmed.includes("/") && !trimmed.includes("//")) {
      const divisionMatch = /(\w+)\s*\/\s*(\w+)/.exec(trimmed)
      if (divisionMatch) {
        diagnostics.push({
          severity: monaco.MarkerSeverity.Info,
          message: "Potential integer division. Consider using floating-point values if decimal result is needed.",
          startLineNumber: index + 1,
          startColumn: line.indexOf(divisionMatch[0]) + 1,
          endLineNumber: index + 1,
          endColumn: line.indexOf(divisionMatch[0]) + divisionMatch[0].length + 1
        })
      }
    }

    // Check for increment/decrement formatting (i++ vs i ++)
    const badIncrementMatch = /\w+\s+\+\+/.exec(trimmed)
    if (badIncrementMatch) {
      diagnostics.push({
        severity: monaco.MarkerSeverity.Warning,
        message: "Incorrect spacing for increment operator. Use 'i++' not 'i ++'",
        startLineNumber: index + 1,
        startColumn: line.indexOf(badIncrementMatch[0]) + 1,
        endLineNumber: index + 1,
        endColumn: line.indexOf(badIncrementMatch[0]) + badIncrementMatch[0].length + 1
      })
    }
  })
}

// Helper functions
function isControlStatement(line) {
  return /^(if|else|for|while|do|switch|case|default|try|catch|finally)\b/.test(line)
}

function isMethodOrClassDeclaration(line) {
  return /^(public|private|protected|static|final|abstract|class|interface|enum)\s/.test(line)
}

function isAnnotation(line) {
  return /^@\w+/.test(line)
}

function isPackageOrImport(line) {
  return /^(package|import)\s/.test(line)
}

function isStartOfMultiLineStatement(line) {
  // Check if line likely continues to next line
  return line.endsWith("+") ||
         line.endsWith("&&") ||
         line.endsWith("||") ||
         line.endsWith(",") ||
         line.endsWith("(") ||
         line.endsWith("=")
}

function isEndOfMultiLineStatement(line) {
  // Check if this line completes a multi-line statement
  return line.endsWith(";") || line.endsWith("}")
}

function isSpecialIndentationCase(line) {
  // Cases where indentation might be different
  return line.startsWith("case ") ||
         line.startsWith("default:") ||
         line.startsWith("@") ||
         line.startsWith("/*") ||
         line.startsWith("*")
}