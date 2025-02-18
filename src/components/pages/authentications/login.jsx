import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import logo from "@/assets/images/logo/kodeholik_logo.png"
import LoadingScreen from "@/components/common/shared/loading"

export default function LoginPage() {
  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
  }

  function handleLoginGoogle() {
  }

  function handleLoginGithub() {
  }

  const [loading, setLoading] = useState(false)
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {loading && <LoadingScreen text="Loading..." />}
      <div className="flex flex-col gap-4 p-6 md:p-10 bg-bg-card">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium text-primary">
            <div className="flex h-8 w-8 items-center justify-center rounded-md">
              <img src={logo} alt="kodeholik" className="size-8" />
            </div>
            Kodeholik.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <form className={cn("flex flex-col gap-6")} onSubmit={handleLoginSubmit}>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold text-input-text">Login to your account</h1>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-input-text">Email</Label>
                  <Input className="border-input-border focus:border-input-borderFocus placeholder-input-placeholder text-input-text" id="email" type="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password" className="text-input-text">Password</Label>
                    <a
                      href="/forgot"
                      className="ml-auto text-sm underline-offset-4 hover:underline text-primary"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <Input className="border-input-border focus:border-input-borderFocus placeholder-input-placeholder text-input-text" id="password" type="password" required />
                </div>
                <Button type="submit" className="w-full bg-button-primary hover:bg-button-hover">
                  Login
                </Button>
                <div className="relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t after:border-border">
                  <span className="relative z-10 bg-bg-card px-2 text-input-text">
                    Or continue with
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Button onClick={handleLoginGoogle} variant="outline" className="w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path
                        d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                        fill="currentColor"
                      />
                    </svg>
                    <span className="sr-only">Login with Google</span>
                  </Button>
                  <Button onClick={handleLoginGithub} variant="outline" className="w-full">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.48 2 2 6.48 2 12C2 16.42 5.17 20.17 9.25 21.44C9.75 21.54 9.91 21.27 9.91 21.04C9.91 20.84 9.9 20.22 9.9 19.5C7 20.1 6.32 18.56 6.1 17.98C6 17.73 5.46 16.66 5 16.41C4.6 16.2 4.03 15.69 5 15.68C5.9 15.67 6.46 16.56 6.67 16.91C7.72 18.67 9.27 18.21 9.86 17.89C9.96 17.15 10.24 16.66 10.54 16.37C7.98 16.08 5.32 15.08 5.32 10.74C5.32 9.52 5.72 8.52 6.42 7.73C6.32 7.44 5.95 6.33 6.52 4.97C6.52 4.97 7.44 4.68 9.91 6.23C10.82 5.98 11.78 5.86 12.74 5.86C13.7 5.86 14.66 5.98 15.57 6.23C18.04 4.68 18.96 4.97 18.96 4.97C19.53 6.33 19.16 7.44 19.06 7.73C19.76 8.52 20.16 9.52 20.16 10.74C20.16 15.09 17.49 16.08 14.92 16.37C15.3 16.73 15.64 17.45 15.64 18.5C15.64 19.91 15.63 20.84 15.63 21.04C15.63 21.27 15.79 21.54 16.29 21.44C20.37 20.17 23.54 16.42 23.54 12C23.54 6.48 19.06 2 12 2Z"
                        fill="black"
                      />
                    </svg>

                    <span className="sr-only">Login with Github</span>
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-bg-primary lg:block">
        <img
          src={logo}
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}
