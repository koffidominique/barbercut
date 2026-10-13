import { NextResponse } from "next/server"
import { listReservations } from "@/app/actions/reservations"

export async function GET() {
  const reservations = await listReservations()
  return NextResponse.json(reservations)
}
