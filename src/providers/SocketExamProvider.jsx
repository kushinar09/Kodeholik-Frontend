"use client"

import React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { useNavigate, useLocation } from "react-router-dom"
import { toast } from "sonner"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "./AuthProvider"

// Create context
const SocketExamContext = createContext(null)

// Custom hook to use the socket context
export const useSocketExam = () => {
  const context = useContext(SocketExamContext)
  if (!context) {
    throw new Error("useSocketExam must be used within a SocketExamProvider")
  }
  return context
}

export function SocketExamProvider({ children }) {
  const [stompClient, setStompClient] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [examData, setExamData] = useState(null)
  const [token, setToken] = useState(null)
  const [username, setUsername] = useState(null)
  const [examCode, setExamCode] = useState(null)
  const [startTime, setStartTime] = useState("")
  const [error, setError] = useState(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()

  const { apiCall } = useAuth()

  // Function to fetch token
  const fetchToken = async (examId) => {
    try {
      const response = await apiCall(ENDPOINTS.GET_TOKEN_EXAM.replace(":id", examId))
      const data = await response.json()
      if (!response.ok) {
        let newError
        // Handle error cases
        if (!data.startTime) {
          newError = { type: "late", message: data.message }
          setError(newError)
        } else {
          newError = {
            type: "early",
            message: data.message,
            startTime: data.startTime
          }
          setStartTime(data.startTime)
        }
        return { success: false, error: newError }
      }

      const result = {
        success: true,
        token: data.token,
        username: data.username,
        code: data.code,
        startTime: data.startTime
      }
      // Success case
      setToken(data.token)
      setUsername(data.username)
      setExamCode(data.code)
      setStartTime(data.startTime)
      setError(null)
      return result
    } catch (err) {
      setError({ type: "fetch", message: "Failed to fetch token" })
      console.error("Error fetching token:", err)
      return { success: false, error: { type: "fetch", message: "Failed to fetch token" } }
    }
  }

  // Connect to socket with retry mechanism
  const connectSocket = (tokenValue, codeValue) => {
    if (!tokenValue) {
      console.error("Cannot connect: No token provided")
      return
    }

    // Disconnect existing connection if any
    if (stompClient && stompClient.connected) {
      stompClient.deactivate()
    }

    try {
      const socket = new SockJS(ENDPOINTS.WEBSOCKET_EXAM.replace(":token", tokenValue))
      const client = new Client({
        webSocketFactory: () => socket,
        debug: (str) => {
          console.log("STOMP:", str)
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000
      })

      client.onConnect = () => {
        setIsConnected(true)
        setConnectionAttempts(0)
        console.log("✅ Connected to WebSocket Exam")
        // Subscribe to exam topic
        client.subscribe(`/topic/exam/${codeValue}`, (message) => {
          try {
            const examData = JSON.parse(message.body)
            setExamData(examData)
            console.log("📩 Received exam data:", examData)
          } catch (err) {
            console.error("Error parsing exam data:", err)
          }
        })

        // Subscribe to error topic
        if (username) {
          client.subscribe(`/error/${username}`, (message) => {
            try {
              const errorData = JSON.parse(message.body)
              toast.error(errorData.message || "An error occurred")
              console.error("Received error:", errorData)
            } catch (err) {
              console.error("Error parsing error message:", err)
            }
          })
        }

        // Subscribe to disconnect topic
        if (username) {
          client.subscribe(`/topic/disconnect/${username}`, (message) => {
            console.error("Disconnect:", message.body)
            client.deactivate()
            setIsConnected(false)
          })
        }
      }

      client.onStompError = (frame) => {
        console.error("STOMP error", frame)
        setError({ type: "socket", message: "Socket connection error" })
        setIsConnected(false)
        handleReconnect(tokenValue, codeValue)
      }

      client.onWebSocketError = (event) => {
        console.error("WebSocket error", event)
        setError({ type: "socket", message: "WebSocket connection error" })
        setIsConnected(false)
        handleReconnect(tokenValue, codeValue)
      }

      client.onDisconnect = () => {
        console.log("Disconnected from WebSocket")
        setIsConnected(false)
      }

      client.activate()
      setStompClient(client)
    } catch (err) {
      console.error("Error activating STOMP client:", err)
      setError({ type: "socket", message: "Failed to connect to socket" })
      handleReconnect(tokenValue, codeValue)
    }
  }

  // Handle reconnection with exponential backoff
  const handleReconnect = (tokenValue, codeValue) => {
    if (connectionAttempts < 5) {
      const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000)
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`)

      setTimeout(() => {
        setConnectionAttempts((prev) => prev + 1)
        connectSocket(tokenValue, codeValue)
      }, delay)
    } else {
      console.error("Max reconnection attempts reached")
      setError({
        type: "connection",
        message: "Failed to establish connection after multiple attempts. Please refresh the page."
      })
    }
  }

  // Disconnect socket
  const disconnectSocket = () => {
    if (stompClient) {
      try {
        if (stompClient.connected) {
          stompClient.deactivate()
        }
        setStompClient(null)
        setIsConnected(false)
        console.log("Disconnected from WebSocket")
      } catch (err) {
        console.error("Error disconnecting:", err)
      }
    }
  }

  // Effect to handle path changes and token fetching
  // useEffect(() => {
  //   const pathParts = location.pathname.split("/")
  //   if (pathParts[1] === "exam" && pathParts[2]) {
  //     const examId = pathParts[2]

  //     // If we're in the waiting room, fetch the token
  //     if (pathParts[3] === "wait") {
  //       fetchToken(examId).then((data) => {
  //         if (data && data.success && data.Token) {
  //           console.log("Token fetched successfully:", data.Token)
  //           connectSocket(data.Token)
  //         }
  //       })
  //     }
  //   }

  //   return () => {
  //     disconnectSocket()
  //   }
  // }, [location.pathname])

  // Format exam problems data
  const formatProblems = (examData) => {
    if (!examData || !examData.problems) return []

    return examData.problems.map((problem, index) => ({
      id: index,
      title: problem.problemTitle,
      description: problem.problemDescription,
      compileInfo: problem.compileInformation
    }))
  }

  // Context value
  const value = {
    isConnected,
    examData,
    token,
    username,
    examCode,
    startTime,
    error,
    problems: examData ? formatProblems(examData) : [],
    fetchToken,
    connectSocket,
    disconnectSocket
  }

  return <SocketExamContext.Provider value={value}>{children}</SocketExamContext.Provider>
}

