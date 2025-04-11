"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Pencil } from "lucide-react"

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
      setProfile((prev) => ({ ...prev, avatarFile: file }))
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
        setProfile((prev) => ({ ...prev, avatarFile: file }))
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
      <DialogContent className="sm:max-w-[1025px] w-fit">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">
            <div className="flex gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
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
                  className="max-w-[150px] aspect-square rounded-full border border-gray-700 overflow-hidden flex flex-col items-center justify-center relative group"
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                >
                  {imagePreview ? (
                    <>
                      {/* Image container with fixed aspect ratio */}
                      <div className="w-full h-full">
                        <img
                          loading="lazy"
                          src={imagePreview || "/placeholder.svg"}
                          alt="Course preview"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* Hover overlay - only visible on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-white/80 hover:bg-white shadow-md"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div
                      className="flex flex-col items-center justify-center h-full w-full p-6 cursor-pointer rounded-lg"
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
              <div className="flex flex-col">
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
                <div className="grid grid-cols-4 items-center gap-4 mt-4">
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
                <div className="grid grid-cols-4 items-center gap-4 mt-4">
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
                <div className="mt-4 flex justify-end">
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
