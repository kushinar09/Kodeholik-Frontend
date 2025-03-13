import useWebSocket from "@/lib/socket/useWebSocket"
import React, { useState } from "react"

const SERVER_URL = "http://localhost:8080/ws"
const JWT_TOKEN = "eyJhbGciOiJIUzM4NCJ9.eyJzdWIiOiJtYXN0IiwiaWF0IjoxNzQxMjY3NTY1LCJleHAiOjE3NDEyODI1NjV9.HKUJ8PE9jTTyQOYl7Vx7Zj9sJEqT8CKWSSCfGYV3X00TVKcuWqsv-N0kl3L0gMTF";


export default function SocketComponent() {
  const { stompClient, isConnected, messages } = useWebSocket(SERVER_URL, JWT_TOKEN)
  const [input, setInput] = useState("")

  const sendMessage = () => {
    if (stompClient && isConnected) {
      stompClient.publish({
        destination: "/app/sendMessage",
        body: JSON.stringify({ content: input })
      })
      setInput("")
    } else {
      alert("❌ Không thể gửi tin nhắn, mất kết nối WebSocket!")
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
      <h2>📡 WebSocket Chat</h2>
      <p>Status: {isConnected ? "🟢 Đã kết nối" : "🔴 Mất kết nối"}</p>

      <div style={{ border: "1px solid #ccc", padding: "10px", minHeight: "200px" }}>
        <h3>Tin nhắn nhận được:</h3>
        {messages.length > 0 ? (
          messages.map((msg, index) => <p key={index}>📩 {msg.content}</p>)
        ) : (
          <p>Chưa có tin nhắn nào...</p>
        )}
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Nhập tin nhắn..."
        style={{ width: "80%", padding: "5px", marginTop: "10px" }}
      />
      <button onClick={sendMessage} style={{ padding: "5px", marginLeft: "5px" }}>Gửi</button>
    </div>
  )
}

