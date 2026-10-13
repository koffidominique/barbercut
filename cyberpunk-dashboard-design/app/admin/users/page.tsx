import { redirect } from "next/navigation"
import { and, eq } from "drizzle-orm"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { getCurrentUser, hasRole } from "@/lib/auth"

export default async function UsersPage() {
  const currentUser = await getCurrentUser()
  if (!currentUser || !hasRole((currentUser as { role?: string }).role, ["admin"])) redirect("/")
  const team = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role }).from(users)
  return <main className="mx-auto min-h-screen max-w-6xl p-6"><Card><CardHeader><CardTitle>Utilisateurs et rôles</CardTitle></CardHeader><CardContent className="flex flex-col gap-3">{team.map((user) => <div key={user.id} className="flex flex-col gap-2 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-medium">{user.name}</p><p className="text-sm text-muted-foreground">{user.email}</p></div><Badge variant="secondary">{user.role}</Badge></div>)}</CardContent></Card></main>
}
