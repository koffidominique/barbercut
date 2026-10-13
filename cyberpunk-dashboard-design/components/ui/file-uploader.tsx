"use client"

import { useId, useRef, useState } from "react"
import { FileText, Image as ImageIcon, Paperclip, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type FileUploaderProps = {
  name?: string
  accept?: string
  maxSizeMb?: number
  hint?: string
  className?: string
}

export function FileUploader({
  name = "attachment",
  accept = ".pdf,.jpg,.jpeg,.png",
  maxSizeMb = 10,
  hint = "PDF, JPG ou PNG · 10 Mo maximum",
  className,
}: FileUploaderProps) {
  const inputId = useId()
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState("")

  function selectFile(nextFile?: File) {
    if (!nextFile) return
    if (nextFile.size > maxSizeMb * 1024 * 1024) {
      setError(`Le fichier dépasse ${maxSizeMb} Mo.`)
      return
    }
    setError("")
    setFile(nextFile)
  }

  function clearFile() {
    setFile(null)
    setError("")
    if (inputRef.current) inputRef.current.value = ""
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <input
        ref={inputRef}
        id={inputId}
        name={name}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={(event) => selectFile(event.target.files?.[0])}
      />
      {file ? (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary shadow-sm">
            {file.type.startsWith("image/") ? <ImageIcon aria-hidden="true" /> : <FileText aria-hidden="true" />}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} Mo</p>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={clearFile} aria-label="Retirer le fichier">
            <X data-icon="inline-start" aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          onDragOver={(event) => { event.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(event) => { event.preventDefault(); setIsDragging(false); selectFile(event.dataTransfer.files[0]) }}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-4 py-6 text-center transition-colors",
            isDragging ? "border-primary bg-primary/10" : "border-border/80 bg-muted/20 hover:border-primary/60 hover:bg-muted/40",
          )}
        >
          <span className="flex size-10 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm">
            <Upload aria-hidden="true" />
          </span>
          <span className="flex items-center gap-1 text-sm font-medium">
            <Paperclip aria-hidden="true" /> Ajouter une pièce jointe
          </span>
          <span className="text-xs text-muted-foreground">{hint}</span>
        </label>
      )}
      {error ? <p role="alert" className="text-xs text-destructive">{error}</p> : null}
    </div>
  )
}
