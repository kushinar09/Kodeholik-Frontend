/* eslint-disable indent */
"use client"

import { ENDPOINTS } from "@/lib/constants"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import UnauthorisedError from "@/components/pages/errors/unauthorized-error"
import ForbiddenError from "@/components/pages/errors/forbidden"
import NotFoundError from "@/components/pages/errors/not-found-error"
import GeneralError from "@/components/pages/errors/general-error"

const AuthContext = createContext()

// List of endpoints that don't require authentication (for guests)
const guestEndpoints = [
  ENDPOINTS.POST_LOGIN,
  ENDPOINTS.LOGIN_GITHUB,
  ENDPOINTS.LOGIN_GOOGLE,
  ENDPOINTS.POST_PROBLEMS_LIST,
  ENDPOINTS.GET_PROBLEM_DESCRIPTION,
  ENDPOINTS.GET_PROBLEM_INIT_CODE
]

const notThrowErrorEndpoint = [
  ENDPOINTS.GET_PROBLEM_COMMENTS,
  ENDPOINTS.GET_PROBLEM_EDITORIAL,
  ENDPOINTS.GET_PROBLEM_SUBMISSIONS,
  ENDPOINTS.GET_PROBLEM_SOLUTIONS
]

// List of endpoints that don't need token rotation
const notCallRotateTokenEndpoints = [
  ENDPOINTS.ROTATE_TOKEN,
  ENDPOINTS.POST_LOGOUT,
  ENDPOINTS.POST_LOGIN
]

function convertToRegex(endpoint) {
  return new RegExp(
    `^${endpoint
      .replace(/:[^/]+/g, "([^/]+)")
      .replace(/\//g, "\\/")
    }$`
  )
}

function inEndpointList(endpointList, requestedUrl) {
  // Remove query parameters from requested URL
  const baseUrl = requestedUrl.split("?")[0]

  return endpointList.some(endpoint => convertToRegex(endpoint).test(baseUrl))
}

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshPromise, setRefreshPromise] = useState(null)
  const [authError, setAuthError] = useState(null) // To store auth errors

  // Check if the user is authenticated on mount
  const checkAuthStatus = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch(ENDPOINTS.GET_INFOR, {
        credentials: "include",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5174",
          "Access-Control-Allow-Credentials": "true"
        }
      })

      if (response.ok) {
        const data = await response.json()
        setIsAuthenticated(true)
        setUser(data)
        setAuthError(null)
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  // Run auth check only once on mount
  useEffect(() => {
    checkAuthStatus()
  }, [isAuthenticated])

  const logout = async () => {
    try {
      setLoading(true)
      await fetch(ENDPOINTS.POST_LOGOUT, {
        method: "POST",
        credentials: "include",
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5174",
          "Access-Control-Allow-Credentials": "true"
        }
      })
    } catch (error) {
      console.error("Logout failed:", error)
    } finally {
      setIsAuthenticated(false)
      setUser(null)
      setLoading(false)
      setAuthError(null)
    }
  }

  const refreshAccessToken = async () => {
    if (isRefreshing) {
      return refreshPromise
    }

    setIsRefreshing(true)
    const promise = fetch(ENDPOINTS.ROTATE_TOKEN, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5174",
        "Access-Control-Allow-Credentials": "true"
      }
    })
      .then((response) => {
        if (!response.ok) {
          return response.status
        }
        return 200
      })
      .catch((error) => {
        console.error("Refresh token failed:", error)
        setIsAuthenticated(false)
        setUser(null)
        return 500
      })
      .finally(() => {
        setIsRefreshing(false)
        setRefreshPromise(null)
      })

    setRefreshPromise(promise)
    return promise
  }

  const apiCall = async (url, options = {}) => {
    // Check if this endpoint requires authentication
    const requiresAuth = !inEndpointList(guestEndpoints, url) && !inEndpointList(notThrowErrorEndpoint, url)

    // If endpoint requires auth but user is not authenticated, set error
    if (requiresAuth && !isAuthenticated && url !== ENDPOINTS.GET_INFOR) {
      // console.log(url)
      setAuthError("401")
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    setLoading(true)

    if (!options.headers) {
      options.headers = {}
    }

    options.headers = {
      ...(options.headers || {}),
      "Access-Control-Allow-Origin": "http://localhost:5174",
      "Access-Control-Allow-Credentials": "true"
    }
    options.credentials = "include"

    try {
      let response = await fetch(url, options)

      // Handle token refresh if needed
      if (response.status === 401 && !inEndpointList(notCallRotateTokenEndpoints, url)) {
        // console.warn("Access token expired. Attempting refresh...")

        const refreshStatus = await refreshAccessToken()

        if (refreshStatus === 200) {
          // Retry the original request after token refresh
          response = await fetch(url, options)
        } else {
          // Handle different error statuses
          setAuthError(refreshStatus.toString())
          return new Response(JSON.stringify({ error: "Authentication failed" }), { status: refreshStatus })
        }
      }

      // Handle other error statuses
      if (!response.ok && response.status !== 401) {
        setAuthError(response.status.toString())
      }

      return response
    } catch (error) {
      console.error("API call error:", error)
      setAuthError("500")
      throw error
    } finally {
      if (inEndpointList(notThrowErrorEndpoint, url)) setAuthError(null)
      setLoading(false)
    }
  }

  // Render appropriate error page based on authError
  const renderErrorPage = () => {
    switch (authError) {
      case "401":
        return <UnauthorisedError />
      case "403":
        return <ForbiddenError />
      case "404":
        return <NotFoundError />
      case "500":
        return <GeneralError />
      default:
        return null
    }
  }

  return (
    <AuthContext.Provider
      value={{
        apiCall,
        logout,
        isAuthenticated,
        user,
        loading,
        setIsAuthenticated,
        refreshAuth: checkAuthStatus
      }}
    >
      {authError ? renderErrorPage() : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

