import { redirect } from "next/navigation"
import { AuthForm } from "@/components/auth-form"
import { WelcomeAuthScreen } from "@/components/auth-welcome"
import { getCurrentUser } from "@/lib/auth"

export default async function SignUpPage() {
  if (await getCurrentUser()) redirect("/")
  return <WelcomeAuthScreen><main className="flex min-h-screen items-center justify-center bg-[#f5f5f4] p-4 sm:p-8"><AuthForm mode="sign-up" /></main></WelcomeAuthScreen>
}
