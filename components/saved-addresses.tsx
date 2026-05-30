"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { useToast } from "@/hooks/use-toast"
import { Plus, Edit, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { type SavedAddress, getCurrentUser, loadAddresses, persistAddresses, MAX_SAVED_ADDRESSES } from "@/lib/client-commerce"

const blankAddress = { label: "", firstName: "", lastName: "", phone: "", address: "", apartment: "", city: "", state: "", zipCode: "", country: "India", isDefault: false }

export function SavedAddresses() {
  const { toast } = useToast()
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [error, setError] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null)
  const [formData, setFormData] = useState(blankAddress)
  const user = getCurrentUser()

  useEffect(() => {
    const currentUser = getCurrentUser()
    if (currentUser) {
      loadAddresses(currentUser.id)
        .then((nextAddresses) => {
          setAddresses(nextAddresses)
          setError("")
        })
        .catch((error) => setError(error instanceof Error ? error.message : "Supabase addresses could not be loaded."))
    }
  }, [])

  const persist = async (next: SavedAddress[]) => {
    if (!user) return
    try {
      const saved = await persistAddresses(user.id, next)
      setAddresses(saved)
      setError("")
    } catch (error) {
      const message = error instanceof Error ? error.message : "Supabase save failed."
      setError(message)
      toast({ title: "Address save failed", description: message, variant: "destructive" })
      throw error
    }
  }

  const openAdd = () => {
    if (addresses.length >= MAX_SAVED_ADDRESSES) {
      toast({ title: "Address limit reached", description: "Please delete an existing address before adding a new one.", variant: "destructive" })
      return
    }
    const current = getCurrentUser()
    setEditingAddress(null)
    setFormData({ ...blankAddress, firstName: current?.firstName ?? "", lastName: current?.lastName ?? "", phone: current?.phone ?? "" })
    setIsDialogOpen(true)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value
    setFormData({ ...formData, [e.target.name]: value })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    let next = editingAddress ? addresses.map((addr) => (addr.id === editingAddress.id ? { ...formData, id: addr.id } : addr)) : [...addresses, { ...formData, id: crypto.randomUUID() }]
    const activeId = editingAddress?.id ?? next[next.length - 1].id
    if (formData.isDefault) next = next.map((addr) => (addr.id === activeId ? addr : { ...addr, isDefault: false }))
    void persist(next)
      .then(() => {
        toast({ title: editingAddress ? "Address updated" : "Address added" })
        setIsDialogOpen(false)
      })
      .catch(() => undefined)
  }

  return (
    <div className="max-w-6xl">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold">Saved Addresses</h2>
          <p className="text-sm text-muted-foreground">You can save up to {MAX_SAVED_ADDRESSES} addresses.</p>
        </div>
        <Button size="lg" className="h-12" onClick={openAdd}><Plus className="h-4 w-4 mr-2" />Add Address</Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="mb-6"><DialogTitle className="font-serif text-2xl sm:text-3xl">{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-5">
              <AddressFields formData={formData} handleChange={handleChange} />
              <Button type="submit" size="lg" className="w-full">{editingAddress ? "Update Address" : "Save Address"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {addresses.map((address) => (
          <div key={address.id} className="border border-border p-5 sm:p-6 relative">
            {address.isDefault ? <div className="absolute top-4 right-4 bg-foreground text-background text-xs px-3 py-1">Default</div> : null}
            <h3 className="font-serif text-xl font-semibold mb-3">{address.label}</h3>
            <div className="text-sm text-muted-foreground space-y-1 mb-5">
              <p className="font-medium text-foreground">{address.firstName} {address.lastName}</p>
              <p>{address.address}</p><p>{address.apartment}</p><p>{address.city}, {address.state} {address.zipCode}</p><p>{address.country}</p><p>{address.phone}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => { setEditingAddress(address); setFormData(address); setIsDialogOpen(true) }}><Edit className="h-4 w-4 mr-2" />Edit</Button>
              <Button variant="outline" size="sm" onClick={() => void persist(addresses.filter((addr) => addr.id !== address.id))}><Trash2 className="h-4 w-4 mr-2" />Delete</Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function AddressFields({ formData, handleChange }: { formData: typeof blankAddress; handleChange: (event: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <>
      <div className="space-y-2"><Label>Address Label</Label><Input name="label" value={formData.label} onChange={handleChange} placeholder="Home / Office" required /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>First Name</Label><Input name="firstName" value={formData.firstName} onChange={handleChange} required /></div><div className="space-y-2"><Label>Last Name</Label><Input name="lastName" value={formData.lastName} onChange={handleChange} required /></div></div>
      <div className="space-y-2"><Label>Phone</Label><Input name="phone" type="tel" value={formData.phone} onChange={handleChange} required /></div>
      <div className="space-y-2"><Label>Address</Label><Input name="address" value={formData.address} onChange={handleChange} required /></div>
      <div className="space-y-2"><Label>Apartment / Suite</Label><Input name="apartment" value={formData.apartment} onChange={handleChange} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>City</Label><Input name="city" value={formData.city} onChange={handleChange} required /></div><div className="space-y-2"><Label>State</Label><Input name="state" value={formData.state} onChange={handleChange} required /></div></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div className="space-y-2"><Label>ZIP / Postal Code</Label><Input name="zipCode" value={formData.zipCode} onChange={handleChange} required /></div><div className="space-y-2"><Label>Country</Label><Input name="country" value={formData.country} onChange={handleChange} required /></div></div>
      <label className="flex items-center gap-2 text-sm"><input name="isDefault" type="checkbox" checked={formData.isDefault} onChange={handleChange} /> Set as default address</label>
    </>
  )
}
