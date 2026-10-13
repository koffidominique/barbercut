"use client"

import { fr } from "date-fns/locale"

import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

type DemoDateCalendarProps = {
  selectedDate?: Date
  onSelect: (date?: Date) => void
}

export function DemoDateCalendar({ selectedDate, onSelect }: DemoDateCalendarProps) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="px-4 pb-0">
        <CardTitle className="text-sm">Date souhaitée</CardTitle>
        <CardDescription>Votre choix sera confirmé par notre équipe.</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-2">
        <Calendar
          disabled={[{ before: today }]}
          mode="single"
          onSelect={onSelect}
          selected={selectedDate}
          locale={fr}
        />
      </CardContent>
    </Card>
  )
}