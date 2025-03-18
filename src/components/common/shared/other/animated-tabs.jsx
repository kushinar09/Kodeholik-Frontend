"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs as ShadcnTabs, TabsContent as ShadcnTabsContent } from "@/components/ui/tabs"

export function AnimatedTabs({ children, ...props }) {
  return <ShadcnTabs {...props}>{children}</ShadcnTabs>
}

export function AnimatedTabsContent({ children, value, ...props }) {
  const [mounted, setMounted] = useState(false)
  const ref = useRef(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setMounted(true)

    // Add a small delay to ensure the animation is visible
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 50)

    return () => {
      clearTimeout(timer)
      setMounted(false)
    }
  }, [])

  if (!mounted) return null

  return (
    <ShadcnTabsContent
      ref={ref}
      value={value}
      {...props}
      className={`transition-all duration-50 ease-in-out ${isVisible ? "opacity-100" : "opacity-0"} ${props.className || ""}`}
      style={{
        ...props.style
      }}
    >
      {children}
    </ShadcnTabsContent>
  )
}

