"use client"

import React, { useEffect, ReactDOM } from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import LoadingScreen from "@/components/common/shared/other/loading"
import { useLocation, useNavigate } from "react-router-dom"
import { LOGO } from "@/lib/constants"
import { MESSAGES } from "@/lib/messages"

import { loginWithGithub, loginWithGoogle } from "@/lib/api/auth_api"
import { useAuth } from "@/providers/AuthProvider"
import { toast } from "sonner"
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google"
import GitHubLogin from "react-github-login"
export default function LoginPage() {
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  })

  const { isAuthenticated, setIsAuthenticated, login, loginGoogle, loginGithub } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = location.state?.redirectPath || "/"
      navigate(redirectPath, { replace: true })
    }
    setLoading(false)
  }, [isAuthenticated, location, navigate])

  useEffect(() => {
    if (location.state?.sendEmail) {
      toast.success("Sent link", {
        description: "Password reset link has been sent to your email."
      })
    }

    if (location.state?.resetSuccess) {
      toast.success("Reset password", {
        description: "Your password has been reset successfully. You can now log in with your new password."
      })
    }

    if (location.state?.loginRequire) {
      toast.warning("Login Required", {
        description: "You need to be logged in to continue."
      })
    }
  }, [location])

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }))

    if (errors[id]) {
      setErrors((prev) => ({
        ...prev,
        [id]: undefined
      }))
    }
  }

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      const newErrors = {}

      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

      if (!emailRegex.test(formData.username)) {
        newErrors.username = "Please enter a valid email"
      }

      if (formData.username.trim().length === 0) {
        newErrors.username = MESSAGES["MSG02"].content
      }

      if (formData.password.trim().length === 0) {
        newErrors.password = MESSAGES["MSG02"].content
      }

      // if (formData.password.length < 6) {
      //   newErrors.password = "Password must be at least 6 characters"
      // }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
      } else {
        const result = await login(formData)
        if (!result.status) {
          if (result.error) {
            newErrors.general = result.error.message
          }
        } else {
          setIsAuthenticated(true)
          const redirectPath = location.state?.redirectPath || "/"
          navigate(redirectPath)
        }
        setErrors(newErrors)
      }
    } catch (error) {
      // Handle any other errors
      if (!errors.general && !Object.keys(errors).length) {
        setErrors({ general: error.message })
      }
    } finally {
      setLoading(false)
    }
  }


  async function handleLoginGoogle(token) {
    loginGoogle(token);
  }

  async function handleLoginGithub(code) {
    loginGithub(code)
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {loading && <LoadingScreen loadingText="Loading..." />}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-bg-card">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <LOGO className="size-8" />
            </div>
            Kodeholik.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6")} onSubmit={handleLoginSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-input-text">Login to your account</h1>
                {errors.general && <p className="text-sm font-medium text-text-error">{errors.general}</p>}
              </div>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="username" className={cn("text-input-text", errors.username && "text-text-error")}>
                    Email
                  </Label>
                  <Input
                    className={cn(
                      "border-input-border focus:border-input-borderFocus placeholder-input-placeholder text-input-text",
                      errors.username && "border-border-error focus:border-destructive"
                    )}
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="m@example.com"
                    disabled={loading}
                  />
                  {errors.username && <p className="text-sm font-medium text-text-error">{errors.username}</p>}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className={cn("text-input-text", errors.password && "text-text-error")}>
                      Password
                    </Label>
                  </div>
                  <Input
                    className={cn(
                      "border-input-border focus:border-input-borderFocus placeholder-input-placeholder text-input-text",
                      errors.password && "border-border-error focus:border-destructive"
                    )}
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    disabled={loading}
                  />
                  {errors.password && <p className="text-sm font-medium text-text-error">{errors.password}</p>}
                </div>
                <a href="/forgot" className="ml-auto text-sm underline-offset-4 hover:underline text-primary">
                  Forgot password?
                </a>
                <Button type="submit" className="w-full bg-button-primary hover:bg-button-hover">
                  Login
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-bg-card px-2 text-input-text">Or continue with</span>
                </div>
                <div className="flex ">
                  
                  <GoogleOAuthProvider clientId="873651389602-g3egfh8nipch5dad289s114sge0769n0.apps.googleusercontent.com">
                    <GoogleLogin
                      onSuccess={credentialResponse => {
                        handleLoginGoogle(credentialResponse.credential);
                      }}
                      onError={() => {
                        console.log('Login Failed');
                      }}
                    >
        
                    </GoogleLogin>
                    
                  </GoogleOAuthProvider>

                  <Button type="button" variant="outline" style={{height: '42px'}} className="w-full ml-2">
                    <GitHubLogin clientId="Ov23liJomhkV4CiiBVoq" redirectUri="http://localhost:5174/login/github"
                      onSuccess={credentialResponse => {
                        handleLoginGithub(credentialResponse.code);
                      }}
                      onFailure={() => {
                        console.log('Login Failed');
                      }
                      } className="w-full flex justify-center" >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M12 2C6.48 2 2 6.48 2 12C2 16.42 5.17 20.17 9.25 21.44C9.75 21.54 9.91 21.27 9.91 21.04C9.91 20.84 9.9 20.22 9.9 19.5C7 20.1 6.32 18.56 6.1 17.98C6 17.73 5.46 16.66 5 16.41C4.6 16.2 4.03 15.69 5 15.68C5.9 15.67 6.46 16.56 6.67 16.91C7.72 18.67 9.27 18.21 9.86 17.89C9.96 17.15 10.24 16.66 10.54 16.37C7.98 16.08 5.32 15.08 5.32 10.74C5.32 9.52 5.72 8.52 6.42 7.73C6.32 7.44 5.95 6.33 6.52 4.97C6.52 4.97 7.44 4.68 9.91 6.23C10.82 5.98 11.78 5.86 12.74 5.86C13.7 5.86 14.66 5.98 15.57 6.23C18.04 4.68 18.96 4.97 18.96 4.97C19.53 6.33 19.16 7.44 19.06 7.73C19.76 8.52 20.16 9.52 20.16 10.74C20.16 15.09 17.49 16.08 14.92 16.37C15.3 16.73 15.64 17.45 15.64 18.5C15.64 19.91 15.63 20.84 15.63 21.04C15.63 21.27 15.79 21.54 16.29 21.44C20.37 20.17 23.54 16.42 23.54 12C23.54 6.48 19.06 2 12 2Z"
                          fill="black"
                        />
                      </svg>
                    </GitHubLogin>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-bg-primary lg:block">
        <LOGO className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale" />
      </div>
    </div>
  )
}

