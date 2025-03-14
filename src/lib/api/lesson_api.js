import { ENDPOINTS } from "../constants"

export async function getLessonList() {
    const response = await fetch(ENDPOINTS.GET_LESSONS, {
        method: "GET",
        credentials: "include"
    });
    if (!response.ok) {
      throw new Error("Failed to fetch lesson")
    }
    return response.json()
  }

export async function getLessonByChapterId(id) {
    const response = await fetch(ENDPOINTS.GET_LESSON_BY_CHAPTERID.replace(":id", id), {
      method: "GET",
      credentials: "include"
    })
    if (!response.ok) {
      throw new Error("Failed to fetch lesson")
    }
    return response.json()
}

export async function getLessonById(id) {
    const response = await fetch(ENDPOINTS.GET_LESSON_DETAIL.replace(":id", id), {
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
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to create lesson");
    }
    return response.json();
  };

  export async function updateLesson(id, formData, apiCall) {
    const response = await apiCall(ENDPOINTS.CREATE_LESSON.replace(":id", id), {
      method: "PUT",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Failed to update lesson");
    }
    return response.json();
  };

  export async function getVideo(videoUrl) {
    if (!videoUrl) throw new Error("Video URL is missing")
    const url = ENDPOINTS.GET_VIDEO_URL.replace(':videoUrl', encodeURIComponent(videoUrl))
    console.log('Fetching video from:', url)
    const response = await fetch(url, {
      method: "GET",
      credentials: "include",
      headers: {
        // Uncomment and add token if required
        // 'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })
    if (!response.ok) {
      throw new Error(`Failed to fetch video: ${response.status}`)
    }
    return response.json()
  }

  export async function downloadFileLesson(fileKey) {
    const fileUrl = ENDPOINTS.DOWNLOAD_FILE_LESSON(fileKey);
    console.log("Fetching file from:", fileUrl)
  
    try {
      const response = await fetch(fileUrl, {
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