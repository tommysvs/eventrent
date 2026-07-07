"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { OverviewView } from "@/components/demo/overview-view"
import { InventoryView } from "@/components/demo/inventory-view"
import { CalendarView } from "@/components/demo/calendar-view"
import { QuotesView } from "@/components/demo/quotes-view"
import { LogisticsView } from "@/components/demo/logistics-view"
import {
  LayoutDashboard,
  Boxes,
  CalendarDays,
  FileText,
  Truck,
  ArrowLeft,
  Menu,
  X,
} from "lucide-react"

const nav = [
  { id: "overview", label: "Panel general", icon: LayoutDashboard },
  { id: "inventory", label: "Inventario", icon: Boxes },
  { id: "calendar", label: "Disponibilidad", icon: CalendarDays },
  { id: "quotes", label: "Cotizaciones", icon: FileText },
  { id: "logistics", label: "Logística", icon: Truck },
] as const

type ViewId = (typeof nav)[number]["id"]

const titles: Record<ViewId, { title: string; subtitle: string }> = {
  overview: { title: "Panel general", subtitle: "Resumen operativo en tiempo real" },
  inventory: { title: "Inventario", subtitle: "Stock, disponibilidad y estado de cada artículo" },
  calendar: { title: "Calendario de disponibilidad", subtitle: "Reservas y eventos programados" },
  quotes: { title: "Cotizaciones", subtitle: "Presupuestos generados automáticamente" },
  logistics: { title: "Logística de entregas", subtitle: "Rutas optimizadas del día" },
}

export function DemoShell() {
  const [view, setView] = useState<ViewId>("overview")
  const [mobileOpen, setMobileOpen] = useState(false)

  const active = titles[view]

  return (
    <div className="flex min-h-screen bg-secondary/40">
      {/* Sidebar */}
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
            render={<Link href="/" />}
            nativeButton={false}
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al inicio
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

      {/* Main */}
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
            <span className="hidden rounded-full bg-accent/15 px-3 py-1 text-xs font-medium text-accent sm:inline">
              Demo · datos de ejemplo
            </span>
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-primary text-primary-foreground text-xs">ER</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">
          {view === "overview" && <OverviewView />}
          {view === "inventory" && <InventoryView />}
          {view === "calendar" && <CalendarView />}
          {view === "quotes" && <QuotesView />}
          {view === "logistics" && <LogisticsView />}
        </main>
      </div>
    </div>
  )
}
