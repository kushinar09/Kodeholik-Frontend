import { toast } from "sonner"
import { ENDPOINTS } from "../constants"
import { MESSAGES } from "../messages"

export async function upvoteComment(apiCall, id) {
  const url = `${ENDPOINTS.UPVOTE_COMMENT}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json()
        toast.error("Error", {
          description: errorData.message
        })
      } catch (error) {
        console.error("Error parsing error response:", error)
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01
      })
    }
    throw new Error("Failed to upvote")
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}

export async function unupvoteComment(apiCall, id) {
  const url = `${ENDPOINTS.UNUPVOTE_COMMENT}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json()
        toast.error("Error", {
          description: errorData.message
        })
      } catch (error) {
        console.error("Error parsing error response:", error)
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01
      })
    }
    throw new Error("Failed to unupvote")
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}

export async function editComment(apiCall, id, comment) {
  const url = `${ENDPOINTS.EDIT_COMMENT}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: comment
  })
  if (!response.ok) {
    if (response.status == 400) {
      try {
        const errorData = await response.json()
        toast.error("Error", {
          description: errorData.message
        })
      } catch (error) {
        console.error("Error parsing error response:", error)
      }
    }
    else if (response.status == 500) {
      toast.error("Error", {
        description: MESSAGES.MSG01
      })
    }
    throw new Error("Failed to unupvote")
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}