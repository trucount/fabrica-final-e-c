"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"
import { type CommerceUser, getCurrentUser, getUsers, safeWrite, saveCurrentUser } from "@/lib/client-commerce"

export function ProfileSettings() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" })

  useEffect(() => {
    const user = getCurrentUser()
    if (user) setFormData(user)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const current = getCurrentUser()
    if (!current) return
    const updatedUser: CommerceUser = { ...current, ...formData }
    safeWrite("commerceUsers", getUsers().map((user) => (user.id === current.id ? updatedUser : user)))
    saveCurrentUser(updatedUser)
    toast({ title: "Profile updated", description: "Your profile details were saved." })
  }

  return (
    <div className="max-w-3xl">
      <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-8">Personal Information</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2"><Label htmlFor="firstName">First Name</Label><Input id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className="h-12" /></div>
          <div className="space-y-2"><Label htmlFor="lastName">Last Name</Label><Input id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className="h-12" /></div>
        </div>
        <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="h-12" /></div>
        <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} required className="h-12" /></div>
        <div className="border-t border-border pt-8 mt-8"><Button type="submit" size="lg" className="h-12 px-8 text-base">Save Changes</Button></div>
      </form>
    </div>
  )
}
