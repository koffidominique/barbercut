"use client"

import { FormEvent, useMemo, useState, useTransition } from "react"
import { createReservation, deleteReservation, updateReservation, updateReservationStatus } from "@/app/actions/reservations"
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/reui/badge"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CalendarDays, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react"
import { Label } from "@/components/ui/label"
import { FileUploader } from "@/components/ui/file-uploader"

function formatDate(value: string) {
  return new Intl.DateTimeFormat("fr-FR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T12:00:00`))
}

export function ReservationCalendar() {
  const today = new Date()
  const [selected, setSelected] = useState<Date | undefined>(today)
  const [month, setMonth] = useState(today)
  const [created, setCreated] = useState<{ id: string; confirmationCode: string; guestName: string; checkIn: string; checkOut: string; status: string }[]>([])
  const [editing, setEditing] = useState<{ id: string; confirmationCode: string; guestName: string; checkIn: string; checkOut: string; status: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 8
  const demoReservations = [
    { id: "", confirmationCode: "RES-2026-001245", guestName: "Jean Kouassi", checkIn: "2026-10-03", checkOut: "2026-10-06", room: "Deluxe · 204", source: "Direct", total: "180 000 FCFA", paid: "100 000 FCFA", status: "Confirmée" },
    { id: "", confirmationCode: "RES-2026-001246", guestName: "Marie Yao", checkIn: "2026-10-04", checkOut: "2026-10-05", room: "Standard · À attribuer", source: "Corporate", total: "55 000 FCFA", paid: "Payé", status: "Confirmée" },
    { id: "", confirmationCode: "RES-2026-001247", guestName: "Thomas Bernard", checkIn: "2026-10-05", checkOut: "2026-10-08", room: "Suite · 301", source: "Booking", total: "240 000 FCFA", paid: "0 FCFA", status: "Option" },
  ]
  const filteredReservations = useMemo(() => [...created.map((item) => ({ ...item, room: "À attribuer", source: "Direct", total: "—", paid: "0 FCFA", status: "Confirmée" })), ...demoReservations].filter((item) => {
    const matchesQuery = !query || `${item.guestName} ${item.confirmationCode} ${item.room}`.toLowerCase().includes(query.toLowerCase())
    return matchesQuery && (statusFilter === "all" || item.status === statusFilter)
  }), [created, demoReservations, query, statusFilter])
  const pageCount = Math.max(1, Math.ceil(filteredReservations.length / pageSize))
  const reservations = filteredReservations.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError("")
    const values = { guestName: String(form.get("guestName")), checkIn: String(form.get("checkIn")), checkOut: String(form.get("checkOut")), status: editing?.status || "confirmed" }
    startTransition(async () => {
      try {
        if (editing) {
          const reservation = await updateReservation({ id: editing.id, ...values })
          setCreated((items) => items.map((item) => item.id === editing.id ? { ...item, ...values, confirmationCode: reservation.confirmationCode } : item))
          setEditing(null)
        } else {
          const reservation = await createReservation(values)
          setCreated((items) => [{ id: reservation.id, ...values, confirmationCode: reservation.confirmationCode }, ...items])
        }
        event.currentTarget.reset()
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Impossible de créer la réservation.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="overflow-hidden border-primary/20 bg-card/90 shadow-[0_0_45px_hsl(var(--primary)/0.08)]">
          <CardHeader className="border-b border-border/70 bg-muted/20 pb-5"><div className="flex items-start justify-between gap-4"><div><CardTitle className="flex items-center gap-2 text-xl"><CalendarDays className="text-primary" data-icon="inline-start" /> Calendrier des réservations</CardTitle><p className="mt-1 text-sm text-muted-foreground">Sélectionnez une date pour consulter les arrivées et départs.</p></div><Badge variant="secondary">{selected ? selected.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" }) : "Aucune date"}</Badge></div></CardHeader>
          <CardContent className="flex flex-col gap-5 p-5 sm:p-7">
            <div className="flex min-h-[410px] items-center justify-center rounded-2xl border border-border/70 bg-background/50 p-3 sm:p-7"><Calendar className="w-full max-w-none" mode="single" selected={selected} onSelect={setSelected} month={month} onMonthChange={setMonth} /></div>
            <div className="grid gap-2 sm:grid-cols-3">
              {[{ label: "Arrivées", value: "24" }, { label: "Départs", value: "18" }, { label: "Occupation", value: "78 %" }].map((item) => <div key={item.label} className="rounded-lg border bg-muted/40 p-3"><p className="text-xs text-muted-foreground">{item.label}</p><p className="mt-1 text-lg font-semibold">{item.value}</p></div>)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>{editing ? "Modifier la réservation" : "Nouvelle réservation"}</CardTitle><div className="grid grid-cols-5 gap-1 pt-2">{["Séjour", "Client", "Chambre", "Paiement", "Confirmation"].map((label, index) => <div key={label} className="flex flex-col gap-1"><div className={`h-1 rounded-full ${index === 0 ? "bg-primary" : "bg-muted"}`} /><span className="text-[10px] text-muted-foreground">{index + 1}. {label}</span></div>)}</div></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2"><Label htmlFor="guestName">Client principal</Label><Input id="guestName" name="guestName" defaultValue={editing?.guestName} placeholder="Nom et prénom" required /></div>
              <div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="checkIn">Date d&apos;arrivée</Label><Input id="checkIn" name="checkIn" type="date" defaultValue={editing?.checkIn} required /></div><div className="flex flex-col gap-2"><Label htmlFor="checkOut">Date de départ</Label><Input id="checkOut" name="checkOut" type="date" required /></div></div>
              <div className="grid gap-4 sm:grid-cols-2"><div className="flex flex-col gap-2"><Label htmlFor="adults">Adultes</Label><Input id="adults" name="adults" type="number" min="1" defaultValue="2" /></div><div className="flex flex-col gap-2"><Label htmlFor="source">Source</Label><select id="source" name="source" className="h-10 rounded-md border border-input bg-background px-3 text-sm"><option>Direct</option><option>Booking</option><option>Corporate</option><option>Agence</option></select></div></div>
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Résumé estimatif</span><span className="font-semibold text-primary">À calculer</span></div><p className="mt-1 text-xs text-muted-foreground">Le tarif et la chambre pourront être attribués depuis le détail du séjour.</p></div>
              <div className="flex flex-col gap-2"><Label>Documents du séjour <span className="font-normal text-muted-foreground">(optionnel)</span></Label><FileUploader name="bookingDocument" /></div>
              {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
              <Button type="submit" disabled={pending}>{pending ? "Enregistrement…" : "Confirmer la réservation"}</Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[{ label: "Aujourd'hui", value: "24", detail: "réservations actives" }, { label: "Confirmées", value: "86", detail: "séjours sécurisés" }, { label: "Arrivées", value: "12", detail: "à préparer aujourd'hui" }, { label: "Départs", value: "9", detail: "dont 2 urgents" }].map((item) => <Card key={item.label} className="dashboard-card border-border/80 bg-card/80"><CardContent className="p-5"><p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{item.value}</p><p className="mt-1 text-xs text-muted-foreground">{item.detail}</p></CardContent></Card>)}</div>
      <Card className="overflow-hidden border-border/80 bg-card/90">
        <CardHeader className="gap-4 border-b border-border/70 bg-muted/15"><div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-center"><div><CardTitle className="text-xl">Toutes les réservations</CardTitle><p className="mt-1 text-sm text-muted-foreground">Pilotage quotidien des séjours, paiements et attributions.</p></div><Badge variant="secondary">{reservations.length} résultats</Badge></div><div className="flex flex-col gap-3 lg:flex-row"><Input value={query} onChange={(event) => { setQuery(event.target.value); setCurrentPage(1) }} placeholder="Rechercher un client, une référence ou une chambre..." className="lg:max-w-xl" /><select value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setCurrentPage(1) }} aria-label="Filtrer par statut" className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"><option value="all">Tous les statuts</option><option value="Confirmée">Confirmées</option><option value="Option">Options</option></select></div></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow className="hover:bg-transparent"><TableHead className="pl-6">Réservation</TableHead><TableHead>Client</TableHead><TableHead>Séjour</TableHead><TableHead>Chambre</TableHead><TableHead>Source</TableHead><TableHead>Montant</TableHead><TableHead>Paiement</TableHead><TableHead>Statut</TableHead><TableHead className="pr-6 text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{reservations.map((item) => <TableRow key={item.confirmationCode} className="group"><TableCell className="pl-6 font-mono text-xs text-primary">#{item.confirmationCode.replace("RES-2026-", "")}</TableCell><TableCell className="font-medium">{item.guestName}</TableCell><TableCell><div className="whitespace-nowrap text-sm">{formatDate(item.checkIn)} → {formatDate(item.checkOut)}</div><div className="text-xs text-muted-foreground">{Math.max(1, Math.ceil((new Date(item.checkOut).getTime() - new Date(item.checkIn).getTime()) / 86400000))} nuit(s)</div></TableCell><TableCell>{item.room}</TableCell><TableCell><Badge variant="outline">{item.source}</Badge></TableCell><TableCell className="whitespace-nowrap">{item.total}</TableCell><TableCell><Badge variant="outline" className={item.paid === "Payé" ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300" : item.paid === "0 FCFA" ? "border-rose-400/30 bg-rose-400/10 text-rose-300" : "border-amber-400/30 bg-amber-400/10 text-amber-300"}>{item.paid === "Payé" ? "Payé" : item.paid === "0 FCFA" ? "Impayé" : "Partiel"}</Badge></TableCell><TableCell><Badge variant={item.status === "Confirmée" ? "secondary" : "outline"}><CheckCircle2 data-icon="inline-start" /> {item.status}</Badge></TableCell><TableCell className="pr-6 text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => setEditing(item.id ? item : null)}>Modifier</Button>{item.id ? <Button variant="ghost" size="sm" className="text-destructive" disabled={pending} onClick={() => startTransition(async () => { await deleteReservation(item.id); setCreated((items) => items.filter((entry) => entry.id !== item.id)); if (editing?.id === item.id) setEditing(null) })}>Supprimer</Button> : null}</div></TableCell></TableRow>)}</TableBody></Table></div><div className="flex flex-col gap-3 border-t border-border/70 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-sm text-muted-foreground">Affichage de {filteredReservations.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} à {Math.min(currentPage * pageSize, filteredReservations.length)} sur {filteredReservations.length} réservations</p><div className="flex items-center gap-2"><Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.max(1, page - 1))} disabled={currentPage === 1}><ChevronLeft data-icon="inline-start" /> Précédent</Button><span className="min-w-20 text-center text-sm font-medium text-foreground">Page {currentPage} / {pageCount}</span><Button variant="outline" size="sm" onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))} disabled={currentPage >= pageCount}>Suivant <ChevronRight data-icon="inline-end" /></Button></div></div></CardContent>
      </Card>
    </div>
  )
}

