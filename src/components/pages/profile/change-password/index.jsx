"use client"

import { useEffect, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormControl } from "@/components/ui/form"
import { Upload, X } from "lucide-react"

export function ChangePasswordDialog({ open, onOpenChange, onSubmit }) {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

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
            <DialogContent className="sm:max-w-[565px]">
                <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-1 gap-6 ">
                        <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="oldPassword" className="text-right">
                                    Old Password
                                </Label>
                                <Input
                                    id="oldPassword"
                                    name="oldPassword"
                                    type="password"
                                    value={form.oldPassword}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    required
                                    minLength={1}
                                    maxLength={200}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                <Label htmlFor="newPassword" className="text-right">
                                    New Password
                                </Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    name="newPassword"
                                    required
                                    value={form.newPassword}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    minLength={1}
                                    maxLength={200}
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4 mt-2">
                                <Label htmlFor="confirmPassword" className="text-right">
                                    Confirm Password
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    value={form.confirmPassword}
                                    onChange={handleChange}
                                    className="col-span-3"
                                    required
                                    minLength={1}
                                    maxLength={200}
                                />
                            </div>
                            <div className="mt-8 flex justify-end">
                                <Button type="submit">Save</Button>

                            </div>
                        </div>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
