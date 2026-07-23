import { DemoShell } from "@/components/demo/demo-shell"
import { verifySessionToken } from "@/lib/auth"
import { getDemoSnapshot } from "@/lib/demo-store"
import { pgPool } from "@/lib/pg"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
const ADMIN_ROLE_ID = BigInt("1")

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
    const result = await pgPool.query<{ role_id: string | number | bigint }>(
      `
        SELECT u.role_id
        FROM users u
        WHERE u.id = $1
        LIMIT 1
      `,
      [userId.toString()],
    )

    const roleIdRaw = result.rows[0]?.role_id
    const roleId = roleIdRaw === undefined || roleIdRaw === null ? null : BigInt(String(roleIdRaw))
    isAdmin = roleId === ADMIN_ROLE_ID
  }

  const initialData = await getDemoSnapshot()
  return (
    <DemoShell
      initialData={initialData}
      isAdmin={isAdmin}
      username={session?.username ?? null}
      name={session?.name ?? null}
    />
  )
}
