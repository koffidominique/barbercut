import {
  Field,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

type ContactTextFieldProps = {
  id: string
  name: string
  label: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  description?: string
  disabled?: boolean
}

export function ContactTextField({ id, name, label, placeholder, autoComplete, required = false, description, disabled = false }: ContactTextFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}{required ? <span className="text-destructive"> *</span> : null}</FieldLabel>
      <Input
        id={id}
        name={name}
        type="text"
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
      />
      {description ? <FieldDescription>{description}</FieldDescription> : null}
    </Field>
  )
}