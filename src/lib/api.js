import { ENDPOINTS } from "./constants"

export async function getProblemList() {
  const response = await fetch(ENDPOINTS.GET_PROBLEMS)
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