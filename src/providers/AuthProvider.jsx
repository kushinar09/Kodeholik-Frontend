"use client"

import { ENDPOINTS } from "@/lib/constants"
import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react"
import UnauthorisedError from "@/components/pages/errors/unauthorized-error"
import ForbiddenError from "@/components/pages/errors/forbidden"
import NotFoundError from "@/components/pages/errors/not-found-error"
import GeneralError from "@/components/pages/errors/general-error"
import { toast } from "sonner"

const AuthContext = createContext()

// List of endpoints that don't require authentication (for guests)
const guestEndpoints = [
  ENDPOINTS.POST_LOGIN,
  ENDPOINTS.LOGIN_GITHUB,
  ENDPOINTS.LOGIN_GOOGLE,
  ENDPOINTS.POST_PROBLEMS_LIST,
  ENDPOINTS.GET_PROBLEM_DESCRIPTION,
  ENDPOINTS.GET_PROBLEM_INIT_CODE,
  ENDPOINTS.POST_RUN_EXAM
]

const notThrowErrorEndpoint = [
  ENDPOINTS.GET_PROBLEM_COMMENTS,
  ENDPOINTS.GET_PROBLEM_EDITORIAL,
  ENDPOINTS.GET_PROBLEM_SUBMISSIONS,
  ENDPOINTS.GET_PROBLEM_SOLUTIONS,
  ENDPOINTS.GET_STATS_PROBLEM,
  ENDPOINTS.GET_NOTIFICATIONS,
  ENDPOINTS.GET_NOTIFICATIONS_TOKEN,
  ENDPOINTS.GET_INFOR,
  ENDPOINTS.GET_TOKEN_EXAM,
  ENDPOINTS.POST_RUN_EXAM,
  ENDPOINTS.POST_ENROLL_EXAM,
  ENDPOINTS.POST_UNENROLL_EXAM,
  ENDPOINTS.DOWNLOAD_FILE_LESSON
]

// List of endpoints that don't need token rotation
const notCallRotateTokenEndpoints = [ENDPOINTS.ROTATE_TOKEN, ENDPOINTS.POST_LOGOUT, ENDPOINTS.POST_LOGIN]

function convertToRegex(endpoint) {
  const path = endpoint.split("?")[0]
  return new RegExp(`^${path.replace(/:[^/]+/g, "([^/]+)").replace(/\//g, "\\/")}$`)
}

function inEndpointList(endpointList, requestedUrl) {
  const baseUrl = requestedUrl.split("?")[0]
  return endpointList.some((endpoint) => convertToRegex(endpoint).test(baseUrl))
}

