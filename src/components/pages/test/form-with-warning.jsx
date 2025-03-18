"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

export default function FormWithWarning() {
  const [formData, setFormData] = useState({
    title: "",
    description: ""
  })
  const [initialFormData, setInitialFormData] = useState({
    title: "",
    description: ""
  })
  const [isDirty, setIsDirty] = useState(false)

  // Check if form is dirty (has unsaved changes)
  useEffect(() => {
    const isFormDirty = formData.title !== initialFormData.title || formData.description !== initialFormData.description

    setIsDirty(isFormDirty)
  }, [formData, initialFormData])

  // Add beforeunload event listener when form is dirty
  useEffect(() => {
    if (!isDirty) return

    function handleBeforeUnload(e) {
      // This will trigger the browser's default "Leave Site?" dialog
      e.preventDefault()

      // Some browsers require returnValue to be set
      e.returnValue = ""
    }

    window.addEventListener("beforeunload", handleBeforeUnload)

    // Clean up the event listener
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [isDirty])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save the form data
    console.log("Form submitted:", formData)
    // Update the initial form data to match current data
    setInitialFormData({ ...formData })
    // Form is no longer dirty after saving
    setIsDirty(false)
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Edit Post</CardTitle>
        <CardDescription>
          Make changes to your post. Navigating away will prompt a warning if you have unsaved changes.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter post title"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Enter post description"
              rows={4}
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">{isDirty && "You have unsaved changes"}</div>
          <Button type="submit">Save Changes</Button>
        </CardFooter>
      </form>
    </Card>
  )
}

