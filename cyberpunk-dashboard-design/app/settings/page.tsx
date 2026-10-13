"use client"

import { useState } from "react"
import { Bell, Building2, Check, CreditCard, Globe2, Hotel, Save, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/reui/badge"

const settingsSections = [
  { value: "hotel", label: "Établissement", icon: Building2 },
  { value: "operations", label: "Opérations", icon: Hotel },
  { value: "team", label: "Équipe & accès", icon: Users },
  { value: "billing", label: "Facturation", icon: CreditCard },
]

export default function SettingsPage() {
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoCheckout, setAutoCheckout] = useState(false)

  function handleSave() {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return (
    <main className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <header className="border-b bg-white px-6 py-6 sm:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#2f80ed]">Maison Rivage / Administration</p>
            <h1 className="mt-2 text-3xl font-bold text-[#102a43]">Configuration</h1>
            <p className="mt-1 text-sm text-slate-500">Paramétrez votre établissement, vos opérations et les droits de votre équipe.</p>
          </div>
          <Button onClick={handleSave} className="bg-[#2f80ed] hover:bg-[#246dcc]">
            {saved ? <Check data-icon="inline-start" /> : <Save data-icon="inline-start" />}
            {saved ? "Enregistré" : "Enregistrer"}
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-6 sm:p-10">
        <div className="mb-6 flex flex-wrap items-center gap-3 rounded-xl border border-blue-100 bg-blue-50/70 p-4 text-sm text-[#102a43]">
          <ShieldCheck className="size-5 text-[#2f80ed]" />
          <span>Seuls les administrateurs peuvent modifier ces paramètres.</span>
          <Badge variant="secondary" className="ml-auto">Compte sécurisé</Badge>
        </div>

        <Tabs defaultValue="hotel" orientation="vertical" className="grid gap-6 lg:grid-cols-[230px_1fr]">
          <TabsList className="h-fit w-full flex-col items-stretch justify-start gap-1 rounded-xl bg-white p-2 shadow-sm">
            {settingsSections.map(({ value, label, icon: Icon }) => (
              <TabsTrigger key={value} value={value} className="justify-start gap-3 px-3 py-3 data-[state=active]:bg-blue-50 data-[state=active]:text-[#2f80ed]">
                <Icon />{label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-w-0">
            <TabsContent value="hotel" className="mt-0 flex flex-col gap-6">
              <Card><CardHeader><CardTitle>Informations de l&apos;établissement</CardTitle><CardDescription>Ces informations apparaissent sur vos documents et communications.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><Field label="Nom de l&apos;établissement" value="Maison Rivage" /><Field label="Type d&apos;établissement" value="Hôtel" /><Field label="Adresse" value="12 avenue des Cocotiers" /><Field label="Ville" value="Abidjan, Côte d&apos;Ivoire" /><Field label="Téléphone" value="+225 27 20 00 00 00" /><Field label="Email de contact" value="contact@maisonrivage.com" type="email" /></CardContent></Card>
              <Card><CardHeader><CardTitle>Préférences régionales</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-3"><Field label="Devise" value="FCFA (XOF)" /><Field label="Fuseau horaire" value="Africa/Abidjan" /><Field label="Langue" value="Français" /></CardContent></Card>
            </TabsContent>

            <TabsContent value="operations" className="mt-0 flex flex-col gap-6">
              <Card><CardHeader><CardTitle>Règles opérationnelles</CardTitle><CardDescription>Définissez le comportement par défaut du PMS.</CardDescription></CardHeader><CardContent className="flex flex-col gap-5"><SettingRow icon={Hotel} title="Départ automatique" description="Passe une chambre en nettoyage après le départ du client." checked={autoCheckout} onCheckedChange={setAutoCheckout} /><SettingRow icon={Bell} title="Alertes de réservation" description="Notifie la réception à chaque nouvelle réservation." checked={notifications} onCheckedChange={setNotifications} /><SettingRow icon={Globe2} title="Vérification de disponibilité" description="Bloque les réservations qui se chevauchent." checked={true} onCheckedChange={() => undefined} /></CardContent></Card>
              <Card><CardHeader><CardTitle>Horaires de l&apos;hôtel</CardTitle></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><Field label="Heure d&apos;arrivée" value="14:00" type="time" /><Field label="Heure de départ" value="12:00" type="time" /></CardContent></Card>
            </TabsContent>

            <TabsContent value="team" className="mt-0"><Card><CardHeader><CardTitle>Équipe & accès</CardTitle><CardDescription>Gérez les rôles qui peuvent accéder à votre établissement.</CardDescription></CardHeader><CardContent className="flex flex-col gap-3">{[["Claire Dubois", "Administratrice", "claire@maisonrivage.com"], ["Marc Kouassi", "Réception", "marc@maisonrivage.com"], ["Awa Traoré", "Housekeeping", "awa@maisonrivage.com"]].map(([name, role, email]) => <div key={email} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4"><div><p className="font-semibold text-[#102a43]">{name}</p><p className="text-sm text-slate-500">{email}</p></div><Badge variant="outline">{role}</Badge></div>)}<Button variant="outline" className="mt-3 w-fit">Inviter un membre</Button></CardContent></Card></TabsContent>
            <TabsContent value="billing" className="mt-0"><Card><CardHeader><CardTitle>Facturation & taxes</CardTitle><CardDescription>Paramètres utilisés pour les factures et paiements.</CardDescription></CardHeader><CardContent className="grid gap-5 sm:grid-cols-2"><Field label="Taux de TVA par défaut" value="18" type="number" /><Field label="Préfixe des factures" value="MR-2024-" /><Field label="Conditions de paiement" value="Paiement à l&apos;arrivée" /><Field label="Compte bancaire" value="•••• •••• 2480" /></CardContent></Card></TabsContent>
          </div>
        </Tabs>
      </div>
    </main>
  )
}

function Field({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  return <div className="flex flex-col gap-2"><Label>{label}</Label><Input type={type} defaultValue={value} /></div>
}

function SettingRow({ icon: Icon, title, description, checked, onCheckedChange }: { icon: typeof Hotel; title: string; description: string; checked: boolean; onCheckedChange: (value: boolean) => void }) {
  return <div className="flex items-center justify-between gap-4 rounded-lg border p-4"><div className="flex items-start gap-3"><div className="rounded-lg bg-blue-50 p-2 text-[#2f80ed]"><Icon /></div><div><p className="font-semibold text-[#102a43]">{title}</p><p className="mt-1 text-sm text-slate-500">{description}</p></div></div><Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={title} /></div>
}
