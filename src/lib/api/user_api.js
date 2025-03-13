import { toast } from "@/hooks/use-toast"
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
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message,
          variant: "destructive" // destructive
        })
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast({
        title: "Error",
        description: MESSAGES.MSG01,
        variant: "destructive" // destructive
      })
    }
    throw new Error("Failed to edit profile");
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
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        toast({
          title: "Error",
          description: errorData.message,
          variant: "destructive" // destructive
        })
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast({
        title: "Error",
        description: MESSAGES.MSG01,
        variant: "destructive" // destructive
      })
    }
    throw new Error("Failed to edit profile");
  }
  else {
    const text = await response.text()
    if (!text) return null
    return JSON.parse(text)
  }
}