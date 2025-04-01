import { toast } from "@/hooks/use-toast"
import { ENDPOINTS } from "../constants"
import { MESSAGES } from "../messages"

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

export async function postComment(apiCall, id, comment, commentReply = null, type) {
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
    const text = await response.json()
    return { status: true, data: text }
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

export async function getProblemAvailableLanguages(id) {
  const response = await fetch(ENDPOINTS.GET_PROBLEM_LANGUAGES_SUPPORT.replace(":id", id),
    {
      method: "GET",
      credentials: "include"
    }
  )
  if (response.ok) {
    return { status: true, data: await response.json() }
  }

  return { status: false, message: "Error when get languages supported: " + response.status }
}

export async function getSubmissionDetail(apiCall, submissionId) {
  const url = `${ENDPOINTS.GET_SUBMISSION_DETAIL}${submissionId}`
  console.log(url);
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
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

export async function getSuccessSubmissionList(apiCall, link) {
  const url = `${ENDPOINTS.GET_SUCCESS_SUBMISSION}${link}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify([])
  })
  if (!response.ok) {
    throw new Error("Failed to fetch problems")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function getAllSkills(apiCall) {
  const url = `${ENDPOINTS.GET_SKILLS_PROBLEM}`
  const response = await apiCall(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (!response.ok) {
    throw new Error("Failed to fetch problems")
  }
  const text = await response.text()
  if (!text) return null
  return JSON.parse(text)
}

export async function postSolution(apiCall, solution) {
  const url = `${ENDPOINTS.POST_SOLUTION}`
  const response = await apiCall(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(solution)
  })
  if (response.ok) {
    console.log(response);
    const text = await response.json()
    return { status: true, data: text }
  }
  else {
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        let value = "";
        if (Array.isArray(errorData.message)) {
          for (let i = 0; i < errorData.message.length; i++) {
            value += errorData.message[i].field + ": " + errorData.message[i].error + "; ";
          }
        }
        else {
          value += errorData.message;
        }
        toast({
          title: "Error",
          description: value,
          variant: "destructive" // destructive
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast({
        title: "Error",
        description: MESSAGES.MSG01,
        variant: "destructive" // destructive
      });
    }
    else if (response.status === 404) {
      return { status: false, message: "Problem not found" }
    }
    throw new Error("Failed to add user");

  }

}

export async function editSolution(apiCall, solution, id) {
  const url = `${ENDPOINTS.EDIT_SOLUTION}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(solution)
  })
  if (response.ok) {
    console.log(response);
    const text = await response.json()
    return { status: true, data: text }
  }
  else {
    if (response.status == 400) {
      try {
        const errorData = await response.json();
        let value = "";
        if (Array.isArray(errorData.message)) {
          for (let i = 0; i < errorData.message.length; i++) {
            value += errorData.message[i].field + ": " + errorData.message[i].error + "; ";
          }
        }
        else {
          value += errorData.message;
        }
        toast({
          title: "Error",
          description: value,
          variant: "destructive" // destructive
        });
      } catch (error) {
        console.error("Error parsing error response:", error);
      }
    }
    else if (response.status == 500) {
      toast({
        title: "Error",
        description: MESSAGES.MSG01,
        variant: "destructive" // destructive
      });
    }
    throw new Error("Failed to edit solution");

  }

}

export async function upvoteSolution(apiCall, id) {
  const url = `${ENDPOINTS.UPVOTE_SOLUTION}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (response.ok) {
    return { status: true }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}

export async function unupvoteSolution(apiCall, id) {
  const url = `${ENDPOINTS.UNUPVOTE_SOLUTION}${id}`
  const response = await apiCall(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    }
  })
  if (response.ok) {
    return { status: true }
  }

  if (response.status === 404) {
    return { status: false, message: "Problem not found" }
  }

  return { status: false }
}