"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/demo/status-badge"
import type { DemoSnapshot } from "@/lib/demo-types"
import { currency } from "@/lib/demo-types"
import { Boxes, CalendarCheck, TrendingUp, Truck, FileText, PackageCheck } from "lucide-react"

type OverviewViewProps = {
  snapshot: DemoSnapshot
}

export function OverviewView({ snapshot }: OverviewViewProps) {
  const stats = [
    {
      label: "Utilización de inventario",
      value: `${snapshot.kpis.utilization}%`,
      icon: Boxes,
      hint: "+6% vs. mes anterior",
    },
    {
      label: "Eventos activos",
      value: snapshot.kpis.activeBookings,
      icon: CalendarCheck,
      hint: "Próximos 14 días",
    },
    {
      label: "Ingresos del mes",
      value: currency.format(snapshot.kpis.monthlyRevenue),
      icon: TrendingUp,
      hint: "+12% vs. objetivo",
    },
    {
      label: "Entregas a tiempo",
      value: `${snapshot.kpis.onTimeDelivery}%`,
      icon: Truck,
      hint: "Últimos 30 días",
    },
    {
      label: "Cotizaciones pendientes",
      value: snapshot.kpis.pendingQuotes,
      icon: FileText,
      hint: "3 requieren seguimiento",
    },
    {
      label: "Piezas en circulación",
      value: snapshot.kpis.itemsOut.toLocaleString("es-ES"),
      icon: PackageCheck,
      hint: "En 14 eventos",
    },
  ]

  const bookings = [...snapshot.bookings].sort((left, right) => left.date.localeCompare(right.date))
  const categoryStats = Array.from(
    snapshot.inventory
      .reduce((map, item) => {
        const current = map.get(item.category) ?? { name: item.category, total: 0, used: 0 }
        current.total += item.total
        current.used += item.reserved + item.maintenance
        map.set(item.category, current)
        return map
      }, new Map<string, { name: string; total: number; used: number }>())
      .values(),
  )
    .map((entry) => ({
      name: entry.name,
      used: entry.total > 0 ? Math.round((entry.used / entry.total) * 100) : 0,
    }))
    .sort((left, right) => right.used - left.used)

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{item.value}</p>
                <p className="mt-1 text-xs text-accent">{item.hint}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">Próximos eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{booking.eventName}</p>
                  <p className="text-sm text-muted-foreground">
                    {booking.client} · {booking.items} piezas
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(booking.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </p>
                    <p className="text-xs text-muted-foreground">{currency.format(booking.value)}</p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Capacidad por categoría</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {categoryStats.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{category.name}</span>
                  <span className="text-muted-foreground">{category.used}% en uso</span>
                </div>
                <Progress value={category.used} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}