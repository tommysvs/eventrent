import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { verifySessionToken } from '@/lib/auth'
import { pgPool } from '@/lib/pg'

export const dynamic = 'force-dynamic'

const EVENT_TYPE_OPTIONS = ['ALL', 'user_action', 'security', 'system'] as const
const SEVERITY_OPTIONS = ['ALL', 'info', 'warning', 'critical'] as const
const ACTION_OPTIONS = [
  'ALL',
  'login',
  'logout',
  'register',
  'failed_login',
  'account_locked',
  'access_denied',
  'create',
  'update',
  'delete',
  'view',
  'system_error',
  'config_change',
] as const

type SearchParams = {
  eventType?: string
  severity?: string
  action?: string
  user?: string
  limit?: string
}

type LogRow = {
  id: bigint
  userId: bigint | null
  eventType: string
  action: string
  severity: string
  description: string | null
  endpoint: string | null
  statusCode: number | null
  createdAt: Date
  username: string | null
  name: string | null
}

type CountRow = {
  count: number
}

function getEnumValue<T extends string>(value: string | undefined, values: readonly T[]) {
  if (!value) {
    return null
  }

  return values.includes(value as T) ? (value as T) : null
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value)
}

function formatEnumLabel(value: string) {
  return value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function severityVariant(severity: string) {
  if (severity.toLowerCase() === 'critical') {
    return 'destructive'
  }

  if (severity.toLowerCase() === 'warning') {
    return 'secondary'
  }

  return 'default'
}

export default async function LogsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const cookieStore = await cookies()
  const sessionToken = cookieStore.get('eventrent_session')?.value
  const session = sessionToken ? verifySessionToken(sessionToken) : null

  if (!session) {
    redirect('/login')
  }

  const userId = BigInt(session.sub)

  const roleCheck = await pgPool.query<{ is_admin: boolean }>(
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

  const isAdmin = roleCheck.rows[0]?.is_admin === true

  if (!isAdmin) {
    redirect('/demo')
  }

  const params = await searchParams
  const eventType = getEnumValue(params.eventType, EVENT_TYPE_OPTIONS)
  const severity = getEnumValue(params.severity, SEVERITY_OPTIONS)
  const action = getEnumValue(params.action, ACTION_OPTIONS)
  const userQuery = params.user?.trim() || ''
  const limit = Math.min(Math.max(Number(params.limit ?? '25') || 25, 1), 100)

  const whereParts: string[] = []
  const whereValues: Array<string | number> = []

  const addWhere = (sql: string, value: string) => {
    whereValues.push(value)
    whereParts.push(sql.replace('?', `$${whereValues.length}`))
  }

  if (eventType && eventType !== 'ALL') {
    addWhere('l.event_type = ?::log_event_type', eventType)
  }

  if (severity && severity !== 'ALL') {
    addWhere('l.severity = ?::log_severity', severity)
  }

  if (action && action !== 'ALL') {
    addWhere('l.action = ?::log_action', action)
  }

  if (userQuery) {
    const likeTerm = `%${userQuery}%`
    whereValues.push(likeTerm, likeTerm, likeTerm)
    whereParts.push(
      `(
        l.description ILIKE $${whereValues.length - 2}
        OR u.username ILIKE $${whereValues.length - 1}
        OR u.name ILIKE $${whereValues.length}
      )`,
    )
  }

  const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : ''
  const limitPlaceholder = `$${whereValues.length + 1}`

  const [logsResult, totalRows, securityRows, criticalRows, failedLoginRows] = await Promise.all([
    pgPool.query<LogRow>(
      `
        SELECT
          l.id,
          l.user_id AS "userId",
          l.event_type AS "eventType",
          l.action,
          l.severity,
          l.description,
          l.endpoint,
          l.status_code AS "statusCode",
          l.created_at AS "createdAt",
          u.username,
          u.name
        FROM logs l
        LEFT JOIN users u ON u.id = l.user_id
        ${whereClause}
        ORDER BY l.created_at DESC
        LIMIT ${limitPlaceholder}
      `,
      [...whereValues, limit],
    ),
    pgPool.query<CountRow>(`SELECT COUNT(*)::int AS count FROM logs`),
    pgPool.query<CountRow>(`SELECT COUNT(*)::int AS count FROM logs WHERE event_type = 'security'::log_event_type`),
    pgPool.query<CountRow>(`SELECT COUNT(*)::int AS count FROM logs WHERE severity = 'critical'::log_severity`),
    pgPool.query<CountRow>(`SELECT COUNT(*)::int AS count FROM logs WHERE action = 'failed_login'::log_action`),
  ])

  const logs: LogRow[] = logsResult.rows as LogRow[]
  const totals = Number(totalRows.rows[0]?.count ?? 0)
  const securityCount = Number(securityRows.rows[0]?.count ?? 0)
  const criticalCount = Number(criticalRows.rows[0]?.count ?? 0)
  const failedLoginCount = Number(failedLoginRows.rows[0]?.count ?? 0)

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,theme(colors.accent/10%),transparent_35%),linear-gradient(180deg,theme(colors.background),theme(colors.secondary/40%))]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <Badge variant="secondary" className="w-fit rounded-full border-accent/20 bg-accent/10 text-accent">
              Auditoria de seguridad
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Visor de logs del sistema
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Consulta eventos de login, registro, errores y acciones de seguridad directamente desde el frontend.
            </p>
          </div>

          <Button render={<a href="/demo" />} nativeButton={false} variant="outline" className="w-fit">
            Volver al demo
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader>
              <CardDescription>Total de logs</CardDescription>
              <CardTitle className="text-3xl">{totals}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Eventos de seguridad</CardDescription>
              <CardTitle className="text-3xl">{securityCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Criticos</CardDescription>
              <CardTitle className="text-3xl">{criticalCount}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardDescription>Intentos fallidos</CardDescription>
              <CardTitle className="text-3xl">{failedLoginCount}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
            <CardDescription>Refina por tipo, severidad, accion, usuario o tamano de pagina.</CardDescription>
          </CardHeader>
          <CardContent>
            <form method="get" className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Evento</span>
                <select name="eventType" defaultValue={eventType ?? 'ALL'} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                  {EVENT_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Severidad</span>
                <select name="severity" defaultValue={severity ?? 'ALL'} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                  {SEVERITY_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Accion</span>
                <select name="action" defaultValue={action ?? 'ALL'} className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm">
                  {ACTION_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Usuario / descripcion</span>
                <input
                  name="user"
                  defaultValue={userQuery}
                  placeholder="Buscar..."
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                />
              </label>

              <label className="space-y-2 text-sm">
                <span className="font-medium text-foreground">Limite</span>
                <input
                  name="limit"
                  type="number"
                  min="1"
                  max="100"
                  defaultValue={limit}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-ring"
                />
              </label>

              <div className="md:col-span-2 xl:col-span-5 flex gap-3">
                <Button type="submit">Aplicar filtros</Button>
                <Button render={<a href="/admin/logs" />} nativeButton={false} variant="ghost">
                  Limpiar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Ultimos eventos</CardTitle>
            <CardDescription>Se muestran los ultimos {limit} registros que coinciden con los filtros actuales.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Evento</TableHead>
                  <TableHead>Accion</TableHead>
                  <TableHead>Severidad</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Descripcion</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      No hay logs para estos filtros.
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id.toString()}>
                      <TableCell>{formatDate(log.createdAt)}</TableCell>
                      <TableCell>
                        <div className="space-y-0.5">
                          <div className="font-medium text-foreground">{log.username ?? 'Sistema'}</div>
                          <div className="text-xs text-muted-foreground">
                            {log.name ?? (log.userId ? `ID ${log.userId.toString()}` : 'Sin usuario')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{formatEnumLabel(log.eventType)}</TableCell>
                      <TableCell>{formatEnumLabel(log.action)}</TableCell>
                      <TableCell>
                        <Badge variant={severityVariant(log.severity)}>{formatEnumLabel(log.severity)}</Badge>
                      </TableCell>
                      <TableCell>{log.statusCode ?? '-'}</TableCell>
                      <TableCell>{log.endpoint ?? '-'}</TableCell>
                      <TableCell className="max-w-[28rem] whitespace-normal text-muted-foreground">
                        {log.description ?? '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
