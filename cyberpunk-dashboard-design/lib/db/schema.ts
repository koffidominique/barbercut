import { pgTable, text, uuid, integer, date, numeric, timestamp, boolean } from "drizzle-orm/pg-core"

export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").notNull().default("reception"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
})

export const hotels = pgTable("hotels", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  timezone: text("timezone").notNull().default("Europe/Paris"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const guests = pgTable("guests", {
  id: uuid("id").defaultRandom().primaryKey(),
  hotelId: uuid("hotel_id").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  nationality: text("nationality"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const reservations = pgTable("reservations", {
  id: uuid("id").defaultRandom().primaryKey(),
  hotelId: uuid("hotel_id").notNull(),
  guestId: uuid("guest_id").notNull(),
  roomId: uuid("room_id"),
  confirmationCode: text("confirmation_code").notNull().unique(),
  checkIn: date("check_in").notNull(),
  checkOut: date("check_out").notNull(),
  status: text("status").notNull().default("confirmed"),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull().default("0"),
  source: text("source").notNull().default("direct"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const rooms = pgTable("rooms", {
  id: uuid("id").defaultRandom().primaryKey(),
  hotelId: uuid("hotel_id").notNull(),
  number: text("number").notNull(),
  roomType: text("room_type").notNull(),
  floor: integer("floor"),
  status: text("status").notNull().default("available"),
  nightlyRate: numeric("nightly_rate", { precision: 10, scale: 2 }).notNull().default("0"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export const housekeepingTasks = pgTable("housekeeping_tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  hotelId: uuid("hotel_id").notNull(),
  roomId: uuid("room_id").notNull(),
  assignedTo: text("assigned_to"),
  taskType: text("task_type").notNull().default("cleaning"),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("normal"),
  comment: text("comment"),
  dueAt: timestamp("due_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})

export type Reservation = typeof reservations.$inferSelect
export type NewReservation = typeof reservations.$inferInsert
export type Guest = typeof guests.$inferSelect
export type Room = typeof rooms.$inferSelect
export type Hotel = typeof hotels.$inferSelect
export type HousekeepingTask = typeof housekeepingTasks.$inferSelect
