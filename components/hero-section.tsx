import { ArrowRight, Boxes, CheckCircle2, Sparkles, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const CALENDAR_DAYS = [
  { d: 1 }, { d: 2, status: "booked" }, { d: 3 }, { d: 4, status: "hold" },
  { d: 5, status: "booked" }, { d: 6 }, { d: 7 }, { d: 8, status: "booked" },
  { d: 9 }, { d: 10 }, { d: 11, status: "hold" }, { d: 12, status: "booked" },
  { d: 13 }, { d: 14 }, { d: 15, status: "today" }, { d: 16, status: "booked" },
  { d: 17 }, { d: 18 }, { d: 19, status: "booked" }, { d: 20 }, { d: 21 },
] as const

export function HeroSection() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,theme(colors.accent/12%),transparent_55%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
        <div className="flex flex-col items-start">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-accent"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Plataforma SaaS para el sector eventos
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Event<span className="text-accent">Rent</span>
          </h1>

          <p className="mt-4 text-pretty text-xl font-medium leading-relaxed text-foreground sm:text-2xl">
            Sincronización perfecta para tus eventos: control total de inventario y logística en tiempo real.
          </p>

          <p className="mt-4 max-w-xl text-pretty leading-relaxed text-muted-foreground">
            Centraliza tu inventario, evita dobles reservas, cotiza en segundos y
            optimiza cada ruta de entrega. Digitaliza tu empresa de alquiler de
            mobiliario y toma decisiones con datos en tiempo real.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              Digitalizar mi Inventario
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" className="border-primary/20 text-foreground">
              Probar Demo
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" /> Sin dobles reservas
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-accent" /> Cotización en menos de 2 min
            </span>
          </div>
        </div>

        {/* Simulated dashboard */}
        <div className="relative">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-xl shadow-primary/5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-foreground">Disponibilidad · Marzo</p>
                <p className="text-xs text-muted-foreground">Sillas Tiffany · 500 uds</p>
              </div>
              <Badge className="gap-1 bg-accent/10 text-accent">
                <span className="h-2 w-2 rounded-full bg-accent" /> En vivo
              </Badge>
            </div>

            <div className="grid grid-cols-7 gap-1.5">
              {CALENDAR_DAYS.map((day) => (
                <div
                  key={day.d}
                  className={[
                    "flex aspect-square items-center justify-center rounded-md text-xs font-medium",
                    day.status === "booked"
                      ? "bg-primary text-primary-foreground"
                      : day.status === "hold"
                        ? "bg-accent/20 text-accent"
                        : day.status === "today"
                          ? "ring-2 ring-accent text-foreground"
                          : "bg-secondary text-muted-foreground",
                  ].join(" ")}
                >
                  {day.d}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Reservado
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-accent/30" /> En espera
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-secondary" /> Libre
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Boxes className="h-4 w-4 text-accent" />
                  <span className="text-xs">Stock disponible</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-foreground">312 uds</p>
              </div>
              <div className="rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4 text-accent" />
                  <span className="text-xs">Ocupación</span>
                </div>
                <p className="mt-1 text-lg font-semibold text-foreground">86%</p>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-5 -left-5 hidden rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
            <p className="text-xs text-muted-foreground">Cotización generada</p>
            <p className="text-sm font-semibold text-foreground">$4,850 · 1m 24s</p>
          </div>
        </div>
      </div>
    </section>
  )
}
