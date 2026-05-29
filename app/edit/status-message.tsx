type EditStatusMessageProps = {
  error?: string | string[]
  saved?: string | string[]
  successMessage: string
}

export function EditStatusMessage({ error, saved, successMessage }: EditStatusMessageProps) {
  if (saved === "1") {
    return <p className="text-sm text-green-600">{successMessage}</p>
  }

  if (error === "save") {
    return <p className="text-sm text-destructive">Incorrect password. Changes were not saved.</p>
  }

  if (error === "required") {
    return <p className="text-sm text-destructive">Please fill in all editable text fields before saving.</p>
  }

  if (error === "auth") {
    return <p className="text-sm text-destructive">Your editor session expired. Please unlock the editor again.</p>
  }

  return null
}
