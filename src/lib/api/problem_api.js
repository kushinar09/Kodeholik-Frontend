import { ENDPOINTS } from "../constants"

export async function getProblemDescription(apiCall, id) {
  const response = await apiCall(ENDPOINTS.GET_PROBLEM_DESCRIPTION.replace(":id", id))
  if (response.ok) {
    return { status: true, data: await response.json() }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  return { status: false }
}

export async function getProblemEditorial(apiCall, id) {
  const response = await apiCall(ENDPOINTS.GET_PROBLEM_EDITORIAL.replace(":id", id))
  if (response.ok) {
    const data = await response.json()
    return { status: true, data: data.editorialDto }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function getProblemSolutions(apiCall, id, page = 0, size = 15, title, languageName, sortBy, ascending, topics) {
  const url = `${ENDPOINTS.GET_PROBLEM_SOLUTIONS.replace(":id", id)}${"?page=" + page}${size ? "&size=" + size : ""}${title ? "&title=" + title : ""}${languageName ? "&languageName=" + languageName : ""}${sortBy ? "&sortBy=" + sortBy : ""}${sortBy ? "&ascending=" + ascending : ""}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(topics)
  })
  if (response.ok) {
    const text = await response.text()

    if (!text) {
      return { status: true, data: null }
    }

    try {
      const data = JSON.parse(text)
      return { status: true, data }
    } catch (error) {
      console.error("Error parsing JSON:", error)
      return { status: false, error: "Invalid JSON format" }
    }
  }


  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function getProblemSubmission(apiCall, problemId) {
  const url = ENDPOINTS.GET_PROBLEM_SUBMISSIONS.replace(":id", problemId)
  const response = await apiCall(url)
  if (response.ok) {
    const text = await response.text()
    if (!text) {
      return { status: true, data: null }
    }

    try {
      const data = JSON.parse(text)
      return { status: true, data }
    } catch (error) {
      console.error("Error parsing JSON:", error)
      return { status: false, error: "Invalid JSON format" }
    }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function getProblemList(page = 0, size, sortBy, ascending, body) {
  const url = `${ENDPOINTS.POST_PROBLEMS_LIST}${"?page=" + page}${size ? "&size=" + size : ""}${sortBy ? "&sortBy=" + sortBy : ""}${ascending != null ? "&ascending=" + ascending : ""}`
  const response = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    throw new Error("Failed to fetch problems")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function postComment(apiCall, id, comment, commentReply = null, type = "PROBLEM") {
  const response = await apiCall(ENDPOINTS.POST_COMMENT.replace(":id", id), {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(
      {
        "comment": comment,
        "location": type,
        "locationId": id,
        "commentReply": commentReply
      }
    )
  })
  if (response.ok) {
    return { status: true }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function getProblemInitCode(id, language) {
  const response = await fetch(ENDPOINTS.GET_PROBLEM_INIT_CODE.replace(":id", id) + "?languageName=" + language)
  if (response.ok) {
    return { status: true, data: await response.json() }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  return { status: false }
}

export async function getCourseList() {
  const response = await fetch(ENDPOINTS.GET_COURSES)
  if (!response.ok) {
    throw new Error("Failed to fetch courses")
  }
  return response.json()
}