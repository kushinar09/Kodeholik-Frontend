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
    const stompClient = new Client({
      webSocketFactory: () => {
        const socket = new SockJS(`http://localhost:8080/ws?token=${jwtToken}`, null, { withCredentials: true })
        socket.onopen = () => {
          if (socket._transport && socket._transport.ws) {
            socket._transport.ws.setHeader("Cookie", cookieString)
          }
        }
        return socket
      },
      debug: (str) => console.log("🛠 WebSocket Debug:", str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log("✅ Connected to WebSocket Server!")

        // ✅ Subscribe to Exam Topic
        stompClient.subscribe(`/topic/exam/${code}`, (message) => {
          console.log("📩 Exam Message Received:", message.body)
          setMessages((prev) => [...prev, message.body])
          setIsTopicCalled(true) // ✅ Mark topic as called
        })

        // ✅ Subscribe to Errors
        stompClient.subscribe(`/error/${username}`, (message) => {
          console.error("❌ Error Received:", message.body)
        })

        // ✅ Handle Disconnection Requests
        stompClient.subscribe(`/topic/disconnect/${username}`, () => {
          console.warn("⚠️ Server requested disconnect.")
          stompClient.deactivate()
        })

        // stompClient.publish({
        //   destination: "/app/exam/submit/" + code,
        //   body: JSON.stringify(
        //     [
        //       {
        //         "problemLink": "edit-distance-1",
        //         "code": "public static int solve(int i, int j, String s1, String s2, int[][] dp) { \n if (i == -1) return j + 1; \n if (j == -1) return i + 1; \n if (dp[i][j] != -1) return dp[i][j]; \n if (s1.charAt(i) == s2.charAt(j)) { \n return dp[i][j] = solve(i - 1, j - 1, s1, s2, dp); \n } else { \n int insert = 1 + solve(i, j - 1, s1, s2, dp); \n int replace = 1 + solve(i - 1, j - 1, s1, s2, dp); \n int delete = 1 + solve(i - 1, j, s1, s2, dp); \n return dp[i][j] = Math.min(insert, Math.min(replace, delete)); \n } \n } \n public static int minDistance(String word1, String word2) { \n int m = word1.length(), n = word2.length(); \n int[][] dp = new int[m + 1][n + 1]; \n for (int[] row : dp) Arrays.fill(row, -1); \n 0; \n }",
        //         "languageName": "Java"
        //       },
        //       {
        //         "problemLink": "palindrome-number",
        //         "code": "public static boolean isPalindrome(int x) { \n if (x < 0) { \n return false; \n } \n int reverse = 0; \n int xcopy = x; \n while (x > 0) { \n reverse = (reverse * 10) + (x % 10); \n x /= 10; \n } \n return true; \n }",
        //         "languageName": "Java"
        //       },
        //       {
        //         "problemLink": "gas-station",
        //         "code": "public static int canCompleteCircuit(int[] gas, int[] cost) { \n int len = gas.length; \n int[] diff = new int[len]; \n int to = 0; \n for(int i = 0;i < len;i++){ \n diff[i] += (gas[i]-cost[i]); \n to += diff[i]; \n } \n if(to < 0){ \n return -1; \n } \n int index = 0; \n to = 0; \n for(int i = 0;i < len;i++){ \n to += diff[i]; \n if(to < 0){ \n index = i+1; \n to = 0; \n } \n } \n return index; \n }",
        //         "languageName": "Java"
        //       }
        //     ]
        //   )
        // })


        // ✅ Auto-check if topic was called after 10 seconds
        setTimeout(() => {
          if (!isTopicCalled) {
            console.warn("⚠️ Warning: No messages received from `/topic/exam/${code}` yet.")
          }
        }, 10000)
      },
      onStompError: (frame) => console.error("❌ STOMP Error:", frame)
    })

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