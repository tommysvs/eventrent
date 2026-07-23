import { cookies } from "next/headers"
import { DemoShell } from "@/components/demo/demo-shell"
import { getDemoSnapshot } from "@/lib/demo-store"
import { verifySessionToken } from "@/lib/auth"
import { pgPool } from "@/lib/pg"

export const metadata = {
  title: "Demo · EventRent",
  description:
    "Demo interactiva del panel de EventRent: inventario en tiempo real, calendario de disponibilidad, cotizaciones y logística de entregas.",
}

export const dynamic = "force-dynamic"
const ADMIN_ROLE_ID = BigInt("1")

export default async function DemoPage() {
  const initialData = await getDemoSnapshot()

  const cookieStore = await cookies()
  const token = cookieStore.get("eventrent_session")?.value
  const session = token ? verifySessionToken(token) : null

  let isAdmin = false
  let username: string | null = null
  let name: string | null = null

  if (session) {
    username = session.username
    name = session.name ?? null

    const roleCheck = await pgPool.query<{ role_id: string | number | bigint }>(
      `
        SELECT u.role_id
        FROM users u
        WHERE u.id = $1
        LIMIT 1
      `,
      [session.sub],
    )

    const roleIdRaw = roleCheck.rows[0]?.role_id
    const roleId = roleIdRaw === undefined || roleIdRaw === null ? null : BigInt(String(roleIdRaw))
    isAdmin = roleId === ADMIN_ROLE_ID
  }

  return (
    <DemoShell
      initialData={initialData}
      isAdmin={isAdmin}
      username={username}
      name={name}
    />
  )
}