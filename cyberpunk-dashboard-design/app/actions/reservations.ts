"use server"

import { and, desc, eq, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { guests, hotels, reservations } from "@/lib/db/schema"

const reservationSchema = z.object({
  guestName: z.string().trim().min(2, "Le nom du client est requis.").max(120),
  checkIn: z.string().date("La date d'arrivée est invalide."),
  checkOut: z.string().date("La date de départ est invalide."),
  status: z.enum(["confirmed", "pending", "cancelled"]).default("confirmed"),
})

async function getHotelId() {
  const existing = await db.select({ id: hotels.id }).from(hotels).limit(1)
  if (existing[0]) return existing[0].id
  const [hotel] = await db.insert(hotels).values({ name: "Maison Rivage" }).returning({ id: hotels.id })
  return hotel.id
}

export async function listReservations() {
  const hotelId = await getHotelId()
  return db.select({ id: reservations.id, confirmationCode: reservations.confirmationCode, checkIn: reservations.checkIn, checkOut: reservations.checkOut, status: reservations.status, totalAmount: reservations.totalAmount, guestName: guests.firstName, guestLastName: guests.lastName }).from(reservations).innerJoin(guests, eq(reservations.guestId, guests.id)).where(eq(reservations.hotelId, hotelId)).orderBy(desc(reservations.checkIn))
}

export async function createReservation(input: { guestName: string; checkIn: string; checkOut: string; status?: string }) {
  const values = reservationSchema.parse(input)
  if (values.checkOut <= values.checkIn) throw new Error("La date de départ doit être après l'arrivée.")
  const hotelId = await getHotelId()
  const [firstName, ...lastNameParts] = values.guestName.split(/\s+/)
  const lastName = lastNameParts.join(" ") || firstName
  const [guest] = await db.insert(guests).values({ hotelId, firstName, lastName }).returning({ id: guests.id })
  const [reservation] = await db.insert(reservations).values({ hotelId, guestId: guest.id, confirmationCode: `MR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`, checkIn: values.checkIn, checkOut: values.checkOut, status: values.status, source: "direct" }).returning()
  revalidatePath("/")
  return reservation
}

export async function updateReservation(input: { id: string; guestName: string; checkIn: string; checkOut: string; status?: string }) {
  const { id, ...payload } = input
  const values = reservationSchema.parse(payload)
  if (values.checkOut <= values.checkIn) throw new Error("La date de départ doit être après l'arrivée.")
  const hotelId = await getHotelId()
  const [firstName, ...lastNameParts] = values.guestName.split(/\s+/)
  const [reservation] = await db.update(reservations).set({ checkIn: values.checkIn, checkOut: values.checkOut, status: values.status }).where(and(eq(reservations.id, id), eq(reservations.hotelId, hotelId))).returning()
  if (!reservation) throw new Error("Réservation introuvable.")
  await db.update(guests).set({ firstName, lastName: lastNameParts.join(" ") || firstName }).where(and(eq(guests.id, reservation.guestId), eq(guests.hotelId, hotelId)))
  revalidatePath("/")
  return reservation
}

export async function updateReservationStatus(id: string, status: string) {
  const hotelId = await getHotelId()
  const safeStatus = z.enum(["confirmed", "pending", "cancelled"]).parse(status)
  const [reservation] = await db.update(reservations).set({ status: safeStatus }).where(and(eq(reservations.id, id), eq(reservations.hotelId, hotelId))).returning()
  if (!reservation) throw new Error("Réservation introuvable.")
  revalidatePath("/")
  return reservation
}

export async function deleteReservation(id: string) {
  const hotelId = await getHotelId()
  await db.delete(reservations).where(and(eq(reservations.id, id), eq(reservations.hotelId, hotelId)))
  revalidatePath("/")
}

export async function getReservationCount() {
  const hotelId = await getHotelId()
  const result = await db.select({ id: reservations.id }).from(reservations).where(and(eq(reservations.hotelId, hotelId), or(eq(reservations.status, "confirmed"), eq(reservations.status, "pending"))))
  return result.length
}
