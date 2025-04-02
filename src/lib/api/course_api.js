import { ENDPOINTS } from "../constants"

export const getCourseSearch = async ({ apiCall, page, size, sortBy = "title", ascending = true, query, topic }) => {
  const endpoint = ENDPOINTS.GET_COURSES_LIST

  const queryParams = `?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}&sortBy=${encodeURIComponent(sortBy)}&ascending=${encodeURIComponent(ascending)}`
  const fullUrl = endpoint + queryParams

  const body = {}
  if (query) body.title = query
  if (topic && topic !== "All") body.topics = [topic]

  try {
    const response = await apiCall(fullUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Fetch failed with status:", response.status, "Response:", errorText)
      throw new Error(`Failed to fetch courses: ${response.status} - ${errorText}`)
    }

    const text = await response.text()

    try {
      const jsonData = JSON.parse(text)
      return jsonData
    } catch (jsonError) {
      console.error("Failed to parse JSON:", jsonError, "Raw text:", text)
      throw new Error("Response is not valid JSON")
    }
  } catch (error) {
    console.error("Error fetching courses:", error)
    throw error
  }
}


export async function getTopicList(apiCall) {
  const response = await apiCall(ENDPOINTS.GET_TOPIC_LIST)
  if (!response.ok) {
    throw new Error("Failed to fetch topic")
  }
  return response.json()
}

export async function getCourse(apiCall, id) {
  const response = await apiCall(ENDPOINTS.GET_COURSE.replace(":id", id))
  if (!response.ok) {
    throw new Error("Failed to fetch course")
  }
  return response.json()
}

export async function enrollCourse(apiCall, id) {
  const response = await apiCall(ENDPOINTS.ENROLL_COURSE.replace(":id", id), {
    method: "POST"
  })
  if (!response.ok) { // Corrected condition
    const errorResponse = await response.json()
    throw new Error(`Failed to enroll: ${JSON.stringify(errorResponse)}`)
  }
  return response
}

export async function unEnrollCourse(apiCall, id) {
  const response = await apiCall(ENDPOINTS.UNENROLL_COURSE.replace(":id", id), {
    method: "DELETE"
  })
  if (!response.ok) { // Corrected condition
    const errorResponse = await response.json()
    throw new Error(`Failed to unenroll: ${JSON.stringify(errorResponse)}`)
  }
  return response
}

export async function checkEnrollCourse(apiCall, id) {
  try {
    const response = await apiCall(ENDPOINTS.CHECK_ENROLL.replace(":id", id))

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to check enroll: ${errorText || response.statusText}`)
    }

    const text = await response.text()
    return text === "true" // Convert "true"/"false" string to boolean
  } catch (error) {
    throw new Error(`Network error: ${error.message}`)
  }
}

export async function getRateCommentCourse(apiCall, id) {
  // Ensure id is defined and a valid number
  if (!id || isNaN(id)) {
    throw new Error("Invalid courseId provided")
  }

  const url = ENDPOINTS.GET_COMMENT_COURSE.replace(":id", id)

  try {
    const response = await apiCall(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server Response:", errorText)
      throw new Error(`Failed to fetch comments: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching comments:", error.message)
    throw error
  }
}

export async function rateCommentCourse(data, apiCall) {
  try {
    const responseData = await apiCall(ENDPOINTS.RATE_COMMENT_COURSE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })
    return responseData
  } catch (error) {
    console.error("Error when rate course:", error.message)
    throw error // Propagate the error from apiCall
  }
}

export async function getCourseDiscussion(apiCall, id, { page = 0, size = 6, sortBy = "noUpvote", sortDirection = "desc" } = {}) {
  const url = `${ENDPOINTS.GET_COURSE_DISCUSSION.replace(":id", id)}?page=${page}&size=${size}&sortBy=${sortBy}&sortDirection=${sortDirection}`

  try {
    const response = await apiCall(url)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server Response:", errorText)
      throw new Error(`Failed to fetch discussion: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching discussion:", error.message)
    throw error
  }
}

export async function getDiscussionReply(apiCall, id) {
  const url = `${ENDPOINTS.GET_DISCUSSION_REPLY.replace(":id", id)}`

  try {
    const response = await apiCall(url, {
      method: "GET",
      credentials: "include"
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Server Response:", errorText)
      throw new Error(`Failed to fetch REPLY: ${response.status} - ${errorText}`)
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching REPLY:", error.message)
    throw error
  }
}

export async function discussionCourse(data, apiCall) {
  try {
    const response = await apiCall(ENDPOINTS.POST_COURSE_DISCUSSION, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    // Check if response is ok, otherwise throw an error with response text
    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Server error: ${response.status} - ${errorText}`)
    }

    // If response has content, parse it; otherwise return success
    const contentLength = response.headers.get("content-length")
    const responseData = contentLength && contentLength !== "0" ? await response.json() : { success: true }
    return responseData
  } catch (error) {
    console.error("discussionCourse Error:", error.message)
    throw error // Propagate the error to be caught in handleSendMessage
  }
}

export async function upvoteDiscussion(apiCall, id) {
  const url = ENDPOINTS.UPVOTE_COURSE_DISCUSSION.replace(":id", id)
  try {
    const response = await apiCall(url, {
      method: "PUT",
      credentials: "include"
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to upvote discussion: ${response.status} - ${errorText}`)
    }

    // For 204 status, there won't be a response body to parse
    if (response.status === 204) {
      return { success: true } // Return a simple success object
    }

    // If the API returns content (not expected in this case, but keeping for completeness)
    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("upvoteDiscussion Error:", error.message)
    throw error
  }
}

export async function unUpvoteDiscussion(apiCall, id) {
  const url = ENDPOINTS.UN_UPVOTE_COURSE_DISCUSSION.replace(":id", id)
  try {
    const response = await apiCall(url, {
      method: "PUT",
      credentials: "include"
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Failed to unupvote discussion: ${response.status} - ${errorText}`)
    }

    // For 204 status, there won't be a response body to parse
    if (response.status === 204) {
      return { success: true } // Return a simple success object
    }

    // If the API returns content (not expected in this case, but keeping for completeness)
    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error("unUpvoteDiscussion Error:", error.message)
    throw error
  }
}

export async function courseRegisterIn(apiCall, id) {
  const url = ENDPOINTS.COURSE_REGISTER_IN.replace(":id", id)

  try {
    const response = await apiCall(url, {
      method: "PUT",
      credentials: "include"
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[courseRegisterIn] Failed with status: ${response.status}, Error: ${errorText}`)
      throw new Error(`Failed to register-in: ${response.status} - ${errorText}`)
    }

    if (response.status === 204) {
      return { success: true }
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error(`[courseRegisterIn] Error for course ID: ${id}:`, error.message)
    throw error
  }
}

export async function courseRegisterOUT(apiCall, id) {
  const url = ENDPOINTS.COURSE_REGISTER_OUT.replace(":id", id)

  try {
    const response = await apiCall(url, {
      method: "PUT",
      credentials: "include"
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[courseRegisterOUT] Failed with status: ${response.status}, Error: ${errorText}`)
      throw new Error(`Failed to register-out: ${response.status} - ${errorText}`)
    }

    if (response.status === 204) {
      return { success: true }
    }

    const responseData = await response.json()
    return responseData
  } catch (error) {
    console.error(`[courseRegisterOUT] Error for course ID: ${id}:`, error.message)
    throw error
  }
}