export function JavaFormatter(monaco) {
  monaco.languages.registerDocumentFormattingEditProvider("java", {
    provideDocumentFormattingEdits(model) {
      const text = model.getValue()
      const formatted = formatJavaCode(text)

      return [
        {
          range: model.getFullModelRange(),
          text: formatted
        }
      ]
    }
  })
}

function formatJavaCode(code) {
  // Google Style configuration
  const config = {
    indentSize: 2,
    maxLineLength: 100,
    insertSpaceAfterCommaInAnnotation: true,
    insertSpaceBeforeCommaInTypeParameters: false,
    insertSpaceBeforeOpeningBraceInTypeDeclaration: true,
    insertSpaceAfterCommaInTypeArguments: true,
    bracePositionForAnonymousTypeDeclaration: "end_of_line",
    insertSpaceBeforeColonInCase: false,
    insertSpaceAfterOpeningBraceInArrayInitializer: false,
    insertNewLineInEmptyAnnotationDeclaration: true,
    insertSpaceAfterOpeningParenInAnnotation: false,
    blankLinesBeforeField: 0,
    insertSpaceAfterOpeningParenInWhile: false,
    insertSpaceBetweenEmptyParensInAnnotationTypeMemberDeclaration: false,
    insertNewLineBeforeElseInIfStatement: false,
    insertSpaceAfterPrefixOperator: false,
    keepElseStatementOnSameLine: false,
    insertSpaceAfterEllipsis: true,
    wrapCommentInlineTags: false,
    insertSpaceBeforeOpeningBraceInAnnotationTypeDeclaration: true,
    indentBreaksCompareToCase: true,
    insertSpaceAfterAtInAnnotation: false,
    alignmentForLocalVariableDeclaration: 16,
    alignmentForMultipleFields: 16,
    alignmentForAnnotationsOnParameter: 1040,
    alignmentForExpressionsInArrayInitializer: 16,
    alignmentForConditionalExpression: 80,
    insertSpaceBeforeOpeningParenInFor: true,
    insertSpaceAfterBinaryOperator: true,
    insertSpaceBeforeQuestionInWildcard: false,
    bracePositionForArrayInitializer: "end_of_line",
    insertSpaceBetweenEmptyParensInEnumConstant: false,
    insertNewLineBeforeFinallyInTryStatement: false,
    insertNewLineBeforeCatchInTryStatement: false,
    insertSpaceBeforeOpeningParenInWhile: true,
    blankLinesAfterPackage: 1,
    insertSpaceAfterCommaInTypeParameters: true,
    continuationIndentation: 2,
    insertSpaceAfterPostfixOperator: false,
    alignmentForArgumentsInMethodInvocation: 16,
    insertSpaceBeforeClosingAngleBracketInTypeArguments: false,
    insertSpaceBeforeCommaInSuperinterfaces: false,
    blankLinesBeforeNewChunk: 1,
    insertSpaceBeforeBinaryOperator: true,
    blankLinesBeforePackage: 0,
    tabSize: 2,
    useTab: false
  }

  const lines = code.split("\n")
  const formattedLines = []
  const state = {
    indentLevel: 0,
    inComment: false,
    inBlockComment: false,
    inJavadoc: false,
    inString: false,
    lastNonEmptyLine: "",
    bracesStack: [],
    inMethodParams: false,
    inAnnotation: false,
    inEnum: false,
    inArrayInitializer: false,
    inSwitch: false,
    inCase: false,
    inLambda: false,
    blankLineCounter: 0,
    lastCodeType: null, // package, import, field, method, class, etc.
    pendingIndent: 0
  }

  const INDENT = " ".repeat(config.indentSize)

  // First pass: analyze the code structure
  analyzeCodeStructure(lines, state)

  // Second pass: format the code
  let i = 0
  while (i < lines.length) {
    let line = lines[i].trim()

    // Handle blank lines according to Google Style
    if (line === "") {
      // Limit consecutive blank lines to 1
      if (state.blankLineCounter === 0) {
        formattedLines.push("")
        state.blankLineCounter++
      } else {
        // Skip additional blank lines
        i++
        continue
      }
      i++
      continue
    } else {
      state.blankLineCounter = 0
    }

    // Handle Javadoc and block comments
    if (line.startsWith("/**")) {
      state.inJavadoc = true
      formattedLines.push(INDENT.repeat(state.indentLevel) + line)
      i++
      continue
    }

    if (state.inJavadoc) {
      formattedLines.push(INDENT.repeat(state.indentLevel) + line)
      if (line.endsWith("*/")) {
        state.inJavadoc = false
      }
      i++
      continue
    }

    if (line.startsWith("/*") || state.inBlockComment) {
      state.inBlockComment = !line.endsWith("*/")
      formattedLines.push(INDENT.repeat(state.indentLevel) + line)
      i++
      continue
    }

    // Handle line comments
    if (line.startsWith("//")) {
      formattedLines.push(INDENT.repeat(state.indentLevel) + line)
      i++
      continue
    }

    // Preserve strings and comments for processing
    const { processedLine, strings, comments } = preserveStringsAndComments(line)
    let formattedLine = processedLine

    // Handle package declarations
    if (formattedLine.startsWith("package ")) {
      formattedLines.push(formattedLine)
      // Add blank line after package declaration
      if (config.blankLinesAfterPackage > 0) {
        formattedLines.push("")
      }
      state.lastCodeType = "package"
      i++
      continue
    }

    // Handle import statements
    if (formattedLine.startsWith("import ")) {
      // Group imports
      if (state.lastCodeType && state.lastCodeType !== "import" && state.lastCodeType !== "package") {
        formattedLines.push("")
      }
      formattedLines.push(formattedLine)
      state.lastCodeType = "import"
      i++
      continue
    }

    // Handle annotations
    if (formattedLine.startsWith("@")) {
      state.inAnnotation = !formattedLine.includes(")")
      formattedLines.push(INDENT.repeat(state.indentLevel) + formatAnnotation(formattedLine, config))
      state.lastCodeType = "annotation"
      i++
      continue
    }

    // Adjust indent for closing braces/parentheses at start of line
    if (formattedLine.startsWith("}")) {
      state.indentLevel = Math.max(0, state.indentLevel - 1)
    }

    // Handle enum declarations
    if (formattedLine.includes("enum ") && formattedLine.includes("{")) {
      state.inEnum = true
      formattedLine = formatEnumDeclaration(formattedLine, config)
    }

    // Handle array initializers
    if (formattedLine.includes("{") && formattedLine.includes("=") && formattedLine.includes("[")) {
      state.inArrayInitializer = true
      formattedLine = formatArrayInitializer(formattedLine, config)
    }

    // Handle switch statements
    if (formattedLine.startsWith("switch ")) {
      state.inSwitch = true
    }

    // Handle case statements
    if (state.inSwitch && (formattedLine.startsWith("case ") || formattedLine.startsWith("default:"))) {
      state.inCase = true
      // Google Style indents case statements
      formattedLine = INDENT.repeat(state.indentLevel) + formattedLine
      formattedLines.push(formattedLine)
      state.indentLevel++ // Indent the case body
      i++
      continue
    }

    // Handle lambda expressions
    if (formattedLine.includes("->") && !formattedLine.includes(";")) {
      state.inLambda = true
      formattedLine = formatLambdaExpression(formattedLine, config)
    }

    // Apply Google Style formatting rules
    formattedLine = applyGoogleStyleRules(formattedLine, config)

    // Handle line wrapping for long lines
    if (formattedLine.length > config.maxLineLength) {
      const wrapped = wrapLongLine(formattedLine, INDENT.repeat(state.indentLevel + 1), config.maxLineLength, strings, comments, config)

      // Add wrapped lines
      const wrappedLines = wrapped.split("\n")
      for (let j = 0; j < wrappedLines.length; j++) {
        const indentForLine = j === 0 ? state.indentLevel : state.indentLevel + 1
        formattedLines.push(INDENT.repeat(indentForLine) + wrappedLines[j])
      }
    } else {
      // Add the formatted line with proper indentation
      formattedLines.push(INDENT.repeat(state.indentLevel) + restoreStringsAndComments(formattedLine, strings, comments))
    }

    // Adjust indent level for opening braces
    if (formattedLine.endsWith("{")) {
      state.indentLevel++
      if (formattedLine.includes("class ") || formattedLine.includes("interface ")) {
        state.bracesStack.push("class")
      } else if (formattedLine.includes("enum ")) {
        state.bracesStack.push("enum")
      } else {
        state.bracesStack.push("block")
      }
    }

    // Track method parameters
    if (formattedLine.includes("(") && !formattedLine.includes(")") &&
      (formattedLine.includes(" void ") ||
        formattedLine.includes(" int ") ||
        formattedLine.includes(" String ") ||
        formattedLine.includes(" boolean ") ||
        formattedLine.includes(" double ") ||
        formattedLine.includes(" float ") ||
        formattedLine.includes(" long ") ||
        formattedLine.includes(" char ") ||
        formattedLine.includes(" byte ") ||
        formattedLine.includes(" short "))) {
      state.inMethodParams = true
    }

    if (state.inMethodParams && formattedLine.includes(")")) {
      state.inMethodParams = false
    }

    // Handle end of case statement
    if (state.inCase && (formattedLine.includes("break;") || formattedLine.includes("return ") || formattedLine.includes("throw "))) {
      state.inCase = false
      state.indentLevel-- // Unindent after case body
    }

    if (formattedLine !== "") {
      state.lastNonEmptyLine = formattedLine
    }

    i++
  }

  return formattedLines.join("\n")
}

