"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ChangePasswordDialog({ open, onOpenChange, onSubmit }) {
  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(form)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[565px] w-[95vw] max-w-[95vw]">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 pt-4">
            <div className="grid gap-4 sm:gap-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="oldPassword" className="text-left sm:text-right text-sm">
                  Old Password
                </Label>
                <Input
                  id="oldPassword"
                  name="oldPassword"
                  type="password"
                  value={form.oldPassword}
                  onChange={handleChange}
                  className="col-span-1 sm:col-span-3"
                  required
                  minLength={1}
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="newPassword" className="text-left sm:text-right text-sm">
                  New Password
                </Label>
                <Input
                  id="newPassword"
                  type="password"
                  name="newPassword"
                  required
                  value={form.newPassword}
                  onChange={handleChange}
                  className="col-span-1 sm:col-span-3"
                  minLength={1}
                  maxLength={200}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 items-center gap-2 sm:gap-4">
                <Label htmlFor="confirmPassword" className="text-left sm:text-right text-sm">
                  Confirm Password
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className="col-span-1 sm:col-span-3"
                  required
                  minLength={1}
                  maxLength={200}
                />
              </div>
              <div className="flex justify-end">
                <Button type="submit" size="sm">
                  Save
                </Button>
              </div>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
