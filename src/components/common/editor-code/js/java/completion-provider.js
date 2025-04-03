export function JavaCompletionProvider(monaco) {
  monaco.languages.registerCompletionItemProvider("java", {
    triggerCharacters: [".", "@", "#", "$"],
    provideCompletionItems: (model, position) => {
      const code = model.getValue()
      const lineContent = model.getLineContent(position.lineNumber)
      const wordUntil = model.getWordUntilPosition(position)
      const word = wordUntil.word
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: wordUntil.startColumn,
        endColumn: wordUntil.endColumn
      }

      // Get context information
      const context = getCompletionContext(model, position)

      // Get variables and their types
      const variables = getDeclaredVariables(code)

      // Get arrays and collections for fore/fori suggestions
      const arrays = getDeclaredArrays(code)
      const collections = getDeclaredCollections(code)
      const lastArray = arrays.length > 0 ? arrays[arrays.length - 1] : null
      const lastCollection = collections.length > 0 ? collections[collections.length - 1] : null

      // Get classes defined in the code
      const classes = getDeclaredClasses(code)

      // Get methods defined in the code
      const methods = getDeclaredMethods(code)

      // Check if we're in an import statement
      const isInImport = lineContent.trim().startsWith("import ")

      // Check if we're after a dot (member access)
      const isAfterDot = lineContent.substring(0, position.column - 1).trim().endsWith(".")

      // Check if we're in a method parameter list
      const isInMethodParams = isInMethodParameterList(lineContent, position.column)

      // Check if we're in an annotation
      const isInAnnotation = lineContent.substring(0, position.column).includes("@")

      // Base suggestions
      let suggestions = []

      // Handle different contexts
      if (isInImport) {
        // Provide common Java package suggestions
        suggestions = getImportSuggestions(monaco, range)
      } else if (isAfterDot) {
        // Provide member suggestions based on the object type
        const objectName = getObjectBeforeDot(lineContent, position.column)
        const objectType = getObjectType(objectName, variables, classes)
        suggestions = getMemberSuggestions(monaco, objectType, range)
      } else if (isInAnnotation) {
        // Provide annotation suggestions
        suggestions = getAnnotationSuggestions(monaco, range)
      } else if (isInMethodParams) {
        // Provide variable suggestions that match expected parameter types
        suggestions = getVariableSuggestions(monaco, variables, range)
      } else {
        // Provide general code suggestions
        suggestions = getGeneralSuggestions(monaco, context, variables, arrays, collections, lastArray, lastCollection, range)
      }

      return { suggestions }
    }
  })
}

