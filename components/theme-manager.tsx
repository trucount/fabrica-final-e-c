"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash2, Copy } from "lucide-react"
import { type Theme, type ThemeColors, persistTheme, deleteTheme, loadThemes } from "@/lib/client-commerce"

type ThemeManagerProps = {
  themes: Theme[]
  activeThemeName: string
  onThemeChange: (themeName: string) => void
  onThemeSaved: () => Promise<void>
  isSaving: boolean
}

export function ThemeManager({ themes, activeThemeName, onThemeChange, onThemeSaved, isSaving }: ThemeManagerProps) {
  const { toast } = useToast()
  const [mode, setMode] = useState<"select" | "create">("select")
  const [newTheme, setNewTheme] = useState<Partial<Theme>>({
    name: "",
    label: "",
    colors: {
      background: "oklch(0.985 0 0)",
      foreground: "oklch(0.145 0 0)",
      primary: "oklch(0.205 0 0)",
      primary_foreground: "oklch(0.985 0 0)",
      secondary: "oklch(0.97 0 0)",
      accent: "oklch(0.97 0 0)",
      muted: "oklch(0.97 0 0)",
      border: "oklch(0.922 0 0)",
    },
  })

  const handleColorChange = (key: keyof ThemeColors, value: string) => {
    setNewTheme({
      ...newTheme,
      colors: {
        ...(newTheme.colors as ThemeColors),
        [key]: value,
      },
    })
  }

  const handleSaveTheme = async () => {
    if (!newTheme.name || !newTheme.label) {
      toast({ title: "Error", description: "Theme name and label are required", variant: "destructive" })
      return
    }

    try {
      await persistTheme(newTheme)
      toast({ title: "Success", description: "Theme created successfully" })
      await onThemeSaved()
      setNewTheme({
        name: "",
        label: "",
        colors: {
          background: "oklch(0.985 0 0)",
          foreground: "oklch(0.145 0 0)",
          primary: "oklch(0.205 0 0)",
          primary_foreground: "oklch(0.985 0 0)",
          secondary: "oklch(0.97 0 0)",
          accent: "oklch(0.97 0 0)",
          muted: "oklch(0.97 0 0)",
          border: "oklch(0.922 0 0)",
        },
      })
      setMode("select")
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to save theme", variant: "destructive" })
    }
  }

  const handleDeleteTheme = async (id: string, themeName: string) => {
    if (themeName === "default" || themeName === activeThemeName) {
      toast({ title: "Cannot delete", description: "Cannot delete the default or active theme", variant: "destructive" })
      return
    }

    if (!confirm("Are you sure you want to delete this theme?")) return

    try {
      await deleteTheme(id)
      toast({ title: "Success", description: "Theme deleted successfully" })
      await onThemeSaved()
    } catch (error) {
      toast({ title: "Error", description: error instanceof Error ? error.message : "Failed to delete theme", variant: "destructive" })
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied", description: "Color value copied to clipboard" })
  }

  return (
    <div className="space-y-6">
      {/* Theme Selection */}
      <div className="rounded-lg border p-4 sm:p-6">
        <h3 className="font-serif text-lg font-semibold mb-4">Select Theme</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Current Theme</Label>
            <Select value={activeThemeName} onValueChange={onThemeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {themes.map((t) => (
                  <SelectItem key={t.id} value={t.name}>
                    {t.label} ({t.name})
                  </SelectItem>
                ))}
                <SelectItem value="__create_new__">+ Make Your Own Theme</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Create Custom Theme */}
      {activeThemeName === "__create_new__" && (
        <div className="rounded-lg border p-4 sm:p-6 bg-blue-50 dark:bg-blue-950">
          <h3 className="font-serif text-lg font-semibold mb-4">Create Custom Theme</h3>

          {/* Theme Info */}
          <div className="grid gap-4 md:grid-cols-2 mb-6">
            <div className="space-y-2">
              <Label>Theme Name (ID)</Label>
              <Input
                placeholder="e.g. my-custom-theme"
                value={newTheme.name}
                onChange={(e) => setNewTheme({ ...newTheme, name: e.target.value.toLowerCase().replace(/\s+/g, "-") })}
              />
              <p className="text-xs text-muted-foreground">Lowercase, no spaces (auto-formatted)</p>
            </div>
            <div className="space-y-2">
              <Label>Theme Label</Label>
              <Input
                placeholder="e.g. My Custom Theme"
                value={newTheme.label}
                onChange={(e) => setNewTheme({ ...newTheme, label: e.target.value })}
              />
            </div>
          </div>

          {/* Color Picker Panel */}
          <div className="space-y-4">
            <h4 className="font-medium text-sm">Color Configuration</h4>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {Object.entries(newTheme.colors || {}).map(([colorKey, colorValue]) => (
                <div key={colorKey} className="space-y-2 p-3 rounded-lg border bg-white dark:bg-slate-900">
                  <Label className="text-xs font-semibold uppercase">{colorKey.replace(/_/g, " ")}</Label>
                  <div className="space-y-2">
                    {/* Color Input */}
                    <Input
                      value={colorValue}
                      onChange={(e) => handleColorChange(colorKey as keyof ThemeColors, e.target.value)}
                      placeholder="oklch(0.5 0.1 50)"
                      className="font-mono text-xs"
                    />
                    {/* Color Preview */}
                    <div className="flex items-center gap-2">
                      <div
                        className="h-8 w-8 rounded border border-gray-300"
                        style={{
                          backgroundColor: colorValue && colorValue.includes("oklch") ? colorValue : "#ccc",
                        }}
                        title={colorValue}
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(colorValue)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-6">
            <Button onClick={handleSaveTheme} disabled={isSaving || !newTheme.name || !newTheme.label}>
              <Plus className="mr-2 h-4 w-4" />
              {isSaving ? "Saving..." : "Save Theme"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setMode("select")
                onThemeChange(themes[0]?.name || "default")
              }}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Existing Themes Table */}
      {activeThemeName !== "__create_new__" && (
        <div className="rounded-lg border p-4 sm:p-6">
          <h3 className="font-serif text-lg font-semibold mb-4">Existing Themes</h3>
          <div className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Colors</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {themes.map((t) => (
                  <TableRow key={t.id} className={activeThemeName === t.name ? "bg-blue-50 dark:bg-blue-950" : ""}>
                    <TableCell className="font-mono text-xs font-semibold">{t.name}</TableCell>
                    <TableCell>{t.label}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {Object.entries(t.colors).map(([key, value]) => (
                          <div
                            key={key}
                            className="h-6 w-6 rounded border border-gray-300 cursor-pointer hover:ring-2 hover:ring-offset-1"
                            style={{ backgroundColor: value }}
                            title={`${key}: ${value}`}
                            onClick={() => copyToClipboard(value)}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteTheme(t.id, t.name)}
                        disabled={t.name === "default" || t.name === activeThemeName}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
