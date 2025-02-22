import { ENDPOINTS } from "../constants"

export async function runCode(id, code, languageName) {
  try {
    const response = await fetch(ENDPOINTS.POST_RUN_CODE.replace(":id", id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, languageName })
    })

    return response
  } catch (error) {
    throw new Error(error.message)
  }
}

export async function submitCode(id, code, languageName) {
  try {
    const response = await fetch(ENDPOINTS.POST_SUBMIT_CODE.replace(":id", id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code, languageName })
    })

    return response
  } catch (error) {
    throw new Error(error.message)
  }
}