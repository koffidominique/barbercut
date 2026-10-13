"use server"

import { and, eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { db } from "@/lib/db"
import { guests, hotels, housekeepingTasks, rooms } from "@/lib/db/schema"

const hotelName = "Maison Rivage"

async function getHotelId() {
  const existing = await db.select({ id: hotels.id }).from(hotels).limit(1)
  if (existing[0]) return existing[0].id
  const [hotel] = await db.insert(hotels).values({ name: hotelName }).returning({ id: hotels.id })
  return hotel.id
}

const roomInput = z.object({ number: z.string().trim().min(1), roomType: z.string().trim().min(1), floor: z.coerce.number().int().optional(), nightlyRate: z.coerce.number().nonnegative() })
export async function listRooms() {
  const hotelId = await getHotelId()
  return db.select().from(rooms).where(eq(rooms.hotelId, hotelId)).orderBy(rooms.number)
}
export async function createRoom(input: z.input<typeof roomInput>) {
  const values = roomInput.parse(input)
  const hotelId = await getHotelId()
  const [room] = await db.insert(rooms).values({ ...values, hotelId, nightlyRate: values.nightlyRate.toFixed(2) }).returning()
  revalidatePath("/")
  return room
}
export async function updateRoom(id: string, input: z.input<typeof roomInput>) {
  const values = roomInput.parse(input)
  const hotelId = await getHotelId()
  const [room] = await db.update(rooms).set({ ...values, nightlyRate: values.nightlyRate.toFixed(2) }).where(and(eq(rooms.id, id), eq(rooms.hotelId, hotelId))).returning()
  if (!room) throw new Error("Chambre introuvable.")
  revalidatePath("/")
  return room
}
export async function deleteRoom(id: string) {
  const hotelId = await getHotelId()
  await db.delete(rooms).where(and(eq(rooms.id, id), eq(rooms.hotelId, hotelId)))
  revalidatePath("/")
}

const guestInput = z.object({ firstName: z.string().trim().min(1), lastName: z.string().trim().min(1), email: z.string().email().optional().or(z.literal("")), phone: z.string().trim().optional() })
export async function listGuests() {
  const hotelId = await getHotelId()
  return db.select().from(guests).where(eq(guests.hotelId, hotelId)).orderBy(desc(guests.createdAt))
}
export async function createGuest(input: z.input<typeof guestInput>) {
  const values = guestInput.parse(input)
  const hotelId = await getHotelId()
  const [guest] = await db.insert(guests).values({ ...values, hotelId, email: values.email || null }).returning()
  revalidatePath("/")
  return guest
}
export async function updateGuest(id: string, input: z.input<typeof guestInput>) {
  const values = guestInput.parse(input)
  const hotelId = await getHotelId()
  const [guest] = await db.update(guests).set({ ...values, email: values.email || null }).where(and(eq(guests.id, id), eq(guests.hotelId, hotelId))).returning()
  if (!guest) throw new Error("Client introuvable.")
  revalidatePath("/")
  return guest
}
export async function deleteGuest(id: string) {
  const hotelId = await getHotelId()
  await db.delete(guests).where(and(eq(guests.id, id), eq(guests.hotelId, hotelId)))
  revalidatePath("/")
}

export async function listHousekeepingTasks() {
  const hotelId = await getHotelId()
  return db.select().from(housekeepingTasks).where(eq(housekeepingTasks.hotelId, hotelId)).orderBy(desc(housekeepingTasks.createdAt))
}
export async function updateHousekeepingComment(id: string, comment: string) {
  const hotelId = await getHotelId()
  const value = z.string().trim().max(1000).parse(comment)
  const [task] = await db.update(housekeepingTasks).set({ comment: value || null }).where(and(eq(housekeepingTasks.id, id), eq(housekeepingTasks.hotelId, hotelId))).returning()
  if (!task) throw new Error("Tâche introuvable.")
  revalidatePath("/")
  return task
}

export async function createHousekeepingTask(input: { roomId: string; assignedTo?: string; priority?: string; comment?: string }) {
  const values = z.object({ roomId: z.string().uuid(), assignedTo: z.string().trim().optional(), priority: z.enum(["low", "normal", "high"]).default("normal"), comment: z.string().trim().max(1000).optional() }).parse(input)
  const hotelId = await getHotelId()
  const [task] = await db.insert(housekeepingTasks).values({ ...values, hotelId, assignedTo: values.assignedTo || null, comment: values.comment || null }).returning()
  revalidatePath("/")
  return task
}

export async function deleteHousekeepingTask(id: string) {
  const hotelId = await getHotelId()
  await db.delete(housekeepingTasks).where(and(eq(housekeepingTasks.id, id), eq(housekeepingTasks.hotelId, hotelId)))
  revalidatePath("/")
}

export async function updateHousekeepingStatus(id: string, status: string) {
  const hotelId = await getHotelId()
  const allowed = z.enum(["pending", "in_progress", "completed"]).parse(status)
  const [task] = await db.update(housekeepingTasks).set({ status: allowed, completedAt: allowed === "completed" ? new Date() : null }).where(and(eq(housekeepingTasks.id, id), eq(housekeepingTasks.hotelId, hotelId))).returning()
  if (!task) throw new Error("Tâche introuvable.")
  revalidatePath("/")
  return task
}
