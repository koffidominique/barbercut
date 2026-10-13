import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group"

export function IvoryPhoneField({ disabled = false }: { disabled?: boolean }) {
  return (
    <Field>
      <FieldLabel htmlFor="phone">Téléphone / WhatsApp <span className="text-destructive">*</span></FieldLabel>
      <InputGroup>
        <InputGroupAddon><InputGroupText>+225</InputGroupText></InputGroupAddon>
        <InputGroupInput id="phone" name="phone" type="tel" autoComplete="tel-national" required minLength={8} maxLength={20} placeholder="07 00 00 00 00" disabled={disabled} />
      </InputGroup>
      <FieldDescription>Saisissez le numéro local sans l’indicatif pays.</FieldDescription>
    </Field>
  )
}