export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState(null)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshPromise, setRefreshPromise] = useState(null)
  const authCheckInProgress = useRef(false)
  const lastAuthCheck = useRef(0)

  // Track API errors without immediately showing them
  const [apiErrors, setApiErrors] = useState({})
  // Track active API requests to manage loading state
  const [activeRequests, setActiveRequests] = useState(0)
  // Track pending API calls to ensure they complete before showing error pages
  const pendingApiCalls = useRef(new Map())

  // Check if the user is authenticated on mount
  const checkAuthStatus = useCallback(async (force = false) => {
    // Prevent multiple simultaneous auth checks
    if (authCheckInProgress.current) {
      return
    }

    // Add throttling to prevent excessive checks
    const now = Date.now()
    if (!force && now - lastAuthCheck.current < 2000) {
      return
    }

    authCheckInProgress.current = true
    lastAuthCheck.current = now

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
        // Only set isAuthenticated to true if we actually have user data
        if (data) {
          setUser(data)
          setIsAuthenticated(true)
          clearApiError("auth")
        } else {
          // If no user data despite OK response, treat as not authenticated
          setUser(null)
          setIsAuthenticated(false)
        }
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error("Auth check failed:", error)
      setUser(null)
      setIsAuthenticated(false)
    } finally {
      decrementActiveRequests()
      authCheckInProgress.current = false
    }
  }, [])

  // Run auth check on mount and when location changes
  useEffect(() => {
    checkAuthStatus(true)

    // Add listener for location changes to check auth after redirects
    const handleLocationChange = () => {
      // Force auth check after navigation
      checkAuthStatus(true)
    }

    window.addEventListener("popstate", handleLocationChange)

    return () => {
      window.removeEventListener("popstate", handleLocationChange)
    }
  }, [checkAuthStatus])

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
  const addApiError = useCallback((url, errorType, errorDetails) => {
    if (inEndpointList(notThrowErrorEndpoint, url)) return

    // Only add the error if there are no pending API calls for this URL
    if (!pendingApiCalls.current.has(url)) {
      setApiErrors((prev) => ({
        ...prev,
        [errorType]: errorDetails
      }))
    }
  }, [])

  // Clear a specific error
  const clearApiError = useCallback((errorType) => {
    setApiErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[errorType]
      return newErrors
    })
  }, [])

  const logout = async (redirect = true) => {
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
      // Set authentication state to false first to ensure UI updates immediately
      setIsAuthenticated(false)
      setUser(null)
      decrementActiveRequests()
      clearApiError("auth")

      // If redirect is true, navigate to login page
      if (redirect) {
        window.location.href = "/login"
      }
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
      .then(async (response) => {
        if (!response.ok) {
          // If token rotation fails, user is no longer authenticated
          setIsAuthenticated(false)
          setUser(null)
          return response.status
        }
        // After successful token rotation, update auth status
        await checkAuthStatus(true)
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
    // Generate a unique request ID for tracking this API call
    const requestId = `${url}-${Date.now()}`

    // Register this API call as pending
    pendingApiCalls.current.set(requestId, true)

    // Check if this endpoint requires authentication
    const requiresAuth = !inEndpointList(guestEndpoints, url) && !inEndpointList(notThrowErrorEndpoint, url)

    // If we're authenticated but have no user data, that's inconsistent - fix it
    if (isAuthenticated && !user && url !== ENDPOINTS.GET_INFOR) {
      await checkAuthStatus(true)
    }

    // If auth is required but we're not sure about auth status, check it first
    if (requiresAuth && !isAuthenticated && url !== ENDPOINTS.GET_INFOR) {
      // Only check auth status if we're not already checking
      if (!authCheckInProgress.current) {
        await checkAuthStatus(true)
      }
    }

    // Continue with the API call regardless of auth status

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

      // For debugging purposes only
      // const responseClone = response.clone()
      // responseClone.text().then((text) => console.log(url, text))

      // Handle token refresh if needed
      if (response.status === 401 && !inEndpointList(notCallRotateTokenEndpoints, url)) {
        const refreshStatus = await refreshAccessToken()

        if (refreshStatus === 200) {
          // Retry the original request after token refresh
          response = await fetch(url, options)
        } else if (refreshStatus !== 400 && refreshStatus !== 500) {
          // Handle different error statuses
          pendingApiCalls.current.delete(requestId)
          addApiError(url, "auth", { status: refreshStatus })
          return new Response(JSON.stringify({ error: "Authentication failed" }), { status: refreshStatus })
        }
      }

      // Handle other error statuses
      if (!response.ok) {
        const errorKey = `${url.split("?")[0]}-${response.status}`

        if (response.status === 401) {
          setIsAuthenticated(false)
          setUser(null)

          // Only add the error if this endpoint should trigger errors
          if (!inEndpointList(notThrowErrorEndpoint, url)) {
            // Wait a small delay to ensure the response is fully processed
            setTimeout(() => {
              pendingApiCalls.current.delete(requestId)
              addApiError(url, "auth", { status: 401 })
            }, 100)
          } else {
            pendingApiCalls.current.delete(requestId)
          }
        } else if (response.status === 400 || response.status === 500) {
          pendingApiCalls.current.delete(requestId)
          let errorMessage = "Bad request. Waring when call api: " + url
          console.warn(errorMessage)
        } else if (!inEndpointList(notThrowErrorEndpoint, url)) {
          // Wait a small delay to ensure the response is fully processed
          setTimeout(() => {
            pendingApiCalls.current.delete(requestId)
            addApiError(url, errorKey, { status: response.status })
          }, 100)
        } else {
          pendingApiCalls.current.delete(requestId)
        }
      } else {
        // Clear errors for this URL on success
        pendingApiCalls.current.delete(requestId)
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
      pendingApiCalls.current.delete(requestId)

      // if (!inEndpointList(notThrowErrorEndpoint, url)) {
      //   addApiError(url, "network", { status: 500 })
      // }
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
    // if (Object.values(apiErrors).some((err) => err.status === 500)) return "500"
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
      default:
        return <GeneralError />
    }
  }

  // Only show error page if there's an error, it's not from a notThrowErrorEndpoint,
  // and there are no pending API calls
  const shouldShowErrorPage = () => {
    const hasError = Object.keys(apiErrors).length > 0
    const isFromNoThrowEndpoint = Object.keys(apiErrors).some((key) => {
      const baseUrl = key.split("-")[0]
      return inEndpointList(notThrowErrorEndpoint, baseUrl)
    })
    const hasPendingCalls = pendingApiCalls.current.size > 0

    return hasError && !isFromNoThrowEndpoint && !hasPendingCalls
  }

  // Add a login function to ensure both states are set properly:
  const loginGoogle = async (credentials) => {
    try {
      incrementActiveRequests()
      const response = await fetch(ENDPOINTS.LOGIN_GOOGLE + "?token=" + credentials, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5174",
          "Access-Control-Allow-Credentials": "true"
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        // After successful login, immediately check auth status to get user data
        await checkAuthStatus(true)
        return { success: true }
      } else {
        return { success: false, error: await response.json() }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error }
    } finally {
      decrementActiveRequests()
    }
  }

  const loginGithub = async (credentials) => {
    try {
      incrementActiveRequests()
      const response = await fetch(ENDPOINTS.LOGIN_GITHUB + "?code=" + credentials, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5174",
          "Access-Control-Allow-Credentials": "true"
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        // After successful login, immediately check auth status to get user data
        await checkAuthStatus(true)
        return { success: true }
      } else {
        return { success: false, error: await response.json() }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error }
    } finally {
      decrementActiveRequests()
    }
  }

  const login = async (credentials) => {
    try {
      incrementActiveRequests()
      const response = await fetch(ENDPOINTS.POST_LOGIN, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "http://localhost:5174",
          "Access-Control-Allow-Credentials": "true"
        },
        body: JSON.stringify(credentials)
      })

      if (response.ok) {
        // After successful login, immediately check auth status to get user data
        await checkAuthStatus(true)
        return { success: true }
      } else {
        return { success: false, error: await response.json() }
      }
    } catch (error) {
      console.error("Login failed:", error)
      return { success: false, error }
    } finally {
      decrementActiveRequests()
    }
  }

  return (
    <AuthContext.Provider
      value={{
        apiCall,
        login,
        loginGoogle,
        loginGithub,
        logout,
        isAuthenticated,
        user,
        loading: activeRequests > 0,
        setIsAuthenticated,
        refreshAuth: () => checkAuthStatus(true),
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