function getCompletionContext(model, position) {
  const lineContent = model.getLineContent(position.lineNumber)
  const textUntilPosition = lineContent.substring(0, position.column - 1)

  // Determine context based on surrounding code
  const context = {
    inClass: false,
    inMethod: false,
    inComment: false,
    inString: false,
    inImport: false,
    afterKeyword: null,
    previousStatement: "",
    currentBlock: null
  }

  // Check if we're in a comment
  if (textUntilPosition.includes("//") ||
      (textUntilPosition.includes("/*") && !textUntilPosition.includes("*/"))) {
    context.inComment = true
  }

  // Check if we're in a string
  const stringMatches = textUntilPosition.match(/"/g)
  if (stringMatches && stringMatches.length % 2 !== 0) {
    context.inString = true
  }

  // Check if we're in an import statement
  if (textUntilPosition.trim().startsWith("import ")) {
    context.inImport = true
  }

  // Check for keywords that might affect completion
  const keywords = ["if", "else", "for", "while", "switch", "case", "try", "catch", "new", "return"]
  for (const keyword of keywords) {
    const keywordRegex = new RegExp(`\\b${keyword}\\b[^;{]*$`)
    if (keywordRegex.test(textUntilPosition)) {
      context.afterKeyword = keyword
      break
    }
  }

  // Get previous statement
  const prevLines = []
  for (let i = position.lineNumber - 1; i > 0; i--) {
    const prevLine = model.getLineContent(i).trim()
    if (prevLine.length > 0) {
      prevLines.push(prevLine)
      if (prevLine.endsWith(";") || prevLine.endsWith("}") || prevLine.endsWith("{")) {
        break
      }
    }
  }
  context.previousStatement = prevLines.reverse().join(" ")

  // Determine if we're in a class or method
  const fullText = model.getValue()
  const textUntilCursor = fullText.substring(0, model.getOffsetAt(position))

  // Count braces to determine context
  const openBraces = (textUntilCursor.match(/{/g) || []).length
  const closeBraces = (textUntilCursor.match(/}/g) || []).length

  if (openBraces > closeBraces) {
    // We're inside some block
    const classMatch = /\bclass\s+\w+\s*{/.exec(textUntilCursor)
    const methodMatch = /\b(public|private|protected|static|\s)+[\w<>[]]+\s+\w+\s*$$[^)]*$$\s*{/.exec(textUntilCursor)

    if (classMatch && methodMatch) {
      // Check which one is closer to the cursor
      if (classMatch.index > methodMatch.index) {
        context.inClass = true
      } else {
        context.inMethod = true
      }
    } else if (classMatch) {
      context.inClass = true
    } else if (methodMatch) {
      context.inMethod = true
    }
  }

  return context
}

function getDeclaredVariables(code) {
  const variables = []

  // Match variable declarations with types
  const varRegex = /\b(?:final\s+)?(Object|boolean|char|byte|int|short|long|float|double|String|[\w.]+(?:<[\w.<>]+>)?)\s+(\w+)\s*(?:=|;)/g
  let match

  while ((match = varRegex.exec(code)) !== null) {
    variables.push({ name: match[2], type: match[1] })
  }

  // Match variables from for loops
  const forLoopRegex = /\bfor\s*\(\s*(?:final\s+)?([\w.<>]+)\s+(\w+)\s*:/g
  while ((match = forLoopRegex.exec(code)) !== null) {
    variables.push({ name: match[2], type: match[1] })
  }

  // Match variables from catch blocks
  const catchRegex = /\bcatch\s*$$\s*([\w.<>]+)\s+(\w+)\s*$$/g
  while ((match = catchRegex.exec(code)) !== null) {
    variables.push({ name: match[2], type: match[1] })
  }

  return variables
}

function getDeclaredArrays(code) {
  const arrays = []

  // Match array declarations with initialization
  const initRegex = /\b(Object|boolean|char|byte|int|short|long|float|double|String|[\w.]+)(?:<[^>]+>)?\[\]\s+(\w+)\s*=\s*(?:new\s+\1(?:<[^>]+>)?\[\d+\]|{[^}]*})/g
  let match

  while ((match = initRegex.exec(code)) !== null) {
    arrays.push({ name: match[2], type: match[1] })
  }

  // Match array declarations without initialization
  const declRegex = /\b(Object|boolean|char|byte|int|short|long|float|double|String|[\w.]+)(?:<[^>]+>)?\[\]\s+(\w+)\s*;/g
  while ((match = declRegex.exec(code)) !== null) {
    arrays.push({ name: match[2], type: match[1] })
  }

  return arrays
}

function getDeclaredCollections(code) {
  const collections = []

  // Match collection declarations (List, Set, Map, etc.)
  const collectionRegex = /\b(List|ArrayList|LinkedList|Set|HashSet|TreeSet|Map|HashMap|TreeMap)<([\w.<>]+)>\s+(\w+)\s*(?:=|;)/g
  let match

  while ((match = collectionRegex.exec(code)) !== null) {
    collections.push({
      name: match[3],
      type: match[1],
      elementType: match[2]
    })
  }

  return collections
}

function getDeclaredClasses(code) {
  const classes = []

  // Match class declarations
  const classRegex = /\bclass\s+(\w+)(?:\s+extends\s+([\w.]+))?(?:\s+implements\s+([\w.,\s]+))?\s*{/g
  let match

  while ((match = classRegex.exec(code)) !== null) {
    classes.push({
      name: match[1],
      extends: match[2] || null,
      implements: match[3] ? match[3].split(/\s*,\s*/) : []
    })
  }

  return classes
}

function getDeclaredMethods(code) {
  const methods = []

  // Match method declarations
  const methodRegex = /\b(?:public|private|protected|static|\s)+[\w<>[]]+\s+(\w+)\s*$$([^)]*)$$\s*(?:throws\s+[\w,\s.]+\s*)?{/g
  let match

  while ((match = methodRegex.exec(code)) !== null) {
    const name = match[1]
    const params = match[2].trim()

    const parameters = []
    if (params) {
      const paramParts = params.split(",")
      for (const part of paramParts) {
        const paramMatch = /\s*([\w.<>[\]]+)\s+(\w+)\s*/.exec(part.trim())
        if (paramMatch) {
          parameters.push({
            type: paramMatch[1],
            name: paramMatch[2]
          })
        }
      }
    }

    methods.push({ name, parameters })
  }

  return methods
}

function isInMethodParameterList(lineContent, column) {
  const textUntilPosition = lineContent.substring(0, column)

  // Check if we're inside a method call's parameter list
  const lastOpenParen = textUntilPosition.lastIndexOf("(")
  const lastCloseParen = textUntilPosition.lastIndexOf(")")

  return lastOpenParen !== -1 && (lastCloseParen === -1 || lastOpenParen > lastCloseParen)
}

function getObjectBeforeDot(lineContent, column) {
  const textUntilPosition = lineContent.substring(0, column - 1).trim()
  const dotIndex = textUntilPosition.lastIndexOf(".")

  if (dotIndex === -1) return null

  // Extract the object name before the dot
  let objectName = textUntilPosition.substring(0, dotIndex).trim()

  // Handle cases like "this.field" or "super.method"
  if (objectName.endsWith(")")) {
    // This might be a method call, extract the method name
    const parenIndex = objectName.lastIndexOf("(")
    if (parenIndex !== -1) {
      objectName = objectName.substring(0, parenIndex).trim()
    }
  }

  // Remove any trailing whitespace or operators
  objectName = objectName.replace(/[\s+\-*/$[\]]+$/, "")

  // Get the last part of a chained call like "obj1.obj2.obj3"
  const parts = objectName.split(".")
  return parts[parts.length - 1]
}

function getObjectType(objectName, variables, classes) {
  if (!objectName) return null

  // Check if it's a known variable
  for (const variable of variables) {
    if (variable.name === objectName) {
      return variable.type
    }
  }

  // Check if it's a class name
  for (const cls of classes) {
    if (cls.name === objectName) {
      return "Class"
    }
  }

  // Handle special cases
  if (objectName === "this") {
    return "this"
  } else if (objectName === "super") {
    return "super"
  } else if (objectName === "System") {
    return "System"
  } else if (objectName === "String") {
    return "String"
  }

  return null
}

function getImportSuggestions(monaco, range) {
  // Common Java packages
  return [
    {
      label: "java.util.*",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "java.util.*",
      range: range,
      documentation: "Java Utilities package"
    },
    {
      label: "java.io.*",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "java.io.*",
      range: range,
      documentation: "Java I/O package"
    },
    {
      label: "java.nio.*",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "java.nio.*",
      range: range,
      documentation: "Java NIO package"
    },
    {
      label: "java.time.*",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "java.time.*",
      range: range,
      documentation: "Java Time API"
    },
    {
      label: "java.util.concurrent.*",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "java.util.concurrent.*",
      range: range,
      documentation: "Java Concurrency Utilities"
    },
    {
      label: "java.util.function.*",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "java.util.function.*",
      range: range,
      documentation: "Functional interfaces"
    },
    {
      label: "java.util.stream.*",
      kind: monaco.languages.CompletionItemKind.Module,
      insertText: "java.util.stream.*",
      range: range,
      documentation: "Stream API"
    },
    {
      label: "java.util.List",
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: "java.util.List",
      range: range,
      documentation: "List interface"
    },
    {
      label: "java.util.ArrayList",
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: "java.util.ArrayList",
      range: range,
      documentation: "ArrayList implementation"
    },
    {
      label: "java.util.Map",
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: "java.util.Map",
      range: range,
      documentation: "Map interface"
    },
    {
      label: "java.util.HashMap",
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: "java.util.HashMap",
      range: range,
      documentation: "HashMap implementation"
    },
    {
      label: "java.util.Set",
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: "java.util.Set",
      range: range,
      documentation: "Set interface"
    },
    {
      label: "java.util.HashSet",
      kind: monaco.languages.CompletionItemKind.Class,
      insertText: "java.util.HashSet",
      range: range,
      documentation: "HashSet implementation"
    }
  ]
}

function getMemberSuggestions(monaco, objectType, range) {
  if (!objectType) return []

  const suggestions = []

  // Add suggestions based on object type
  switch (objectType) {
  case "String":
    suggestions.push(
      createMethodSuggestion(monaco, "length", "int", [], "Returns the length of this string", range),
      createMethodSuggestion(monaco, "charAt", "char", ["int index"], "Returns the char at the specified index", range),
      createMethodSuggestion(monaco, "substring", "String", ["int beginIndex", "int endIndex"], "Returns a substring", range),
      createMethodSuggestion(monaco, "equals", "boolean", ["Object obj"], "Compares this string to the specified object", range),
      createMethodSuggestion(monaco, "equalsIgnoreCase", "boolean", ["String str"], "Compares strings ignoring case", range),
      createMethodSuggestion(monaco, "startsWith", "boolean", ["String prefix"], "Tests if this string starts with the prefix", range),
      createMethodSuggestion(monaco, "endsWith", "boolean", ["String suffix"], "Tests if this string ends with the suffix", range),
      createMethodSuggestion(monaco, "indexOf", "int", ["String str"], "Returns the index of the first occurrence", range),
      createMethodSuggestion(monaco, "lastIndexOf", "int", ["String str"], "Returns the index of the last occurrence", range),
      createMethodSuggestion(monaco, "replace", "String", ["char oldChar", "char newChar"], "Replaces characters", range),
      createMethodSuggestion(monaco, "trim", "String", [], "Removes whitespace from both ends", range),
      createMethodSuggestion(monaco, "toUpperCase", "String", [], "Converts to upper case", range),
      createMethodSuggestion(monaco, "toLowerCase", "String", [], "Converts to lower case", range),
      createMethodSuggestion(monaco, "split", "String[]", ["String regex"], "Splits this string around matches of the regex", range)
    )
    break

  case "System":
    suggestions.push(
      createFieldSuggestion(monaco, "out", "PrintStream", "Standard output stream", range),
      createFieldSuggestion(monaco, "err", "PrintStream", "Standard error stream", range),
      createFieldSuggestion(monaco, "in", "InputStream", "Standard input stream", range),
      createMethodSuggestion(monaco, "currentTimeMillis", "long", [], "Returns current time in milliseconds", range),
      createMethodSuggestion(monaco, "nanoTime", "long", [], "Returns current time in nanoseconds", range),
      createMethodSuggestion(monaco, "arraycopy", "void", ["Object src", "int srcPos", "Object dest", "int destPos", "int length"], "Copies an array", range),
      createMethodSuggestion(monaco, "exit", "void", ["int status"], "Terminates the JVM", range)
    )
    break

  case "List":
  case "ArrayList":
  case "LinkedList":
    suggestions.push(
      createMethodSuggestion(monaco, "add", "boolean", ["E element"], "Adds an element", range),
      createMethodSuggestion(monaco, "get", "E", ["int index"], "Returns the element at the specified position", range),
      createMethodSuggestion(monaco, "remove", "E", ["int index"], "Removes the element at the specified position", range),
      createMethodSuggestion(monaco, "size", "int", [], "Returns the number of elements", range),
      createMethodSuggestion(monaco, "isEmpty", "boolean", [], "Returns true if this list contains no elements", range),
      createMethodSuggestion(monaco, "clear", "void", [], "Removes all elements", range),
      createMethodSuggestion(monaco, "contains", "boolean", ["Object o"], "Returns true if this list contains the specified element", range),
      createMethodSuggestion(monaco, "indexOf", "int", ["Object o"], "Returns the index of the first occurrence", range),
      createMethodSuggestion(monaco, "lastIndexOf", "int", ["Object o"], "Returns the index of the last occurrence", range),
      createMethodSuggestion(monaco, "toArray", "Object[]", [], "Returns an array containing all elements", range)
    )
    break

  case "Map":
  case "HashMap":
  case "TreeMap":
    suggestions.push(
      createMethodSuggestion(monaco, "put", "V", ["K key", "V value"], "Associates the specified value with the specified key", range),
      createMethodSuggestion(monaco, "get", "V", ["Object key"], "Returns the value to which the specified key is mapped", range),
      createMethodSuggestion(monaco, "remove", "V", ["Object key"], "Removes the mapping for a key", range),
      createMethodSuggestion(monaco, "size", "int", [], "Returns the number of key-value mappings", range),
      createMethodSuggestion(monaco, "isEmpty", "boolean", [], "Returns true if this map contains no key-value mappings", range),
      createMethodSuggestion(monaco, "clear", "void", [], "Removes all mappings", range),
      createMethodSuggestion(monaco, "containsKey", "boolean", ["Object key"], "Returns true if this map contains a mapping for the specified key", range),
      createMethodSuggestion(monaco, "containsValue", "boolean", ["Object value"], "Returns true if this map maps one or more keys to the specified value", range),
      createMethodSuggestion(monaco, "keySet", "Set<K>", [], "Returns a Set view of the keys", range),
      createMethodSuggestion(monaco, "values", "Collection<V>", [], "Returns a Collection view of the values", range),
      createMethodSuggestion(monaco, "entrySet", "Set<Map.Entry<K,V>>", [], "Returns a Set view of the mappings", range)
    )
    break

  case "Set":
  case "HashSet":
  case "TreeSet":
    suggestions.push(
      createMethodSuggestion(monaco, "add", "boolean", ["E element"], "Adds the specified element", range),
      createMethodSuggestion(monaco, "remove", "boolean", ["Object o"], "Removes the specified element", range),
      createMethodSuggestion(monaco, "size", "int", [], "Returns the number of elements", range),
      createMethodSuggestion(monaco, "isEmpty", "boolean", [], "Returns true if this set contains no elements", range),
      createMethodSuggestion(monaco, "clear", "void", [], "Removes all elements", range),
      createMethodSuggestion(monaco, "contains", "boolean", ["Object o"], "Returns true if this set contains the specified element", range),
      createMethodSuggestion(monaco, "toArray", "Object[]", [], "Returns an array containing all elements", range)
    )
    break

  case "Integer":
  case "int":
    suggestions.push(
      createMethodSuggestion(monaco, "parseInt", "int", ["String s"], "Parses the string argument as a signed decimal integer", range),
      createMethodSuggestion(monaco, "valueOf", "Integer", ["int i"], "Returns an Integer instance representing the specified int value", range),
      createMethodSuggestion(monaco, "toString", "String", [], "Returns a String object representing this Integer's value", range),
      createFieldSuggestion(monaco, "MAX_VALUE", "int", "A constant holding the maximum value an int can have", range),
      createFieldSuggestion(monaco, "MIN_VALUE", "int", "A constant holding the minimum value an int can have", range)
    )
    break

  case "Double":
  case "double":
    suggestions.push(
      createMethodSuggestion(monaco, "parseDouble", "double", ["String s"], "Parses the string argument as a double", range),
      createMethodSuggestion(monaco, "valueOf", "Double", ["double d"], "Returns a Double instance representing the specified double value", range),
      createMethodSuggestion(monaco, "toString", "String", [], "Returns a String object representing this Double's value", range),
      createFieldSuggestion(monaco, "MAX_VALUE", "double", "A constant holding the maximum value a double can have", range),
      createFieldSuggestion(monaco, "MIN_VALUE", "double", "A constant holding the minimum value a double can have", range),
      createFieldSuggestion(monaco, "POSITIVE_INFINITY", "double", "A constant holding the positive infinity of type double", range),
      createFieldSuggestion(monaco, "NEGATIVE_INFINITY", "double", "A constant holding the negative infinity of type double", range),
      createFieldSuggestion(monaco, "NaN", "double", "A constant holding a Not-a-Number (NaN) value", range)
    )
    break

  case "Boolean":
  case "boolean":
    suggestions.push(
      createMethodSuggestion(monaco, "parseBoolean", "boolean", ["String s"], "Parses the string argument as a boolean", range),
      createMethodSuggestion(monaco, "valueOf", "Boolean", ["boolean b"], "Returns a Boolean instance representing the specified boolean value", range),
      createMethodSuggestion(monaco, "toString", "String", [], "Returns a String object representing this Boolean's value", range),
      createFieldSuggestion(monaco, "TRUE", "Boolean", "The Boolean object corresponding to the primitive value true", range),
      createFieldSuggestion(monaco, "FALSE", "Boolean", "The Boolean object corresponding to the primitive value false", range)
    )
    break

  case "Class":
    suggestions.push(
      createMethodSuggestion(monaco, "forName", "Class<?>", ["String className"], "Returns the Class object associated with the class or interface with the given string name", range),
      createMethodSuggestion(monaco, "getName", "String", [], "Returns the name of the entity (class, interface, array class, etc.) represented by this Class object", range),
      createMethodSuggestion(monaco, "getSimpleName", "String", [], "Returns the simple name of the underlying class", range),
      createMethodSuggestion(monaco, "newInstance", "Object", [], "Creates a new instance of the class represented by this Class object", range),
      createMethodSuggestion(monaco, "getSuperclass", "Class<?>", [], "Returns the superclass for the class represented by this object", range),
      createMethodSuggestion(monaco, "getInterfaces", "Class<?>[]", [], "Returns the interfaces implemented by the class or interface represented by this object", range),
      createMethodSuggestion(monaco, "getMethods", "Method[]", [], "Returns an array containing Method objects reflecting all the public methods of the class or interface represented by this Class object", range),
      createMethodSuggestion(monaco, "getFields", "Field[]", [], "Returns an array containing Field objects reflecting all the public fields of the class or interface represented by this Class object", range)
    )
    break
  }

  return suggestions
}

function getAnnotationSuggestions(monaco, range) {
  return [
    {
      label: "Override",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "Override",
      range: range,
      documentation: "Indicates that a method declaration is intended to override a method declaration in a supertype"
    },
    {
      label: "Deprecated",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "Deprecated",
      range: range,
      documentation: "Indicates that the marked element is deprecated and should no longer be used"
    },
    {
      label: "SuppressWarnings",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "SuppressWarnings(\"${1:warning}\")",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Indicates that the named compiler warnings should be suppressed"
    },
    {
      label: "FunctionalInterface",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "FunctionalInterface",
      range: range,
      documentation: "Indicates that an interface is intended to be a functional interface"
    },
    {
      label: "SafeVarargs",
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: "SafeVarargs",
      range: range,
      documentation: "Suppresses unchecked warnings about varargs"
    }
  ]
}

function getVariableSuggestions(monaco, variables, range) {
  return variables.map(variable => ({
    label: variable.name,
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: variable.name,
    range: range,
    documentation: `${variable.type} ${variable.name}`
  }))
}

function getGeneralSuggestions(monaco, context, variables, arrays, collections, lastArray, lastCollection, range) {
  // Start with static suggestions
  const suggestions = getStaticSuggestions(monaco, range)

  // Add context-aware suggestions
  if (context.afterKeyword === "new") {
    // Suggest common classes after 'new' keyword
    suggestions.push(...getClassInstantiationSuggestions(monaco, range))
  } else if (context.inMethod) {
    // Add variable suggestions when in a method
    suggestions.push(...variables.map(variable => ({
      label: variable.name,
      kind: monaco.languages.CompletionItemKind.Variable,
      insertText: variable.name,
      range: range,
      documentation: `${variable.type} ${variable.name}`
    })))

    // Add special loop suggestions for arrays and collections
    if (lastArray) {
      suggestions.push(
        createForEachSnippet(monaco, "fore", lastArray.type, lastArray.name, range),
        createForIndexSnippet(monaco, "fori", lastArray.name, range)
      )
    }

    if (lastCollection) {
      suggestions.push(
        createForEachSnippet(monaco, "fore", lastCollection.elementType, lastCollection.name, range),
        createForIteratorSnippet(monaco, "forit", lastCollection.elementType, lastCollection.name, range)
      )
    }
  } else if (context.inClass) {
    // Add method and field suggestions when in a class
    suggestions.push(...getMethodSuggestions(monaco, range))
    suggestions.push(...getFieldSuggestions(monaco, range))
  }

  return suggestions
}

function getStaticSuggestions(monaco, range) {
  return [
    // Snippets with Google Style formatting
    {
      label: "sout",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "System.out.println(${1:});",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Print to console"
    },
    {
      label: "psvm",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "public static void main(String[] args) {\n  ${1}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Main method"
    },
    {
      label: "class",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "class ${1:Name} {\n  ${2}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Class definition"
    },
    {
      label: "if",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "if (${1:condition}) {\n  ${2}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "If statement"
    },
    {
      label: "ifelse",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "if (${1:condition}) {\n  ${2}\n} else {\n  ${3}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "If-else statement"
    },
    {
      label: "while",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "while (${1:condition}) {\n  ${2}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "While loop"
    },
    {
      label: "dowhile",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "do {\n  ${1}\n} while (${2:condition});",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Do-while loop"
    },
    {
      label: "switch",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "switch (${1:variable}) {\n  case ${2:value1}:\n    ${3}\n    break;\n  case ${4:value2}:\n    ${5}\n    break;\n  default:\n    ${6}\n    break;\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Switch statement"
    },
    {
      label: "try",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "try {\n  ${1}\n} catch (${2:Exception} ${3:e}) {\n  ${4}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Try-catch block"
    },
    {
      label: "tryf",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "try {\n  ${1}\n} catch (${2:Exception} ${3:e}) {\n  ${4}\n} finally {\n  ${5}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Try-catch-finally block"
    },
    {
      label: "method",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "public ${1:void} ${2:methodName}(${3:params}) {\n  ${4}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Method definition"
    },
    {
      label: "constructor",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "public ${1:ClassName}(${2:params}) {\n  ${3}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Constructor definition"
    },
    {
      label: "interface",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "interface ${1:Name} {\n  ${2}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Interface definition"
    },
    {
      label: "enum",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "enum ${1:Name} {\n  ${2}\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Enum definition"
    },
    {
      label: "singleton",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "public class ${1:Singleton} {\n  private static ${1:Singleton} instance;\n\n  private ${1:Singleton}() {}\n\n  public static ${1:Singleton} getInstance() {\n    if (instance == null) {\n      instance = new ${1:Singleton}();\n    }\n    return instance;\n  }\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Singleton pattern"
    },
    // Keywords
    { label: "abstract", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "abstract ", range: range },
    { label: "continue", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "continue;", range: range },
    { label: "for", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "for ", range: range },
    { label: "new", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "new ", range: range },
    { label: "switch", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "switch ", range: range },
    { label: "default", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "default:", range: range },
    { label: "package", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "package ", range: range },
    { label: "synchronized", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "synchronized ", range: range },
    { label: "boolean", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "boolean ", range: range },
    { label: "do", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "do ", range: range },
    { label: "if", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "if ", range: range },
    { label: "private", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "private ", range: range },
    { label: "this", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "this", range: range },
    { label: "break", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "break;", range: range },
    { label: "double", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "double ", range: range },
    { label: "implements", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "implements ", range: range },
    { label: "protected", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "protected ", range: range },
    { label: "throw", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "throw ", range: range },
    { label: "byte", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "byte ", range: range },
    { label: "else", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "else ", range: range },
    { label: "import", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "import ", range: range },
    { label: "public", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "public ", range: range },
    { label: "throws", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "throws ", range: range },
    { label: "case", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "case ", range: range },
    { label: "instanceof", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "instanceof ", range: range },
    { label: "return", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "return ", range: range },
    { label: "transient", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "transient ", range: range },
    { label: "catch", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "catch ", range: range },
    { label: "extends", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "extends ", range: range },
    { label: "int", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "int ", range: range },
    { label: "short", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "short ", range: range },
    { label: "try", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "try ", range: range },
    { label: "char", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "char ", range: range },
    { label: "final", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "final ", range: range },
    { label: "interface", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "interface ", range: range },
    { label: "static", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "static ", range: range },
    { label: "void", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "void ", range: range },
    { label: "class", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "class ", range: range },
    { label: "finally", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "finally ", range: range },
    { label: "long", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "long ", range: range },
    { label: "volatile", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "volatile ", range: range },
    { label: "float", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "float ", range: range },
    { label: "native", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "native ", range: range },
    { label: "super", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "super", range: range },
    { label: "while", kind: monaco.languages.CompletionItemKind.Keyword, insertText: "while ", range: range }
  ]
}

function getClassInstantiationSuggestions(monaco, range) {
  return [
    {
      label: "ArrayList<>()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "ArrayList<${1:Type}>()",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Creates a new ArrayList"
    },
    {
      label: "HashMap<>()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "HashMap<${1:KeyType}, ${2:ValueType}>()",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Creates a new HashMap"
    },
    {
      label: "HashSet<>()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "HashSet<${1:Type}>()",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Creates a new HashSet"
    },
    {
      label: "LinkedList<>()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "LinkedList<${1:Type}>()",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Creates a new LinkedList"
    },
    {
      label: "String()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "String(${1:})",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Creates a new String"
    },
    {
      label: "StringBuilder()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "StringBuilder()",
      range: range,
      documentation: "Creates a new StringBuilder"
    },
    {
      label: "Scanner()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "Scanner(${1:System.in})",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Creates a new Scanner"
    },
    {
      label: "File()",
      kind: monaco.languages.CompletionItemKind.Constructor,
      insertText: "File(\"${1:path}\")",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Creates a new File"
    }
  ]
}

function getMethodSuggestions(monaco, range) {
  return [
    {
      label: "getter",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "public ${1:Type} get${2:Name}() {\n  return ${3:fieldName};\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Getter method"
    },
    {
      label: "setter",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "public void set${1:Name}(${2:Type} ${3:paramName}) {\n  this.${4:fieldName} = ${3:paramName};\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Setter method"
    },
    {
      label: "equals",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "@Override\npublic boolean equals(Object obj) {\n  if (this == obj) {\n    return true;\n  }\n  if (obj == null || getClass() != obj.getClass()) {\n    return false;\n  }\n  ${1:ClassName} other = (${1:ClassName}) obj;\n  return ${2:field} == other.${2:field};\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "equals method"
    },
    {
      label: "hashCode",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "@Override\npublic int hashCode() {\n  return Objects.hash(${1:fields});\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "hashCode method"
    },
    {
      label: "toString",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "@Override\npublic String toString() {\n  return \"${1:ClassName}{\" +\n      \"${2:field}=\" + ${2:field} +\n      '}';\n}",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "toString method"
    }
  ]
}

function getFieldSuggestions(monaco, range) {
  return [
    {
      label: "private field",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "private ${1:Type} ${2:name};",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Private field"
    },
    {
      label: "private static field",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "private static ${1:Type} ${2:name};",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Private static field"
    },
    {
      label: "private final field",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "private final ${1:Type} ${2:name};",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Private final field"
    },
    {
      label: "public static final",
      kind: monaco.languages.CompletionItemKind.Snippet,
      insertText: "public static final ${1:Type} ${2:CONSTANT_NAME} = ${3:value};",
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      range: range,
      documentation: "Public static final constant"
    }
  ]
}

function createForEachSnippet(monaco, label, elementType, collectionName, range) {
  return {
    label: label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: `for (${elementType} ${elementType.charAt(0).toLowerCase()} : ${collectionName}) {\n  ${1}\n}`,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range,
    documentation: `Iterate over ${collectionName}`
  }
}

function createForIndexSnippet(monaco, label, arrayName, range) {
  return {
    label: label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: `for (int i = 0; i < ${arrayName}.length; i++) {\n  ${1}\n}`,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range,
    documentation: `Iterate over ${arrayName} with index`
  }
}

function createForIteratorSnippet(monaco, label, elementType, collectionName, range) {
  return {
    label: label,
    kind: monaco.languages.CompletionItemKind.Snippet,
    insertText: `for (Iterator<${elementType}> it = ${collectionName}.iterator(); it.hasNext(); ) {\n  ${elementType} ${elementType.charAt(0).toLowerCase()} = it.next();\n  ${1}\n}`,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
    range: range,
    documentation: `Iterate over ${collectionName} with iterator`
  }
}

function createMethodSuggestion(monaco, name, returnType, params, documentation, range) {
  const paramsString = params.join(", ")
  return {
    label: `${name}(${paramsString})`,
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: name + (params.length > 0 ? "(" : "()"),
    range: range,
    documentation: `${returnType} ${name}(${paramsString}) - ${documentation}`
  }
}

function createFieldSuggestion(monaco, name, type, documentation, range) {
  return {
    label: name,
    kind: monaco.languages.CompletionItemKind.Field,
    insertText: name,
    range: range,
    documentation: `${type} ${name} - ${documentation}`
  }
}