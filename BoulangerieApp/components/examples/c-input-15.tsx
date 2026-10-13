import { Field, FieldLabel } from "@/components/ui/field"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type PreferredContactFieldProps = {
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

export function PreferredContactField({ value, onChange, disabled = false }: PreferredContactFieldProps) {
  return (
    <Field>
      <FieldLabel htmlFor="preferred-contact">Canal de réponse préféré</FieldLabel>
      <Select value={value} onValueChange={(nextValue) => onChange(String(nextValue))} disabled={disabled}>
        <SelectTrigger id="preferred-contact"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="whatsapp">WhatsApp</SelectItem>
          <SelectItem value="call">Appel téléphonique</SelectItem>
          <SelectItem value="email">E-mail</SelectItem>
        </SelectContent>
      </Select>
    </Field>
  )
}