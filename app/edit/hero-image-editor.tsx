"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"

type HeroImageEditorProps = {
  initialDesktopImages: string[]
  initialMobileImages: string[]
}

export function HeroImageEditor({ initialDesktopImages, initialMobileImages }: HeroImageEditorProps) {
  const [desktopImages, setDesktopImages] = useState(initialDesktopImages)
  const [mobileImages, setMobileImages] = useState(initialMobileImages)

  const addDesktopImage = () => setDesktopImages([...desktopImages, ""])
  const removeDesktopImage = (index: number) => {
    const newImages = [...desktopImages]
    newImages.splice(index, 1)
    setDesktopImages(newImages)
  }
  const updateDesktopImage = (index: number, value: string) => {
    const newImages = [...desktopImages]
    newImages[index] = value
    setDesktopImages(newImages)
  }

  const addMobileImage = () => setMobileImages([...mobileImages, ""])
  const removeMobileImage = (index: number) => {
    const newImages = [...mobileImages]
    newImages.splice(index, 1)
    setMobileImages(newImages)
  }
  const updateMobileImage = (index: number, value: string) => {
    const newImages = [...mobileImages]
    newImages[index] = value
    setMobileImages(newImages)
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Desktop images</h3>
          <Button type="button" variant="outline" size="sm" onClick={addDesktopImage}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {desktopImages.map((imageUrl, index) => (
          <div key={index} className="flex gap-2">
            <Input
              name="heroImageUrlsDesktop"
              value={imageUrl}
              onChange={(e) => updateDesktopImage(index, e.target.value)}
              aria-label={`Desktop hero carousel image ${index + 1}`}
              className="border-dashed"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeDesktopImage(index)}
              disabled={desktopImages.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold">Mobile images</h3>
          <Button type="button" variant="outline" size="sm" onClick={addMobileImage}>
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
        {mobileImages.map((imageUrl, index) => (
          <div key={index} className="flex gap-2">
            <Input
              name="heroImageUrlsMobile"
              value={imageUrl}
              onChange={(e) => updateMobileImage(index, e.target.value)}
              aria-label={`Mobile hero carousel image ${index + 1}`}
              className="border-dashed"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeMobileImage(index)}
              disabled={mobileImages.length <= 1}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
