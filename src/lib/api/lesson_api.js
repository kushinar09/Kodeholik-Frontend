import { toast } from "sonner"
import { ENDPOINTS } from "../constants"

export async function getLessonById(apiCall, id) {
  const response = await apiCall(ENDPOINTS.GET_LESSON_DETAIL.replace(":id", id), {
    method: "GET",
    credentials: "include"
  })
  if (!response.ok) {
    throw new Error("Failed to fetch lesson detail")
  }
  return response.json()
}

export async function createLesson(formData, apiCall) {
  const response = await apiCall(ENDPOINTS.CREATE_LESSON, {
    method: "POST",
    credentials: "include",
    body: formData
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to create lesson")
  }
  return response.json()
};

export async function updateLesson(id, formData, apiCall) {
  const response = await apiCall(ENDPOINTS.CREATE_LESSON.replace(":id", id), {
    method: "PUT",
    credentials: "include",
    body: formData
  })
  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(errorText || "Failed to update lesson")
  }
  return response.json()
}

export async function downloadFileLesson(apiCall, fileKey) {
  const fileUrl = ENDPOINTS.DOWNLOAD_FILE_LESSON.replace(":key", encodeURIComponent(fileKey))

  try {
    const response = await apiCall(fileUrl)

    if (!response.ok) {
      return { status: false, data: response.message || "Failed to download file" }
    }
    const blob = await response.blob()
    const downloadUrl = URL.createObjectURL(blob)

    return { status: true, data: downloadUrl, blob }
  } catch (error) {
    toast.error("Error downloading file: ", {
      description: error.message
    })
    return { status: false, data: error.message }
  }
}


export async function completedLesson(id, apiCall) {
  const completeUrl = ENDPOINTS.COMPLETED_LESSON.replace(":id", id)

  try {
    const response = await apiCall(completeUrl, {
      method: "POST",
      credentials: "include"
    })

    if (!response.ok) {
      throw new Error(`Failed to complete lesson. Status: ${response.status}`)
    }

    const text = await response.text()
    return text
  } catch (error) {
    console.error("Error completing lesson:", error)
    throw error
  }
}