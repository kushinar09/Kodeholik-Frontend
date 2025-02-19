"use client"

import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useNavigate, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PasswordInput } from "@/components/ui/password-input"
import { toast } from "@/hooks/use-toast"
import { ENDPOINTS } from "@/lib/constants"
import LoadingScreen from "@/components/common/shared/loading"

// Schema for password validation
const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .max(20, { message: "Password must be at most 20 characters long" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[\W_]/, { message: "Password must contain at least one special character" }),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match"
  });

export default function ResetPassword() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isValidating, setIsValidating] = useState(true)

  const searchParams = new URLSearchParams(location.search)
  const token = searchParams.get("token")

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: ""
    }
  })

  useEffect(() => {
    async function validateToken() {
      if (!token) {
        navigate("/login")
        return
      }

      try {
        const response = await fetch(ENDPOINTS.CHECK_RESET_TOKEN.replace(":token", token), {
          method: "GET",
          headers: {
            "Content-Type": "application/json"
          }
        })

        if (response.status === 401) {
          navigate("/forgot", { state: { tokenExpired: true } })
        }

        setIsValidating(false)
      } catch (error) {
        // console.error("Token validation error:", error)
        navigate("/login")
      }
    }

    validateToken()
  }, [token, navigate])

  async function onSubmit(values) {
    if (!token) return

    try {
      const response = await fetch(ENDPOINTS.RESET_PASSWORD.replace(":token", token), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: values.password
      })

      if (!response.ok) {
        throw new Error("Failed to reset password")
      }

      navigate("/login", { state: { resetSuccess: true } })
    } catch (error) {
      // console.error("Error resetting password:", error)
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      })
    }
  }

  return (
    <div className="flex h-screen pt-10 bg-bg-primary h-full w-full items-center justify-center px-4">
      {isValidating && <LoadingScreen loadingText="Sending..." />}
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>Enter your new password to reset your password.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                {/* New Password Field */}
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">New Password</FormLabel>
                      <FormControl>
                        <PasswordInput id="password" autoComplete="new-password" {...field} disabled={isValidating} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Confirm Password Field */}
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="confirmPassword">Confirm Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirmPassword"
                          autoComplete="new-password"
                          disabled={isValidating}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-button-secondary hover:bg-button-secondaryHover font-semibold"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting ? "Resetting..." : "Reset Password"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