function analyzeCodeStructure(lines, state) {
  // This function would analyze the code structure to help with formatting decisions
  // For example, identifying class declarations, method declarations, etc.
  // This is a simplified version

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    if (line.includes("class ") && line.includes("{")) {
      // Found a class declaration
    }

    if (line.includes("enum ") && line.includes("{")) {
      // Found an enum declaration
    }

    // More analysis as needed...
  }
}

function preserveStringsAndComments(line) {
  const strings = []
  const comments = []
  let inString = false
  let inCharLiteral = false
  let inLineComment = false
  let currentString = ""
  let currentComment = ""
  let processedLine = ""

  for (let i = 0; i < line.length; i++) {
    // Handle string literals
    if (line[i] === "\"" && (i === 0 || line[i - 1] !== "\\") && !inLineComment && !inCharLiteral) {
      if (inString) {
        strings.push(currentString + "\"")
        processedLine += `__STRING${strings.length - 1}__`
        currentString = ""
      } else {
        currentString = "\""
      }
      inString = !inString
      continue
    }

    // Handle character literals
    if (line[i] === "'" && (i === 0 || line[i - 1] !== "\\") && !inLineComment && !inString) {
      if (inCharLiteral) {
        strings.push(currentString + "'")
        processedLine += `__CHAR${strings.length - 1}__`
        currentString = ""
      } else {
        currentString = "'"
      }
      inCharLiteral = !inCharLiteral
      continue
    }

    // Handle line comments
    if (line[i] === "/" && line[i + 1] === "/" && !inString && !inCharLiteral && !inLineComment) {
      inLineComment = true
      currentComment = "//"
      i++ // Skip the second slash
      continue
    }

    if (inString || inCharLiteral) {
      currentString += line[i]
    } else if (inLineComment) {
      currentComment += line[i]
    } else {
      processedLine += line[i]
    }
  }

  // Add any trailing comment
  if (inLineComment) {
    comments.push(currentComment)
    processedLine += `__COMMENT${comments.length - 1}__`
  }

  return { processedLine, strings, comments }
}

