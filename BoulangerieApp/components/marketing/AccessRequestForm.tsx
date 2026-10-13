"use client";

import { FormEvent, useState } from "react";
import { format } from "date-fns";
import { Field, FieldDescription, FieldGroup, FieldLabel, FieldSeparator } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RequestSubmitButton } from "@/components/examples/c-button-12";
import { DemoDateCalendar } from "@/components/examples/c-calendar-14";
import { ContactTextField } from "@/components/examples/c-input-3";
import { SubmissionInput } from "@/components/examples/c-input-4";
import { IvoryPhoneField } from "@/components/examples/c-input-8";
import { PreferredContactField } from "@/components/examples/c-input-15";

type AccessRequestFormProps = {
    selectedPlanId?: string;
};

export function AccessRequestForm({ selectedPlanId = "" }: AccessRequestFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(null);
    const [preferredDemoDate, setPreferredDemoDate] = useState<Date>();
    const [preferredContact, setPreferredContact] = useState("whatsapp");
    const [outletCount, setOutletCount] = useState("1");

    async function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setFeedback(null);
        setIsSubmitting(true);

        const form = event.currentTarget;
        const formData = new FormData(form);
        const payload = Object.fromEntries(formData.entries());
        const enteredPhone = String(payload.phone ?? "").trim();
        payload.phone = enteredPhone.startsWith("+") ? enteredPhone : `+225${enteredPhone}`;
        payload.preferred_demo_date = preferredDemoDate ? format(preferredDemoDate, "yyyy-MM-dd") : "";
        payload.preferred_contact = preferredContact;

        try {
            const response = await fetch("/api/access-requests", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (!response.ok) throw new Error(result.error ?? "Une erreur est survenue.");

            form.reset();
            setPreferredDemoDate(undefined);
            setPreferredContact("whatsapp");
            setOutletCount("1");
            setFeedback({ type: "success", text: "Demande reçue. Notre équipe vous contactera pour échanger sur votre boulangerie." });
        } catch (error) {
            setFeedback({
                type: "error",
                text: error instanceof Error ? error.message : "Impossible d’envoyer la demande. Réessayez.",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <FieldGroup className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field>
                    <FieldLabel htmlFor="contact-name">Votre nom <span className="text-destructive">*</span></FieldLabel>
                    <Input id="contact-name" name="contact_name" autoComplete="name" required minLength={2} maxLength={120} disabled={isSubmitting} />
                    <ContactTextField id="city" name="city" label="Ville" autoComplete="address-level2" required placeholder="Ex. Abidjan" description="Ville où se trouve votre établissement." disabled={isSubmitting} />
                    <SubmissionInput id="email" name="email" type="email" label="Adresse e-mail" autoComplete="email" required maxLength={254} disabled={isSubmitting} />
                </Field>
                <IvoryPhoneField disabled={isSubmitting} />
                <Field>
                    <FieldLabel htmlFor="email">Adresse e-mail <span className="text-destructive">*</span></FieldLabel>
                    <Input id="email" name="email" type="email" autoComplete="email" required maxLength={254} disabled={isSubmitting} />
                </Field>
                <PreferredContactField value={preferredContact} onChange={setPreferredContact} disabled={isSubmitting} />
                <Field orientation="responsive">
                    <FieldLabel htmlFor="outlet-count">Nombre de points de vente</FieldLabel>
                    <Select value={outletCount} onValueChange={(nextValue) => setOutletCount(String(nextValue))} disabled={isSubmitting}>
                        <SelectTrigger id="outlet-count"><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="1">1 point de vente</SelectItem>
                            <SelectItem value="2">2 points de vente</SelectItem>
                            <SelectItem value="3">3 points de vente</SelectItem>
                            <SelectItem value="4">4 points de vente ou plus</SelectItem>
                        </SelectContent>
                    </Select>
                    <input type="hidden" name="outlet_count" value={outletCount} />
                </Field>
            </FieldGroup>

            <FieldSeparator>Organisation de la démonstration</FieldSeparator>
            <Field>
                <FieldLabel>Date de préférence</FieldLabel>
                <DemoDateCalendar selectedDate={preferredDemoDate} onSelect={setPreferredDemoDate} />
                <input type="hidden" name="preferred_demo_date" value={preferredDemoDate ? format(preferredDemoDate, "yyyy-MM-dd") : ""} />
                <FieldDescription>Facultatif. La date n’est pas réservée avant confirmation de notre équipe.</FieldDescription>
            </Field>

            <label className="hidden" aria-hidden="true">
                Site web
                <input name="website" tabIndex={-1} autoComplete="off" />
            </label>
            <input type="hidden" name="requested_plan" value={selectedPlanId} />

            <Field>
                <FieldLabel htmlFor="needs">Quel est votre besoin prioritaire ? <span className="text-destructive">*</span></FieldLabel>
                <Textarea id="needs" name="needs" required minLength={8} maxLength={1500} rows={4} placeholder="Ventes, stock, production, caisse…" className="min-h-28 resize-y" disabled={isSubmitting} />
            </Field>

            {feedback && (
                <p role="status" aria-live="polite" className={`rounded-lg px-4 py-3 text-sm font-medium ${feedback.type === "success" ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-red-500/10 text-red-700 dark:text-red-300"}`}>
                    {feedback.text}
                </p>
            )}

            <RequestSubmitButton disabled={isSubmitting} className="h-12 w-full rounded-full px-8 font-bold text-[#003322] shadow-[0_12px_30px_rgba(16,185,129,0.25)] transition hover:-translate-y-0.5 hover:bg-emerald-400 sm:w-auto">
                {isSubmitting ? "Envoi en cours…" : "Envoyer ma demande"}
            </RequestSubmitButton>
            <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
                Cette demande ne crée pas automatiquement un compte. Les accès sont envoyés après étude de votre besoin.
            </p>
        </form>
    );
}