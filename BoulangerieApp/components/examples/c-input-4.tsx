import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type SubmissionInputProps = {
  id: string
  name: string
  label: string
  type?: "text" | "email" | "tel"
  autoComplete?: string
  required?: boolean
  maxLength?: number
  disabled?: boolean
}

export function SubmissionInput({ id, name, label, type = "text", autoComplete, required = false, maxLength, disabled = false }: SubmissionInputProps) {
  return (
    <Field data-disabled={disabled}>
      <FieldLabel htmlFor={id}>{label}{required ? <span className="text-destructive"> *</span> : null}</FieldLabel>
      <Input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        maxLength={maxLength}
        disabled={disabled}
      />
    </Field>
  )
}