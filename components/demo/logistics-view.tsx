"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/demo/status-badge"
import { deliveries } from "@/lib/demo-data"
import { MapPin, Clock, Truck, Route } from "lucide-react"

export function LogisticsView() {
  const totalKm = deliveries.reduce((s, d) => s + d.distanceKm, 0)
  const totalStops = deliveries.reduce((s, d) => s + d.stops, 0)
  const enRoute = deliveries.filter((d) => d.status === "en-ruta").length

  const summary = [
    { label: "Rutas activas hoy", value: deliveries.length, icon: Route },
    { label: "En ruta ahora", value: enRoute, icon: Truck },
    { label: "Paradas totales", value: totalStops, icon: MapPin },
    { label: "Distancia optimizada", value: `${totalKm} km`, icon: Clock },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((s) => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Rutas de entrega de hoy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {deliveries.map((d) => (
            <div
              key={d.id}
              className="flex flex-col gap-3 rounded-lg border border-border p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                  {d.zone.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{d.client}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{d.address}</span>
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-12 text-sm lg:pl-0">
                <div>
                  <p className="text-xs text-muted-foreground">Ventana</p>
                  <p className="font-medium text-foreground">{d.window}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehículo</p>
                  <p className="font-medium text-foreground">{d.driver}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ruta</p>
                  <p className="font-medium text-foreground">
                    {d.stops} paradas · {d.distanceKm} km
                  </p>
                </div>
                <StatusBadge status={d.status} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
