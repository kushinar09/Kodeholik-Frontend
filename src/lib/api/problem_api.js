import { ENDPOINTS } from "../constants"

export async function getProblemDescription(id) {
  const response = await fetch(ENDPOINTS.GET_PROBLEM_DESCRIPTION.replace(":id", id))
  if (response.ok) {
    return { status: true, data: await response.json() }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  return { status: false }
}

export async function getProblemList(page = 0, size, sortBy, ascending, body) {
  const url = `${ENDPOINTS.POST_PROBLEMS_LIST}${"?page=" + page}${size ? "&size=" + size : ""}${sortBy ? "&sortBy=" + sortBy : ""}${ascending ? "&ascending=" + ascending : ""}`
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
  return response.json()
}

export async function getProblem(id) {
  const response = await fetch(ENDPOINTS.GET_PROBLEM.replace(":id", id))
  if (!response.ok) {
    throw new Error("Failed to fetch problem")
  }
  return response.json()
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

export async function createProblem(data) {
  const response = await fetch(ENDPOINTS.CREATE_PROBLEM, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error("Failed to create problem")
  }
  return response.json()
}

export async function updateProblem(id, data) {
  const response = await fetch(ENDPOINTS.UPDATE_PROBLEM.replace(":id", id), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(data)
  })
  if (!response.ok) {
    throw new Error("Failed to update problem")
  }
  return response.json()
}

export async function deleteProblem(id) {
  const response = await fetch(ENDPOINTS.DELETE_PROBLEM.replace(":id", id), {
    method: "DELETE"
  })
  if (!response.ok) {
    throw new Error("Failed to delete problem")
  }
}

export async function getCourseList() {
  const response = await fetch(ENDPOINTS.GET_COURSES)
  if (!response.ok) {
    throw new Error("Failed to fetch courses")
  }
  return response.json()
}