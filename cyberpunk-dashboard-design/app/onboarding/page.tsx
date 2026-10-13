import { redirect } from "next/navigation"
import OnboardingScreen from "@/components/onboarding-screen"
import { getCurrentUser } from "@/lib/auth"

export default async function OnboardingPage() {
  if (!(await getCurrentUser())) redirect("/sign-in")
  return <OnboardingScreen />
}
