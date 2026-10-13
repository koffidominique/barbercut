"use client"

import { FormEvent, useState, useTransition } from "react"
import { Bell, CalendarDays, Check, ChevronRight, Clock3, LogIn, LogOut, MoreHorizontal, Plus, Search, Users } from "lucide-react"
import { createReservation } from "@/app/actions/reservations"
import { FileUploader } from "@/components/ui/file-uploader"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const arrivals = [
  { name: "Aïcha Kone", room: "204", type: "Suite lagon", time: "14:00", channel: "Direct", status: "À préparer" },
  { name: "Thomas Bernard", room: "118", type: "Chambre deluxe", time: "15:30", channel: "Booking.com", status: "Confirmée" },
  { name: "Sarah & Marc Diallo", room: "302", type: "Suite jardin", time: "16:00", channel: "Expedia", status: "Confirmée" },
  { name: "Nadia Traoré", room: "107", type: "Chambre standard", time: "18:45", channel: "Direct", status: "En attente" },
]

const departures = [
  { name: "Jean-Pierre Kouassi", room: "201", time: "10:00", balance: "0 FCFA", status: "Prêt" },
  { name: "Claire Martin", room: "305", time: "11:30", balance: "45 000 FCFA", status: "Solde dû" },
  { name: "Oumar Sy", room: "112", time: "12:00", balance: "0 FCFA", status: "Prêt" },
]

export default function ReceptionPage() {
  const [activeTab, setActiveTab] = useState("arrivees")
  const [reservationOpen, setReservationOpen] = useState(false)
  const [pending, startTransition] = useTransition()
  const [formError, setFormError] = useState("")

  function submitReservation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setFormError("")
    startTransition(async () => {
      try {
        await createReservation({
          guestName: String(form.get("guestName")),
          checkIn: String(form.get("checkIn")),
          checkOut: String(form.get("checkOut")),
        })
        setReservationOpen(false)
        event.currentTarget.reset()
      } catch (cause) {
        setFormError(cause instanceof Error ? cause.message : "Impossible de créer la réservation.")
      }
    })
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card/80 px-6 py-5 lg:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Maison Rivage / Réception</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Front office</h1>
            <p className="mt-1 text-sm text-muted-foreground">Pilotez les arrivées, les départs et l&apos;expérience client.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" aria-label="Notifications"><Bell /></Button>
            <Button onClick={() => setReservationOpen(true)}><Plus data-icon="inline-start" /> Nouvelle réservation</Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-7xl space-y-6 px-6 py-7 lg:px-10">
        <div className="grid gap-4 md:grid-cols-4">
          {[{ label: "Arrivées aujourd&apos;hui", value: "12", icon: LogIn }, { label: "Départs aujourd&apos;hui", value: "8", icon: LogOut }, { label: "Clients présents", value: "74", icon: Users }, { label: "Chambres disponibles", value: "18", icon: Check }].map((item) => {
            const Icon = item.icon
            return <Card key={item.label}><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold">{item.value}</p></div><div className="rounded-xl bg-primary/10 p-3 text-primary"><Icon /></div></CardContent></Card>
          })}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-xl font-semibold">Planning du jour</h2><p className="text-sm text-muted-foreground">Mardi 18 juin 2024 · Vue réception</p></div>
          <div className="relative w-full sm:w-72"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" placeholder="Rechercher un client..." /></div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList><TabsTrigger value="arrivees"><LogIn data-icon="inline-start" /> Arrivées <Badge variant="secondary">12</Badge></TabsTrigger><TabsTrigger value="departs"><LogOut data-icon="inline-start" /> Départs <Badge variant="secondary">8</Badge></TabsTrigger></TabsList>
          <TabsContent value="arrivees" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Arrivées à suivre</CardTitle></CardHeader><CardContent className="p-0"><div className="divide-y">{arrivals.map((guest) => <div key={guest.name} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"><div className="flex items-center gap-4"><div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">{guest.name.split(" ").map((part) => part[0]).join("")}</div><div><p className="font-medium">{guest.name}</p><p className="text-sm text-muted-foreground">Chambre {guest.room} · {guest.type}</p></div></div><div className="flex items-center gap-5 text-sm"><span className="flex items-center gap-1.5 text-muted-foreground"><Clock3 /> {guest.time}</span><span className="hidden text-muted-foreground md:inline">{guest.channel}</span><Badge variant={guest.status === "À préparer" ? "outline" : guest.status === "En attente" ? "secondary" : "default"}>{guest.status}</Badge><Button variant="ghost" size="icon" aria-label={`Voir ${guest.name}`}><ChevronRight /></Button></div></div>)}</div></CardContent></Card></TabsContent>
          <TabsContent value="departs" className="mt-4"><Card><CardHeader><CardTitle className="text-base">Départs à finaliser</CardTitle></CardHeader><CardContent className="p-0"><div className="divide-y">{departures.map((guest) => <div key={guest.name} className="flex flex-col gap-3 px-6 py-4 md:flex-row md:items-center md:justify-between"><div><p className="font-medium">{guest.name}</p><p className="text-sm text-muted-foreground">Chambre {guest.room} · départ prévu à {guest.time}</p></div><div className="flex items-center gap-4"><span className={guest.balance === "0 FCFA" ? "text-sm text-muted-foreground" : "text-sm font-medium text-destructive"}>{guest.balance}</span><Badge variant={guest.status === "Prêt" ? "default" : "destructive"}>{guest.status}</Badge><Button variant="ghost" size="icon" aria-label={`Ouvrir ${guest.name}`}><MoreHorizontal /></Button></div></div>)}</div></CardContent></Card></TabsContent>
        </Tabs>
        <Card><CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><CalendarDays className="text-primary" /><div><p className="font-medium">Planning des chambres</p><p className="text-sm text-muted-foreground">Visualisez les disponibilités et les tâches housekeeping.</p></div></div><Button variant="outline">Ouvrir le planning <ChevronRight data-icon="inline-end" /></Button></CardContent></Card>
      </div>
      <Dialog open={reservationOpen} onOpenChange={setReservationOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nouvelle réservation</DialogTitle>
            <DialogDescription>Ajoutez le séjour et joignez les documents utiles du client.</DialogDescription>
          </DialogHeader>
          <form onSubmit={submitReservation} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2"><Label htmlFor="guestName">Client</Label><Input id="guestName" name="guestName" placeholder="Nom et prénom" required /></div>
            <div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="checkIn">Arrivée</Label><Input id="checkIn" name="checkIn" type="date" required /></div><div className="flex flex-col gap-2"><Label htmlFor="checkOut">Départ</Label><Input id="checkOut" name="checkOut" type="date" required /></div></div>
            <div className="flex flex-col gap-2"><Label>Document du séjour <span className="font-normal text-muted-foreground">(optionnel)</span></Label><FileUploader name="bookingDocument" /></div>
            {formError ? <p role="alert" className="text-sm text-destructive">{formError}</p> : null}
            <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Confirmer la réservation"}</Button>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  )
}
