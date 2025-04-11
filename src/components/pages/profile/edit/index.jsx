"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, X } from "lucide-react"

export function EditProfileDialog({ open, onOpenChange, onSubmit, profile, setProfile }) {
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(profile.avatarImg)
  const [errorImage, setErrorImage] = useState(false)
  const fileInputRef = useRef(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(imageFile)

    onSubmit(profile)
  }

  useEffect(() => {
    setImagePreview(profile.avatarImg)
  }, [profile.avatarImg])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setErrorImage(false)
      setImageFile(file)
      setProfile((prev) => ({ ...prev, "avatarFile": file }))
      const reader = new FileReader()
      reader.onload = () => {
        setImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      if (file.type.startsWith("image/")) {
        setImageFile(file)
        setProfile((prev) => ({ ...prev, "avatarFile": file }))
        const reader = new FileReader()
        reader.onload = () => {
          setImagePreview(reader.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1025px]">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div className="space-y-4 md:col-span-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className={`text-sm font-medium ${!errorImage ? "text-black" : "text-red-500"}`}>Avatar</h4>
                  <input
                    type="file"
                    id="imageUpload"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <div
                  style={{ marginTop: "12px" }}
                  className="w-full aspect-video rounded-lg border border-gray-700 overflow-hidden flex flex-col items-center justify-center relative"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <>
                      {/* Image container with fixed aspect ratio */}
                      <div className="w-full h-full">
                        <img
                          src={imagePreview || "/placeholder.svg"}
                          alt="Course preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Semi-transparent overlay for better button visibility */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

                      {/* Control buttons - now with z-index and better positioning */}
                      <div className="absolute top-2 right-2 flex gap-2 z-10">
                        <Button
                          type="button"
                          size="icon"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/80 hover:bg-white shadow-md"
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          size="icon"
                          variant="destructive"
                          onClick={() => {
                            setImageFile(null)
                            setImagePreview(null)
                          }}
                          className="shadow-md"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* File info with better visibility */}
                      {imageFile && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-xs text-white p-2 truncate z-10">
                          {imageFile.name} ({(imageFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </div>
                      )}
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center h-48 w-full p-6 cursor-pointer border border-dashed border-gray-300 rounded-lg"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Upload className="h-8 w-8 text-black mb-4" />
                      <p className="text-black text-center">
                        Drag and drop an image here
                        <br />
                        or click to browse
                      </p>
                      <Button type="button" variant="outline" size="sm" className="mt-4">
                        Select Image
                      </Button>
                    </div>
                  )}
                </div>
                <div className={`text-red-500 font-medium ${errorImage ? "block" : "hidden"}`}>
                                    Please select an avatar for this user
                </div>
              </div>
              <div className="md:col-span-1">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Username
                  </Label>
                  <Input
                    id="username"
                    disabled
                    name="username"
                    value={profile.username}
                    onChange={handleChange}
                    className="col-span-3"
                    minLength={1}
                    maxLength={200}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-8">
                  <Label htmlFor="email" className="text-right">
                    Email
                  </Label>
                  <Input
                    id="email"
                    disabled
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                    minLength={1}
                    maxLength={200}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4 mt-8">
                  <Label htmlFor="fullname" className="text-right">
                    Full Name
                  </Label>
                  <Input
                    id="fullname"
                    name="fullname"
                    value={profile.fullname}
                    onChange={handleChange}
                    className="col-span-3"
                    required
                    minLength={1}
                    maxLength={200}
                  />
                </div>
                <div className="mt-8 flex justify-end">
                  <Button type="submit">Edit</Button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
