import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import "./index.css"
import App from "./App.jsx"
import { LoginForm } from "./components/login-form"

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <LoginForm />
  </StrictMode>
)
