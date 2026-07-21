"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/demo/status-badge"
import type { InventoryMovement } from "@/lib/demo-types"
import { cn } from "@/lib/utils"

type MovementsViewProps = {
  movements: InventoryMovement[]
}

export function MovementsView({ movements }: MovementsViewProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de inventario</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {movements.length === 0 && <p className="text-sm text-muted-foreground">Todavía no hay movimientos registrados.</p>}

          {movements.map((movement) => (
            <div key={`${movement.inventoryId}-${movement.createdAt}-${movement.movementType}`} className="rounded-lg border border-border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{movement.inventoryName ?? movement.inventoryId}</p>
                    <StatusBadge status={movement.movementType} />
                    {movement.bookingCode && <span className="text-xs text-muted-foreground">{movement.bookingCode}</span>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {movement.notes ?? "Movimiento generado por sistema"}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{new Date(movement.createdAt).toLocaleString("es-ES")}</p>
              </div>

              <Separator className="my-3" />

              <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Cantidad</p>
                  <p className="font-medium text-foreground">{movement.quantity}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Disponible</p>
                  <p className="font-medium text-foreground">
                    {movement.previousAvailable} → {movement.newAvailable}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Reservado</p>
                  <p className="font-medium text-foreground">
                    {movement.previousReserved} → {movement.newReserved}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Booking</p>
                  <p className={cn("font-medium text-foreground", !movement.bookingId && "text-muted-foreground")}>{movement.bookingId ?? "Manual"}</p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
