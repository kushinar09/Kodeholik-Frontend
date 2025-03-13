import { useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

const useWebSocket = (url, jwtToken) => {
  const [stompClient, setStompClient] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [messages, setMessages] = useState([])

  useEffect(() => {
    let client = new Client({
      webSocketFactory: () => new SockJS(`${url}?token=${jwtToken}`, null, { withCredentials: true }),
      debug: (str) => console.log(str),
      reconnectDelay: 5000, // Thử kết nối lại sau 5 giây
      onConnect: () => {
        console.log("✅ Kết nối WebSocket thành công!")
        setIsConnected(true)

        // Đăng ký nhận tin nhắn từ server
        client.subscribe("/topic/messages", (message) => {
          setMessages((prev) => [...prev, JSON.parse(message.body)])
        })
      },
      onDisconnect: () => {
        console.warn("❌ Mất kết nối WebSocket!")
        setIsConnected(false)
      },
      onWebSocketClose: () => {
        console.warn("⚠️ Kết nối WebSocket bị đóng!")
        setIsConnected(false)
        client.activate() // Tự động kết nối lại
      }
    })

    client.activate() // Kích hoạt WebSocket
    setStompClient(client)

    return () => {
      if (client) client.deactivate()
    }
  }, [url, jwtToken])

  // Kiểm tra kết nối định kỳ mỗi 10 giây
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isConnected) {
        console.warn("🔴 Mất kết nối WebSocket, thử kết nối lại...")
        stompClient?.activate()
      }
    }, 10000)
    return () => clearInterval(interval)
  }, [isConnected, stompClient])

  // Cảnh báo khi rời trang
  useEffect(() => {
    const handleBeforeUnload = (event) => {
      event.preventDefault()
      event.returnValue = "Bạn có chắc chắn muốn rời khỏi trang? Kết nối sẽ bị mất!"
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => window.removeEventListener("beforeunload", handleBeforeUnload)
  }, [])

  // Xử lý khi mất mạng
  useEffect(() => {
    const handleOffline = () => {
      alert("⚠️ Bạn đã mất kết nối mạng!")
      setIsConnected(false)
    }

    const handleOnline = () => {
      console.log("🔄 Kết nối mạng đã phục hồi, thử kết nối lại...")
      stompClient?.activate()
    }

    window.addEventListener("offline", handleOffline)
    window.addEventListener("online", handleOnline)

    return () => {
      window.removeEventListener("offline", handleOffline)
      window.removeEventListener("online", handleOnline)
    }
  }, [stompClient])

  return { stompClient, isConnected, messages }
}

export default useWebSocket
