import { toast } from "sonner"
import { ENDPOINTS } from "../constants"
import { MESSAGES } from "../messages"

export async function getUserProfile(apiCall) {
  const url = `${ENDPOINTS.GET_PROFILE}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function editProfile(apiCall, body) {
  const url = `${ENDPOINTS.POST_EDIT_PROFILE}`
  const response = await apiCall(url, {
    method: "PUT",
    body: body
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to edit profile"

    if (Array.isArray(errorData.message)) {
      // Extract first error message from array
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}

export async function changePassword(apiCall, body) {
  const url = `${ENDPOINTS.PUT_CHANGE_PASSWORD}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })
  if (!response.ok) {
    const errorData = await response.json()
    let errorMessage = "Failed to edit profile"

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}

export async function getNumberLanguageSolved(apiCall) {
  const url = `${ENDPOINTS.GET_NUMBER_LANGUAGE_SOLVED}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getNumberSkillSolved(apiCall, level) {
  const url = `${ENDPOINTS.GET_NUMBER_SKILL_SOLVED}?level=${level}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getNumberTopicSolved(apiCall) {
  const url = `${ENDPOINTS.GET_NUMBER_TOPIC_SOLVED}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getAcceptanceRate(apiCall) {
  const url = `${ENDPOINTS.GET_ACCEPTANCE_RATE}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getMyProgress(apiCall, body) {
  const url = `${ENDPOINTS.GET_MY_PROGRESS}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getMySubmission(apiCall, body) {
  const url = `${ENDPOINTS.GET_MY_SUBMISSION}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getMyFavourite(apiCall, page, size) {
  const url = `${ENDPOINTS.GET_MY_FAVOURITE}?page=${page}&size=${size}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function tagFavourite(apiCall, link) {
  const url = `${ENDPOINTS.TAG_FAVOURITE}${link}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    let errorMessage = "Failed to tag favourite"
    const errorData = await response.json()

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}

export async function untagFavourite(apiCall, link) {
  const url = `${ENDPOINTS.UNTAG_FAVOURITE}${link}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    let errorMessage = "Failed to tag favourite"
    const errorData = await response.json()

    if (Array.isArray(errorData.message)) {
      errorMessage = errorData.message[0]?.error || errorMessage
    } else if (typeof errorData.message === "object") {
      errorMessage = errorData.message.error || errorMessage
    } else if (typeof errorData.message === "string") {
      errorMessage = errorData.message
    }
    throw new Error(errorMessage)
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}