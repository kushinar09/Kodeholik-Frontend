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
  const fileUrl = ENDPOINTS.DOWNLOAD_FILE_LESSON(fileKey)
  console.log("Fetching file from:", fileUrl)

  try {
    const response = await apiCall(fileUrl, {
      method: "GET",
      credentials: "include"
    })
    console.log("Response Status:", response.status)

    if (!response.ok) {
      throw new Error(`Failed to fetch file. Status: ${response.status}`)
    }
    const url = await response.text()
    return url
  } catch (error) {
    console.error("Error fetching file:", error)
    throw error
  }
}

export async function completedLesson(id, apiCall) {
  const completeUrl = ENDPOINTS.COMPLETED_LESSON.replace(":id", id)
  console.log("Fetching file from:", completeUrl)

  try {
    const response = await apiCall(completeUrl, {
      method: "POST",
      credentials: "include"
    })
    console.log("Response Status:", response.status)

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