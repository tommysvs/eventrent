"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { OverviewView } from "./overview-view"
import { InventoryView } from "./inventory-view"
import { CalendarView } from "./calendar-view"
import { QuotesView } from "./quotes-view"
import { LogisticsView } from "./logistics-view"
import { MovementsView } from "./movements-view"
import type {
  Delivery,
  DemoSnapshot,
  EventBooking,
  InventoryItem,
  NewDelivery,
  NewEventBooking,
  NewInventoryItem,
  NewQuote,
  Quote,
} from "@/lib/demo-types"
import {
  LayoutDashboard,
  Boxes,
  CalendarDays,
  FileText,
  Truck,
  History,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const nav = [
  { id: "overview", label: "Panel general", icon: LayoutDashboard },
  { id: "quotes", label: "Cotizaciones", icon: FileText },
  { id: "calendar", label: "Disponibilidad", icon: CalendarDays },
  { id: "logistics", label: "Logística", icon: Truck },
  { id: "inventory", label: "Inventario", icon: Boxes },
  { id: "movements", label: "Movimientos", icon: History },
] as const

type ViewId = (typeof nav)[number]["id"]

type DemoShellProps = {
  initialData: DemoSnapshot
}

const titles: Record<ViewId, { title: string; subtitle: string }> = {
  overview: { title: "Panel general", subtitle: "Resumen operativo en tiempo real" },
  inventory: { title: "Inventario", subtitle: "Stock, disponibilidad y estado de cada artículo" },
  calendar: { title: "Calendario de disponibilidad", subtitle: "Reservas y eventos programados" },
  quotes: { title: "Cotizaciones", subtitle: "Presupuestos generados automáticamente" },
  logistics: { title: "Logística de entregas", subtitle: "Rutas optimizadas del día" },
  movements: { title: "Movimientos de inventario", subtitle: "Historial de reservas, ajustes y entregas" },
}

export function DemoShell({ initialData }: DemoShellProps) {
  const [view, setView] = useState<ViewId>("overview")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [data, setData] = useState(initialData)
  const router = useRouter()

  useEffect(() => {
    setData(initialData)
  }, [initialData])

  const active = titles[view]

  async function refreshData() {
    const response = await fetch("/api/demo")
    if (!response.ok) {
      throw new Error("No se pudo sincronizar la demo")
    }

    setData(await response.json())
  }

  async function mutate(resource: string, method: "POST" | "PATCH" | "DELETE", body?: unknown, id?: string) {
    const url = id ? `/api/demo/${resource}?id=${encodeURIComponent(id)}` : `/api/demo/${resource}`
    const response = await fetch(url, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    })

    const payload = await response.json().catch(() => null)
    if (!response.ok) {
      throw new Error(payload?.error ?? "No se pudo guardar el registro")
    }

    await refreshData()

    if (method === "POST") {
      return payload?.id ?? null
    }

    return payload
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.replace("/login")
    router.refresh()
  }

  const inventoryActions = {
    create: (item: NewInventoryItem) => mutate("inventory", "POST", item),
    update: (id: string, item: InventoryItem) => mutate("inventory", "PATCH", item, id),
    remove: (id: string) => mutate("inventory", "DELETE", undefined, id),
  }

  const bookingActions = {
    create: (booking: NewEventBooking) => mutate("bookings", "POST", booking),
    update: (id: string, booking: EventBooking) => mutate("bookings", "PATCH", booking, id),
    remove: (id: string) => mutate("bookings", "DELETE", undefined, id),
  }

  const quoteActions = {
    create: (quote: NewQuote) => mutate("quotes", "POST", quote),
    update: (id: string, quote: Quote) => mutate("quotes", "PATCH", quote, id),
    remove: (id: string) => mutate("quotes", "DELETE", undefined, id),
  }

  const deliveryActions = {
    create: (delivery: NewDelivery) => mutate("deliveries", "POST", delivery),
    update: (id: string, delivery: Delivery) => mutate("deliveries", "PATCH", delivery, id),
    remove: (id: string) => mutate("deliveries", "DELETE", undefined, id),
  }

  return (
    <div className="flex min-h-screen bg-secondary/40">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-border bg-card transition-transform lg:static lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-5">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Boxes className="h-4 w-4" />
            </div>
            <span className="font-semibold text-foreground">EventRent</span>
          </Link>
          <button
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setView(item.id)
                setMobileOpen(false)
              }}
              className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                view === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <Button
            render={<button type="button" onClick={handleLogout} />}
            nativeButton
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <LogOut className="h-4 w-4" />
            Cerrar sesión
          </Button>
        </div>
      </aside>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-foreground/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-4 border-b border-border bg-card/80 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu className="h-5 w-5 text-foreground" />
            </button>
            <div>
              <h1 className="text-base font-semibold text-foreground sm:text-lg">{active.title}</h1>
              <p className="hidden text-xs text-muted-foreground sm:block">{active.subtitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">ER</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {view === "overview" && <OverviewView snapshot={data} />}
          {view === "inventory" && (
            <InventoryView
              inventory={data.inventory}
              onCreate={inventoryActions.create}
              onUpdate={inventoryActions.update}
              onDelete={inventoryActions.remove}
            />
          )}
          {view === "calendar" && (
            <CalendarView
              bookings={data.bookings}
              quotes={data.quotes}
              inventory={data.inventory}
              onCreate={bookingActions.create}
              onUpdate={bookingActions.update}
              onDelete={bookingActions.remove}
            />
          )}
          {view === "quotes" && (
            <QuotesView
              quotes={data.quotes}
              inventory={data.inventory}
              bookings={data.bookings}
              onCreate={quoteActions.create}
              onUpdate={quoteActions.update}
              onDelete={quoteActions.remove}
              onCreateBooking={bookingActions.create}
            />
          )}
          {view === "logistics" && (
            <LogisticsView
              deliveries={data.deliveries}
              bookings={data.bookings}
              onCreate={deliveryActions.create}
              onUpdate={deliveryActions.update}
              onDelete={deliveryActions.remove}
            />
          )}
          {view === "movements" && <MovementsView movements={data.inventoryMovements} />}
        </main>
      </div>
    </div>
  )
}