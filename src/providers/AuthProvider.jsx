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
const notCallRotateTokenEndpoints = [ENDPOINTS.ROTATE_TOKEN, ENDPOINTS.POST_LOGOUT, ENDPOINTS.POST_LOGIN]

function convertToRegex(endpoint) {
  return new RegExp(`^${endpoint.replace(/:[^/]+/g, "([^/]+)").replace(/\//g, "\\/")}$`)
}

function inEndpointList(endpointList, requestedUrl) {
  // Remove query parameters from requested URL
  const baseUrl = requestedUrl.split("?")[0]

  return endpointList.some((endpoint) => convertToRegex(endpoint).test(baseUrl))
}

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshPromise, setRefreshPromise] = useState(null)

  // Track API errors without immediately showing them
  const [apiErrors, setApiErrors] = useState({})
  // Track active API requests to manage loading state
  const [activeRequests, setActiveRequests] = useState(0)

  // Check if the user is authenticated on mount
  const checkAuthStatus = useCallback(async () => {
    try {
      incrementActiveRequests()
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
        clearApiError("auth")
      } else {
        setIsAuthenticated(false)
        setUser(null)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setIsAuthenticated(false)
      setUser(null)
    } finally {
      decrementActiveRequests()
    }
  }, [])

  // Run auth check only once on mount
  useEffect(() => {
    checkAuthStatus()
    // Remove isAuthenticated from dependencies to prevent loops
  }, [isAuthenticated])

  const incrementActiveRequests = () => {
    setActiveRequests((prev) => prev + 1)
    setLoading(true)
  }

  const decrementActiveRequests = () => {
    setActiveRequests((prev) => {
      const newCount = prev - 1
      if (newCount <= 0) {
        setLoading(false)
        return 0
      }
      return newCount
    })
  }

  // Add an error to the errors state
  const addApiError = useCallback((errorType, errorDetails) => {
    setApiErrors((prev) => ({
      ...prev,
      [errorType]: errorDetails
    }))
  }, [])

  // Clear a specific error
  const clearApiError = useCallback((errorType) => {
    setApiErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[errorType]
      return newErrors
    })
  }, [])

  const logout = async () => {
    try {
      incrementActiveRequests()
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
      decrementActiveRequests()
      clearApiError("auth")
    }
  }

  const refreshAccessToken = async () => {
    if (isRefreshing) {
      return refreshPromise
    }

    setIsRefreshing(true)
    incrementActiveRequests()

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
        decrementActiveRequests()
      })

    setRefreshPromise(promise)
    return promise
  }

  const apiCall = async (url, options = {}) => {
    // Check if this endpoint requires authentication
    const requiresAuth = !inEndpointList(guestEndpoints, url) && !inEndpointList(notThrowErrorEndpoint, url)

    // If endpoint requires auth but user is not authenticated, add auth error
    if (requiresAuth && !isAuthenticated && url !== ENDPOINTS.GET_INFOR) {
      addApiError("auth", { status: 401 })
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 })
    }

    incrementActiveRequests()

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
        const refreshStatus = await refreshAccessToken()

        if (refreshStatus === 200) {
          // Retry the original request after token refresh
          response = await fetch(url, options)
        } else {
          // Handle different error statuses
          addApiError("auth", { status: refreshStatus })
          return new Response(JSON.stringify({ error: "Authentication failed" }), { status: refreshStatus })
        }
      }

      // Handle other error statuses
      if (!response.ok) {
        const errorKey = `${url.split("?")[0]}-${response.status}`

        if (response.status === 401) {
          addApiError("auth", { status: 401 })
        } else if (!inEndpointList(notThrowErrorEndpoint, url)) {
          addApiError(errorKey, { status: response.status })
        }
      } else {
        // Clear errors for this URL on success
        const baseUrl = url.split("?")[0]
        Object.keys(apiErrors).forEach((key) => {
          if (key.startsWith(baseUrl)) {
            clearApiError(key)
          }
        })
      }

      return response
    } catch (error) {
      console.error("API call error:", error)
      if (!inEndpointList(notThrowErrorEndpoint, url)) {
        addApiError("network", { status: 500 })
      }
      throw error
    } finally {
      if (inEndpointList(notThrowErrorEndpoint, url)) {
        // Clear any errors for this endpoint
        const baseUrl = url.split("?")[0]
        Object.keys(apiErrors).forEach((key) => {
          if (key.startsWith(baseUrl)) {
            clearApiError(key)
          }
        })
      }
      decrementActiveRequests()
    }
  }

  // Get the most severe error to display
  const getMostSevereError = useCallback(() => {
    // Priority: 500 > 403 > 401 > 404
    if (Object.values(apiErrors).some((err) => err.status === 500)) return "500"
    if (Object.values(apiErrors).some((err) => err.status === 403)) return "403"
    if (Object.values(apiErrors).some((err) => err.status === 401)) return "401"
    if (Object.values(apiErrors).some((err) => err.status === 404)) return "404"
    return null
  }, [apiErrors])

  // Render appropriate error page based on most severe error
  const renderErrorPage = () => {
    const errorCode = getMostSevereError()

    switch (errorCode) {
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

  // Only show error page if there's an error and it's not from a notThrowErrorEndpoint
  const shouldShowErrorPage = () => {
    const hasError = Object.keys(apiErrors).length > 0
    const isFromNoThrowEndpoint = Object.keys(apiErrors).some((key) => {
      const baseUrl = key.split("-")[0]
      return inEndpointList(notThrowErrorEndpoint, baseUrl)
    })

    return hasError && !isFromNoThrowEndpoint
  }

  return (
    <AuthContext.Provider
      value={{
        apiCall,
        logout,
        isAuthenticated,
        user,
        loading: activeRequests > 0,
        setIsAuthenticated,
        refreshAuth: checkAuthStatus,
        errors: apiErrors,
        clearError: clearApiError
      }}
    >
      {shouldShowErrorPage() ? renderErrorPage() : children}
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

