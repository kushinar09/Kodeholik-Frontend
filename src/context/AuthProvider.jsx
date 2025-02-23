import { CONSTANTS, ENDPOINTS } from "@/lib/constants"
import React, { createContext, useContext } from "react"
import { useNavigate } from "react-router-dom"

const AuthContext = createContext()

const authenticatedEndpoints = [
  ENDPOINTS.GET_USER_INFO,
  ENDPOINTS.POST_RUN_CODE,
  ENDPOINTS.POST_SUBMIT_CODE
]

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()

  const logout = () => {
    localStorage.removeItem(CONSTANTS.ACCESS_TOKEN)
    localStorage.removeItem(CONSTANTS.REFRESH_TOKEN)
    navigate("/login", { state: { redirectPath: window.location.pathname } })
  }

  const refreshAccessToken = async () => {
    try {
      const response = await fetch(ENDPOINTS.ROTATE_TOKEN, {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
        headers: { "Content-Type": "application/json" }
      })

      if (!response.ok) {
        throw new Error("Failed to refresh token")
      }

      return true
    } catch (error) {
      console.error("Refresh token failed:", error)
      logout()
      return false
    }
  }

  const apiCall = async (url, options = {}) => {

    if (authenticatedEndpoints.includes(url)) {
      options.headers = {
        ...(options.headers || {}),
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5174",
        "Access-Control-Allow-Credentials": "true"
      }
    }

    options.credentials = "include"

    try {
      let response = await fetch(url, options)

      if (response.status === 401) {
        console.warn("Access token expired. Attempting refresh...")

        const status = await refreshAccessToken()

        if (status) {
          response = await fetch(url, options)
        } else {
          throw new Error("Authentication failed")
        }
      }

      return response
    } catch (error) {
      console.error("API call error:", error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ apiCall }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
