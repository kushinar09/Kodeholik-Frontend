"use client"
import { createContext, useContext, useState, useEffect, useRef } from "react"
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
  const [endTime, setEndTime] = useState(null)
  const [error, setError] = useState(null)
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const [problems, setProblems] = useState([])
  const reconnectingRef = useRef(false)

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
  const connectSocket = (tokenValue, codeValue, usernameValue) => {
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
        reconnectingRef.current = false
        console.log("✅ Connected to WebSocket Exam")

        // Subscribe to exam topic
        client.subscribe(`/topic/exam/${codeValue}`, (message) => {
          try {
            const examData = JSON.parse(message.body)
            console.log("📩 Received exam data:", examData)
            if (examData && examData.details?.duration) {
              setExamData(examData)
              setProblems(formatProblems(examData))
              setEndTime(examData.details.endTime)

              // Store data in localStorage for reconnection
              localStorage.setItem(
                "tempData",
                JSON.stringify({
                  token: tokenValue,
                  code: codeValue,
                  username: usernameValue,
                  problems: formatProblems(examData),
                  endTime: examData.details.endTime
                })
              )
            }
          } catch (err) {
            console.error("Error parsing exam data:", err)
          }
        })

        // Subscribe to error topic
        if (usernameValue) {
          client.subscribe(`/error/${usernameValue}`, (message) => {
            try {
              console.log("error", message.body)
              const errorData = JSON.parse(message.body)
              toast.error(errorData.message || "An error occurred")
              console.error("Received error:", errorData)
            } catch (err) {
              console.error("Error parsing error message:", err)
            }
          })
        }
      }

      client.onStompError = (frame) => {
        console.error("STOMP error", frame)
        setError({ type: "socket", message: "Socket connection error" })
        setIsConnected(false)
        handleReconnect(tokenValue, codeValue, usernameValue)
      }

      client.onWebSocketError = (event) => {
        console.error("WebSocket error", event)
        setError({ type: "socket", message: "WebSocket connection error" })
        setIsConnected(false)
        handleReconnect(tokenValue, codeValue, usernameValue)
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
      handleReconnect(tokenValue, codeValue, usernameValue)
    }
  }

  // Handle reconnection with exponential backoff
  const handleReconnect = (tokenValue, codeValue, usernameValue) => {
    if (connectionAttempts < 5 && !reconnectingRef.current) {
      reconnectingRef.current = true
      const delay = Math.min(1000 * Math.pow(2, connectionAttempts), 30000)
      console.log(`Attempting to reconnect in ${delay / 1000} seconds...`)

      setTimeout(() => {
        setConnectionAttempts((prev) => prev + 1)
        connectSocket(tokenValue, codeValue, usernameValue)
      }, delay)
    } else {
      console.error("Max reconnection attempts reached")
      setError({
        type: "connection",
        message: "Failed to establish connection after multiple attempts. Please refresh the page."
      })
      reconnectingRef.current = false
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

  // Effect to handle page reload and reconnection
  useEffect(() => {
    // Check if we have stored data from a previous session
    const storedData = localStorage.getItem("tempData")

    if (storedData) {
      try {
        const parsedData = JSON.parse(storedData)
        console.log("Found stored exam data:", parsedData)

        // Set the stored values
        if (parsedData.token) setToken(parsedData.token)
        if (parsedData.code) setExamCode(parsedData.code)
        if (parsedData.username) setUsername(parsedData.username)
        if (parsedData.problems) setProblems(parsedData.problems)
        if (parsedData.endTime) setEndTime(parsedData.endTime)

        // Reconnect to socket with stored credentials
        if (parsedData.token && parsedData.code && parsedData.username) {
          console.log("Reconnecting with stored credentials")
          connectSocket(parsedData.token, parsedData.code, parsedData.username)
        }
      } catch (err) {
        console.error("Error parsing stored exam data:", err)
      }
    }

    return () => {
      disconnectSocket()
    }
  }, [])

  // Format exam problems data
  const formatProblems = (examData) => {
    if (!examData || !examData.details || !examData.details.problems) return []

    return examData.details.problems.map((problem, index) => ({
      id: index,
      title: problem.problemTitle,
      link: problem.problemLink,
      description: problem.problemDescription,
      compileInfo: problem.compileInformation
    }))
  }

  // Function to submit exam answers
  const submitExamAnswers = (idExam, problemAnswers) => {
    console.log("Submit exam answers", idExam, problemAnswers)
    if (!stompClient || !isConnected) {
      toast.error("Not connected to exam server")
      return false
    }

    try {
      stompClient.publish({
        destination: `/app/exam/submit/${idExam}`,
        body: JSON.stringify(problemAnswers)
      })
      console.log("📤 Đã gửi yêu cầu bắt đầu bài thi.")

      // Clear localStorage after submission
      localStorage.removeItem("tempData")
      localStorage.removeItem("tempCode")

      return true
    } catch (error) {
      console.error("Error submitting exam answers:", error)
      toast.error("Failed to submit exam answers")
      return false
    }
  }

  // Add this function to the SocketExamProvider component to allow clearing localStorage
  const clearExamData = () => {
    localStorage.removeItem("tempData")
    localStorage.removeItem("tempCode")
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
    problems,
    endTime,
    fetchToken,
    connectSocket,
    disconnectSocket,
    submitExamAnswers,
    clearExamData
  }

  return <SocketExamContext.Provider value={value}>{children}</SocketExamContext.Provider>
}

