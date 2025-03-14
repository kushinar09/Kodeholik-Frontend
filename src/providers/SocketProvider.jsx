"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

// Create context
const SocketContext = createContext(undefined)

// WebSocket URL
const WEBSOCKET_URL = import.meta.env.VITE_WEBSOCKET_URL || "http://localhost:8080/ws"
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api"

// Create provider
export const SocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null)
  const [notifications, setNotifications] = useState([])
  const [connected, setConnected] = useState(false)

  // Initialize socket connection
  useEffect(() => {
    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/notifications`)
        if (!response.ok) throw new Error("Failed to fetch notifications")
        const data = await response.json()
        setNotifications(data)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Create and configure STOMP client
    const client = new Client({
      webSocketFactory: () => new SockJS(WEBSOCKET_URL),
      debug: (str) => {
        console.log("STOMP: " + str)
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    })

    // Handle connection
    client.onConnect = (frame) => {
      console.log("Connected to STOMP: " + frame)
      setConnected(true)

      // Subscribe to notifications topic
      client.subscribe("/topic/notifications", (message) => {
        if (message.body) {
          const newNotification = JSON.parse(message.body)
          setNotifications((prev) => [newNotification, ...prev])
        }
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
  }, [])

  // Mark notification as read
  const markAsRead = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/notifications/${id}/mark-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
      const response = await fetch(`${API_BASE_URL}/notifications/mark-all-read`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("Failed to mark notifications as read")

      // Update local state
      setNotifications(notifications.map((n) => ({ ...n, read: true })))
    } catch (error) {
      console.error("Error marking notifications as read:", error)
    }
  }

  return (
    <SocketContext.Provider value={{ notifications, markAsRead, markAllAsRead, connected }}>
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

