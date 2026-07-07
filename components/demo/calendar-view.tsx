"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StatusBadge } from "@/components/demo/status-badge"
import { bookings, currency } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

// Demo fixed to July 2026 where the sample bookings live.
const YEAR = 2026
const MONTH = 6 // July (0-indexed)

function bookingsForDay(day: number) {
  const iso = `${YEAR}-${String(MONTH + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
  return bookings.filter((b) => iso >= b.date && iso <= b.endDate)
}

export function CalendarView() {
  const [selected, setSelected] = useState<number | null>(11)

  const { cells, monthLabel } = useMemo(() => {
    const first = new Date(YEAR, MONTH, 1)
    const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate()
    // getDay: 0=Sun. Convert to Monday-first offset.
    const startOffset = (first.getDay() + 6) % 7
    const arr: (number | null)[] = Array(startOffset).fill(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(d)
    return {
      cells: arr,
      monthLabel: first.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
    }
  }, [])

  const selectedBookings = selected ? bookingsForDay(selected) : []

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base capitalize">{monthLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {weekDays.map((d) => (
              <div key={d} className="py-1">
                {d}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />
              const dayBookings = bookingsForDay(day)
              const hasEvents = dayBookings.length > 0
              const isSelected = selected === day
              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "flex aspect-square flex-col items-start rounded-lg border p-1.5 text-left transition-colors",
                    isSelected
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-secondary",
                  )}
                  aria-label={`Día ${day}${hasEvents ? `, ${dayBookings.length} eventos` : ""}`}
                >
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-primary" : "text-foreground",
                    )}
                  >
                    {day}
                  </span>
                  <div className="mt-auto flex w-full flex-wrap gap-0.5">
                    {dayBookings.slice(0, 3).map((b) => (
                      <span
                        key={b.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          b.status === "confirmado" && "bg-accent",
                          b.status === "pendiente" && "bg-amber-500",
                          b.status === "entregado" && "bg-primary",
                        )}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-accent" /> Confirmado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500" /> Pendiente
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-primary" /> Entregado
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {selected
              ? `Eventos del ${selected} de julio`
              : "Selecciona un día"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {selectedBookings.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No hay eventos programados para este día.
            </p>
          )}
          {selectedBookings.map((b) => (
            <div key={b.id} className="rounded-lg border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-foreground">{b.eventName}</p>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{b.client}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-muted-foreground">{b.items} piezas</span>
                <span className="font-medium text-foreground">{currency.format(b.value)}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
