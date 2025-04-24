import { ENDPOINTS } from "../constants"

export function convertToType(value, type) {
  // console.log("Converting value:", value, "of type:", type)
  if (value.startsWith("\"") && value.endsWith("\"")) {
    value = value.slice(1, -1)
  }
  try {
    switch (type) {
    case "STRING":
      return String(value)

    case "CHAR":
      if (typeof value === "string" && value.length === 1) return value
      throw new Error(`Invalid char: "${value}"`)

    case "INT":
    {
      if (!/^-?\d+$/.test(value)) throw new Error(`Invalid int: "${value}"`);
      const intValue = parseInt(value, 10)
      if (isNaN(intValue)) throw new Error(`Invalid int: "${value}"`)
      return intValue
    }

    case "DOUBLE":
    {
      const doubleValue = parseFloat(value)
      if (isNaN(doubleValue)) throw new Error(`Invalid double: "${value}"`)
      return doubleValue
    }

    case "LONG":
    {
      const longValue = parseInt(value, 10)
      if (isNaN(longValue)) throw new Error(`Invalid long: "${value}"`)
      return longValue
    }

    case "BOOLEAN":
      if (value === "true") return true
      if (value === "false") return false
      throw new Error(`Invalid boolean: "${value}"`)

    case "LIST":
    case "SET":
    case "MAP":
    case "OBJECT":
    case "ARR_OBJECT":
      try {
        const parsed = JSON.parse(value)
        if (type === "SET") return Array.isArray(parsed) ? new Set(parsed) : new Set(Object.values(parsed))
        if (type === "MAP") return new Map(Object.entries(parsed))
        return parsed
      } catch (err) {
        throw new Error(`Invalid ${type}: must be valid JSON`)
      }

    case "ARR_INT":
      return JSON.parse(value).map(v => {
        const i = parseInt(v, 10)
        if (isNaN(i)) throw new Error(`Invalid element in array of int: "${v}"`)
        return i
      })

    case "ARR_DOUBLE":
      return JSON.parse(value).map(v => {
        const d = parseFloat(v)
        if (isNaN(d)) throw new Error(`Invalid element in array of double: "${v}"`)
        return d
      })

    case "ARR_STRING":
      return JSON.parse(value).map(v => String(v))

    default:
      throw new Error(`Unsupported type: "${type}"`)
    }
  } catch (err) {
    console.error(`Conversion error for value "${value}" with type "${type}": ${err.message}`)
    throw err
  }
}


export async function runCode(apiCall, id, code, languageName, testCases) {
  try {
    const response = await apiCall(ENDPOINTS.POST_RUN_CODE.replace(":id", id), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code,
        languageName,
        inputs: testCases.map(testCase =>
          testCase.input.map(({ name, value, type }) => ({ name, value: convertToType(value, type) }))
        )
      })
    }, true)

    const data = await response.json()

    if (response.ok) {
      return { status: true, data: data }
    }

    return { status: false, data: data }
  } catch (error) {
    return {
      status: false, data: {
        message: error.message
      }
    }
  }
}

export async function submitCode(apiCall, id, code, languageName) {
  try {
    const response = await apiCall(ENDPOINTS.POST_SUBMIT_CODE.replace(":id", id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, languageName })
    }, true)

    const data = await response.json()

    if (response.ok) {
      return { status: true, data: data }
    }

    return { status: false, data: data }
  } catch (error) {
    throw new Error(error.message)
  }
}
