import { betterAuth } from "better-auth"
import { Pool } from "pg"

const baseURL = process.env.BETTER_AUTH_URL
  ? process.env.BETTER_AUTH_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.V0_RUNTIME_URL

const trustedOrigins = [
  "http://localhost:3000",
  "http://localhost:3004",
  ...[process.env.V0_RUNTIME_URL, process.env.V0_DEV_APP_URL, process.env.V0_BUILD_URL, process.env.V0_SANDBOX_URL]
    .filter(Boolean)
    .map((value) => value as string),
]

export const auth = betterAuth({
  database: new Pool({ connectionString: process.env.DATABASE_URL }),
  baseURL,
  trustedOrigins,
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "reception",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
  },
  ...(process.env.NODE_ENV === "development"
    ? {
        advanced: {
          defaultCookieAttributes: {
            sameSite: "none" as const,
            secure: true,
          },
        },
      }
    : {}),
})

export type UserRole = "admin" | "reception" | "housekeeping" | "finance"

export function hasRole(role: string | undefined, allowed: UserRole[]) {
  return !!role && allowed.includes(role as UserRole)
}

export async function getCurrentUser() {
  const { headers } = await import("next/headers")
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user ?? null
}
