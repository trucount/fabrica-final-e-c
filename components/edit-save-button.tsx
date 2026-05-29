"use client"

import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"

type EditSaveButtonProps = {
  form: string
}

export function EditSaveButton({ form }: EditSaveButtonProps) {
  return (
    <Button
      type="submit"
      form={form}
      onClick={(event) => {
        const password = window.prompt("Enter editor password to save changes")

        if (!password) {
          event.preventDefault()
          return
        }

        const targetForm = document.getElementById(form) as HTMLFormElement | null
        const passwordInput = targetForm?.querySelector<HTMLInputElement>('input[name="savePassword"]')

        if (passwordInput) {
          passwordInput.value = password
        }
      }}
    >
      <Save className="h-4 w-4 mr-2" />
      Save Text
    </Button>
  )
}
