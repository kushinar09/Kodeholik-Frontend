"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"
import { ENDPOINTS } from "@/lib/constants"
import { useAuth } from "./AuthProvider"
import { toast } from "sonner"

// Create context
const SocketContext = createContext(undefined)

// Create provider
export const SocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [connected, setConnected] = useState(false)
  const { apiCall, user, isAuthenticated } = useAuth()

  const [notiToken, setNotiToken] = useState(null)

  // Fetch notification token
  useEffect(() => {
    const fetchNotificationToken = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_NOTIFICATIONS_TOKEN)
        if (!response.ok) throw new Error("Failed to fetch notification token")
        const token = await response.text()
        setNotiToken(token)
      } catch (error) {
        console.error("Error fetching notification token:", error)
      }
    }

    fetchNotificationToken()
  }, [])

  // Initialize socket connection
  useEffect(() => {
    // console.log("isAuthenticated", isAuthenticated)
    if (!isAuthenticated || !notiToken) return

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await apiCall(ENDPOINTS.GET_NOTIFICATIONS + "?page=0")
        if (!response.ok) throw new Error("Failed to fetch notifications")

        // Handle empty response
        const text = await response.text()
        if (!text || text.trim() === "") {
          setNotifications([])
          return
        }

        const data = JSON.parse(text).content
        setNotifications(data)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Create and configure STOMP client
    const client = new Client({
      webSocketFactory: () =>
        new SockJS(ENDPOINTS.WEBSOCKET_NOTIFICATION.replace(":token", notiToken), null, { withCredentials: true }),
      debug: (str) => {
        // console.log("STOMP: " + str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000
    })

    // Handle connection
    client.onConnect = (frame) => {
      // console.log("✅ Connection successful!")
      setConnected(true)

      client.subscribe("/notification/" + user.username, (message) => {
        // console.log("📩 Received message:", message.body)

        try {
          const notification = JSON.parse(message.body)
          // console.log("Received notification:", notification)
          // Add to notifications state
          setNotifications((prev) => [notification, ...prev])
          // Show toast notification
          toast(notification.content, {
            description: notification.date,
            action: notification.link && notification.link !== ""
              ? {
                label: "View",
                onClick: () => (window.location.href = notification.link)
              }
              : undefined
          })
        } catch (error) {
          console.error("Error parsing notification:", error)
        }
      })

      client.subscribe("/topic/disconnect/" + user.username, (message) => {
        console.error("Disconnect:", message.body)
        client.deactivate()
        setConnected(false)
      })
    }

    // Handle errors
    client.onStompError = (frame) => {
      console.error("STOMP error: " + frame.headers["message"])
      console.error("Additional details: " + frame.body)
      setConnected(false)
    }

    // Activate the client
    client.activate()
    setStompClient(client)

    // Clean up on unmount
    return () => {
      if (client.active) {
        client.deactivate()
      }
    }
  }, [isAuthenticated])

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await apiCall(`${ENDPOINTS.MARK_NOTIFICATION_READ}/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) throw new Error("Failed to mark notification as read")

      // Update local state
      setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      const response = await apiCall(ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        }
      })

      if (!response.ok) throw new Error("Failed to mark notifications as read")

      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  return (
    <SocketContext.Provider
      value={{
        notifications,
        connected,
        markAsRead,
        markAllAsRead
      }}
    >
      {children}
    </SocketContext.Provider>
  )
}

// Custom hook to use the socket context
export const useSocket = () => {
  const context = useContext(SocketContext)
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider")
  }
  return context
}
