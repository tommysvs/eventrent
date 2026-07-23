import { DemoShell } from "@/components/demo/demo-shell"
import { verifySessionToken } from "@/lib/auth"
import { getDemoSnapshot } from "@/lib/demo-store"
import { pgPool } from "@/lib/pg"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Demo · EventRent",
  description:
    "Demo interactiva del panel de EventRent: inventario en tiempo real, calendario de disponibilidad, cotizaciones y logística de entregas.",
}

export default async function DemoPage() {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get("eventrent_session")?.value
  const session = sessionToken ? verifySessionToken(sessionToken) : null
  const userId = session?.sub ? BigInt(session.sub) : null

  let isAdmin = false

  if (userId) {
    const result = await pgPool.query<{ is_admin: boolean }>(
      `
        SELECT EXISTS (
          SELECT 1
          FROM users u
          INNER JOIN roles r ON r.id = u.role_id
          WHERE u.id = $1
            AND lower(r.name) = 'admin'
        ) AS is_admin
      `,
      [userId.toString()],
    )

    isAdmin = result.rows[0]?.is_admin === true
  }

  const initialData = await getDemoSnapshot()
  return <DemoShell initialData={initialData} isAdmin={isAdmin} />
}
