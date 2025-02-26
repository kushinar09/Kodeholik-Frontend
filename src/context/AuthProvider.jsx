import { CONSTANTS, ENDPOINTS } from "@/lib/constants"
import React, { createContext, useContext, useState } from "react"
import { redirect, useNavigate } from "react-router-dom"

const AuthContext = createContext()

const authenticatedEndpoints = [
  ENDPOINTS.GET_INFOR,
  ENDPOINTS.POST_RUN_CODE,
  ENDPOINTS.POST_SUBMIT_CODE
]

const notCallRotateTokenEndpoints = [
  ENDPOINTS.ROTATE_TOKEN,
  ENDPOINTS.POST_LOGOUT
]

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshPromise, setRefreshPromise] = useState(null)

  function checkCookieExists(cookieName) {
    return document.cookie.split("; ").some(cookie => cookie.startsWith(`${cookieName}=`))
  }

  const logout = async (redirect = false) => {
    await apiCall(ENDPOINTS.POST_LOGOUT, {
      method: "POST"
    })
    if (redirect)
      navigate("/login", { state: { loginRequire: true, redirectPath: window.location.pathname } })
  }

  const refreshAccessToken = async (redirect) => {
    if (isRefreshing) {
      return refreshPromise
    }

    setIsRefreshing(true)
    const promise = fetch(ENDPOINTS.ROTATE_TOKEN, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to refresh token")
        }
        return true // Token refreshed successfully
      })
      .catch(error => {
        console.error("Refresh token failed:", error)
        logout(redirect)
        return false
      })
      .finally(() => {
        setIsRefreshing(false)
        setRefreshPromise(null)
      })

    setRefreshPromise(promise)
    return promise
  }

  const apiCall = async (url, options = {}, redirect = false) => {
    if (!options.headers) {
      options.headers = {}
    }

    options.headers = {
      ...(options.headers || {}),
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "http://localhost:5174",
      "Access-Control-Allow-Credentials": "true"
    }
    options.credentials = "include"

    try {
      let response = await fetch(url, options)

      if (response.status === 401 && checkCookieExists(CONSTANTS.REFRESH_TOKEN) && !notCallRotateTokenEndpoints.includes(url)) {
        console.warn("Access token expired. Attempting refresh...")

        const success = await refreshAccessToken(redirect)

        if (success) {
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
    <AuthContext.Provider value={{ apiCall, logout }}>
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
