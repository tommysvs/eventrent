"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StatusBadge } from "@/components/demo/status-badge"
import { bookings, kpis, currency } from "@/lib/demo-data"
import { Boxes, CalendarCheck, TrendingUp, Truck, FileText, PackageCheck } from "lucide-react"

const stats = [
  {
    label: "Utilización de inventario",
    value: `${kpis.utilization}%`,
    icon: Boxes,
    hint: "+6% vs. mes anterior",
  },
  {
    label: "Eventos activos",
    value: kpis.activeBookings,
    icon: CalendarCheck,
    hint: "Próximos 14 días",
  },
  {
    label: "Ingresos del mes",
    value: currency.format(kpis.monthlyRevenue),
    icon: TrendingUp,
    hint: "+12% vs. objetivo",
  },
  {
    label: "Entregas a tiempo",
    value: `${kpis.onTimeDelivery}%`,
    icon: Truck,
    hint: "Últimos 30 días",
  },
  {
    label: "Cotizaciones pendientes",
    value: kpis.pendingQuotes,
    icon: FileText,
    hint: "3 requieren seguimiento",
  },
  {
    label: "Piezas en circulación",
    value: kpis.itemsOut.toLocaleString("es-ES"),
    icon: PackageCheck,
    hint: "En 14 eventos",
  },
]

export function OverviewView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-start justify-between gap-4 p-5">
              <div>
                <p className="text-sm text-muted-foreground">{s.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{s.value}</p>
                <p className="mt-1 text-xs text-accent">{s.hint}</p>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
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
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-foreground">{b.eventName}</p>
                  <p className="text-sm text-muted-foreground">
                    {b.client} · {b.items} piezas
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(b.date).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                    </p>
                    <p className="text-xs text-muted-foreground">{currency.format(b.value)}</p>
                  </div>
                  <StatusBadge status={b.status} />
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
            {[
              { name: "Sillas", used: 36 },
              { name: "Mesas", used: 62 },
              { name: "Estructuras", used: 84 },
              { name: "Mobiliario lounge", used: 91 },
              { name: "Barras", used: 44 },
            ].map((c) => (
              <div key={c.name} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{c.name}</span>
                  <span className="text-muted-foreground">{c.used}% en uso</span>
                </div>
                <Progress value={c.used} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
