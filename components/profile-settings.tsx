"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"
import { getCurrentUser, requestPasswordReset, updateCommerceProfile } from "@/lib/client-commerce"

export function ProfileSettings() {
  const { toast } = useToast()
  const [formData, setFormData] = useState({ firstName: "", lastName: "", email: "", phone: "" })
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)

  useEffect(() => {
    const user = getCurrentUser()
    if (user) setFormData(user)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const current = getCurrentUser()
    if (!current) return
    try {
      await updateCommerceProfile({ ...current, ...formData })
      toast({ title: "Profile updated", description: "Your profile details were saved to Supabase." })
    } catch (error) {
      toast({ title: "Profile update failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
    }
  }

  const updatePassword = async () => {
    const current = getCurrentUser()
    if (!current) return
    setIsPasswordSaving(true)
    try {
      await requestPasswordReset(current.email, `${window.location.origin}/login`)
      toast({ title: "Reset email sent", description: "Check your inbox for the password reset link." })
    } catch (error) {
      toast({ title: "Reset email failed", description: error instanceof Error ? error.message : "Please try again.", variant: "destructive" })
    } finally {
      setIsPasswordSaving(false)
    }
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
      <div className="mt-10 rounded-lg border p-4 sm:p-6">
        <h3 className="font-serif text-xl font-semibold">Reset Password</h3>
        <p className="mt-1 text-sm text-muted-foreground">Send a secure password reset link to your account email.</p>
        <Button type="button" onClick={updatePassword} disabled={isPasswordSaving} className="mt-4 h-12 px-8">{isPasswordSaving ? "Sending..." : "Send Reset Email"}</Button>
      </div>
    </div>
  )
}