function restoreStringsAndComments(line, strings, comments) {
  let result = line

  // Restore strings
  strings.forEach((str, i) => {
    result = result.replace(`__STRING${i}__`, str)
    result = result.replace(`__CHAR${i}__`, str)
  })

  // Restore comments
  comments.forEach((comment, i) => {
    result = result.replace(`__COMMENT${i}__`, comment)
  })

  return result
}

function formatAnnotation(line, config) {
  let formatted = line

  // Add space after comma in annotation
  if (config.insertSpaceAfterCommaInAnnotation) {
    formatted = formatted.replace(/,([^\s])/g, ", $1")
  }

  // No space after opening paren in annotation
  if (!config.insertSpaceAfterOpeningParenInAnnotation) {
    formatted = formatted.replace(/@\w+\(\s+/g, "@$1(")
  }

  return formatted
}

function formatEnumDeclaration(line, config) {
  let formatted = line

  // Space before opening brace in enum declaration
  if (config.insertSpaceBeforeOpeningBraceInEnumDeclaration) {
    formatted = formatted.replace(/enum\s+\w+\s*\{/g, (match) => {
      return match.replace(/\{/, " {")
    })
  }

  // No space between empty parens in enum constant
  if (!config.insertSpaceBetweenEmptyParensInEnumConstant) {
    formatted = formatted.replace(/$$\s+$$/g, "()")
  }

  return formatted
}

function formatArrayInitializer(line, config) {
  let formatted = line

  // No space after opening brace in array initializer
  if (!config.insertSpaceAfterOpeningBraceInArrayInitializer) {
    formatted = formatted.replace(/\{\s+/g, "{")
  }

  // Space after comma in array initializer
  formatted = formatted.replace(/,([^\s])/g, ", $1")

  return formatted
}

function formatLambdaExpression(line, config) {
  let formatted = line

  // Space around arrow in lambda expression
  formatted = formatted.replace(/([^\s])->([^\s])/g, "$1 -> $2")

  return formatted
}

function applyGoogleStyleRules(line, config) {
  let formattedLine = line

  // Space after keywords (if, for, while, switch, catch, synchronized, etc.)
  const keywords = ["if", "for", "while", "switch", "catch", "synchronized", "try"]
  keywords.forEach(keyword => {
    const regex = new RegExp(`\\b${keyword}\\(`, "g")
    formattedLine = formattedLine.replace(regex, `${keyword} (`)
  })

  // No space before parentheses in method calls and declarations
  formattedLine = formattedLine.replace(/(\w+)\s+\((?!\s)/g, "$1(")

  // Space around binary operators
  formattedLine = formattedLine.replace(/([^\s=!<>])(==|!=|<=|>=|&&|\|\||[+\-*/%&|^]|<<|>>|>>>)([^\s=])/g, "$1 $2 $3")
  formattedLine = formattedLine.replace(/([^\s])\s*(=)\s*([^\s=])/g, "$1 $2 $3")

  // No space for unary operators
  // formattedLine = formattedLine.replace(/\s+(\+\+|--)/g, "$1")
  // formattedLine = formattedLine.replace(/(\+\+|--)\s+/g, "$1")

  formattedLine = formattedLine.replace(/\s*\+\s*\+\s*/g, "++")
  formattedLine = formattedLine.replace(/\s*-\s*-\s*/g, "--")

  // Space after commas
  formattedLine = formattedLine.replace(/,([^\s])/g, ", $1")

  // No space before commas
  formattedLine = formattedLine.replace(/\s+,/g, ",")

  // Space after semicolons in for statements
  formattedLine = formattedLine.replace(/;([^\s])/g, "; $1")

  // No space before semicolons
  formattedLine = formattedLine.replace(/\s+;/g, ";")

  // Space before opening brace
  formattedLine = formattedLine.replace(/([^\s])\{/g, "$1 {")

  // No space after opening parenthesis and before closing parenthesis
  formattedLine = formattedLine.replace(/\(\s+/g, "(")
  formattedLine = formattedLine.replace(/\s+\)/g, ")")

  // No space after opening bracket and before closing bracket
  formattedLine = formattedLine.replace(/\[\s+/g, "[")
  formattedLine = formattedLine.replace(/\s+\]/g, "]")

  // Space after type cast
  formattedLine = formattedLine.replace(/\)\s*([a-zA-Z0-9_])/g, ") $1")

  // Handle else statements - Google style puts else on the same line as }
  if (!config.insertNewLineBeforeElseInIfStatement) {
    formattedLine = formattedLine.replace(/}\s*else/, "} else")
  }

  // Handle catch statements - Google style puts catch on the same line as }
  if (!config.insertNewLineBeforeCatchInTryStatement) {
    formattedLine = formattedLine.replace(/}\s*catch/, "} catch")
  }

  // Handle finally statements - Google style puts finally on the same line as }
  if (!config.insertNewLineBeforeFinallyInTryStatement) {
    formattedLine = formattedLine.replace(/}\s*finally/, "} finally")
  }

  // Space before question mark in conditional
  formattedLine = formattedLine.replace(/([^\s])\?([^\s])/g, "$1 ? $2")

  // Space before colon in conditional
  formattedLine = formattedLine.replace(/([^\s]):\s*([^\s])/g, "$1 : $2")

  // Space after colon in case statement
  if (formattedLine.includes("case ")) {
    formattedLine = formattedLine.replace(/(case .+):\s*([^\s])/g, "$1: $2")
  }

  // Space before opening angle bracket in type parameters
  if (!config.insertSpaceBeforeOpeningAngleBracketInTypeParameters) {
    formattedLine = formattedLine.replace(/\s+<([A-Z])/g, "<$1")
  }

  // No space before closing angle bracket in type parameters
  if (!config.insertSpaceBeforeClosingAngleBracketInTypeArguments) {
    formattedLine = formattedLine.replace(/\s+>/g, ">")
  }

  // Space after closing angle bracket in type arguments
  formattedLine = formattedLine.replace(/>([a-zA-Z0-9_])/g, "> $1")

  // Remove multiple spaces
  formattedLine = formattedLine.replace(/\s{2,}/g, " ")
  formattedLine = formattedLine.trim()

  return formattedLine
}

function wrapLongLine(line, indent, maxLength, strings, comments, config) {
  // Restore strings and comments for accurate length calculation
  const fullLine = restoreStringsAndComments(line, strings, comments)

  if (fullLine.length <= maxLength) return fullLine

  // Find appropriate break points based on Google Style
  const breakPoints = [
    fullLine.lastIndexOf(" && ", maxLength),
    fullLine.lastIndexOf(" || ", maxLength),
    fullLine.lastIndexOf(", ", maxLength),
    fullLine.lastIndexOf(" + ", maxLength),
    fullLine.lastIndexOf(" - ", maxLength),
    fullLine.lastIndexOf(" = ", maxLength),
    fullLine.lastIndexOf(" : ", maxLength),
    fullLine.lastIndexOf(" -> ", maxLength),
    fullLine.lastIndexOf(" extends ", maxLength),
    fullLine.lastIndexOf(" implements ", maxLength),
    fullLine.lastIndexOf(" throws ", maxLength)
  ].filter(point => point > 0)

  if (breakPoints.length === 0) return fullLine

  const breakPoint = Math.max(...breakPoints)
  const firstPart = fullLine.slice(0, breakPoint + 1).trim()
  const secondPart = fullLine.slice(breakPoint + 1).trim()

  // Apply continuation indentation for wrapped lines
  const continuationIndent = " ".repeat(config.continuationIndentation)

  // Recursively wrap the second part if it's still too long
  if (secondPart.length > maxLength - indent.length - continuationIndent.length) {
    return firstPart + "\n" + indent + continuationIndent +
      wrapLongLine(secondPart, indent, maxLength - continuationIndent.length, [], [], config)
  }

  return firstPart + "\n" + indent + continuationIndent + secondPart
}