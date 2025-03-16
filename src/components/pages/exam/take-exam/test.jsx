import React, { useEffect, useState } from "react"
import { Client } from "@stomp/stompjs"
import SockJS from "sockjs-client"

const WebSocketComponent = () => {
  const [messages, setMessages] = useState([])
  const code = "f10b5f86-ae42-40f1-b554-abc55a1e0078"
  const username = "Phong"
  const jwtToken = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJQaG9uZyIsImlhdCI6MTc0MTk2MDA4NywiZXhwIjoxNzQxOTc1MDg3fQ.TQTbNvwTkDh8_MByQ8CCAldJn90J6w3tbkfLAi6ZUN1WVlZvFCg6kPAiNxm6KfTk"
  const notiToken = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJQaG9uZyIsImlhdCI6MTc0MTk4MTE5NCwiZXhwIjoxNzQxOTk2MTk0fQ.aqr15f2m2dco07k8MHIsC3oMmMqQUZTaB_jt3G-_NMkff3A2eiRlfh9Bj53a5NK_"
  const cookieString = "your_cookie_string"
  const [isTopicCalled, setIsTopicCalled] = useState(false)
  useEffect(() => {
    // const stompClient = new Client({
    //   webSocketFactory: () => {
    //     const socket = new SockJS(`http://localhost:8080/ws?token=${jwtToken}`, null, { withCredentials: true })
    //     socket.onopen = () => {
    //       if (socket._transport && socket._transport.ws) {
    //         socket._transport.ws.setHeader("Cookie", cookieString)
    //       }
    //     }
    //     return socket
    //   },
    //   debug: (str) => console.log("🛠 WebSocket Debug:", str),
    //   reconnectDelay: 5000,
    //   onConnect: () => {
    //     console.log("✅ Connected to WebSocket Server!")

    //     // ✅ Subscribe to Exam Topic
    //     stompClient.subscribe(`/topic/exam/${code}`, (message) => {
    //       console.log("📩 Exam Message Received:", message.body)
    //       setMessages((prev) => [...prev, message.body])
    //       setIsTopicCalled(true) // ✅ Mark topic as called
    //     })

    //     // ✅ Subscribe to Errors
    //     stompClient.subscribe(`/error/${username}`, (message) => {
    //       console.error("❌ Error Received:", message.body)
    //     })

    //     // ✅ Handle Disconnection Requests
    //     stompClient.subscribe(`/topic/disconnect/${username}`, () => {
    //       console.warn("⚠️ Server requested disconnect.")
    //       stompClient.deactivate()
    //     })

    //     // ✅ Auto-check if topic was called after 10 seconds
    //     setTimeout(() => {
    //       if (!isTopicCalled) {
    //         console.warn("⚠️ Warning: No messages received from `/topic/exam/${code}` yet.")
    //       }
    //     }, 10000)
    //   },
    //   onStompError: (frame) => console.error("❌ STOMP Error:", frame)
    // })

    const stompClient2 = new Client({
      webSocketFactory: () => {
        const socket = new SockJS("http://localhost:8080/ws/notification?token=" + notiToken, null, { withCredentials: true })


        // Gán cookie vào header của request
        socket.onopen = () => {
          socket._transport.ws.setHeader("Cookie", cookieString)
        }


        return socket
      },
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Kết nối thành công!")


        stompClient2.subscribe("/notification/" + username, (message) => {
          console.log("📩 Nhận tin nhắn:", message.body)
        })
        stompClient2.subscribe("/topic/disconnect/" + username, (message) => {
          console.error("Disconnect:", message.body)
          stompClient2.deactivate()
        })
      },
      onStompError: (frame) => console.error("❌ Lỗi STOMP:", frame)
    })


    // stompClient.activate()
    stompClient2.activate()

    return () => {
      // stompClient.deactivate()
      stompClient2.deactivate()
    }
  }, [code, username, jwtToken, cookieString])

  return (
    <div>
      <h1>WebSocket STOMP Test</h1>
      <h2>Received Messages from `/topic/exam/{code}`:</h2>
      {isTopicCalled ? (
        <ul>
          {messages.map((msg, index) => (
            <li key={index}>{msg}</li>
          ))}
        </ul>
      ) : (
        <p>❌ No messages received yet.</p>
      )}
    </div>
  )
}

export default WebSocketComponent