import { Timer, BellRing, Smartphone, TrendingUp, Boxes } from "lucide-react"

export function MetricsSection() {
  return (
    <section id="metricas" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Métricas de éxito · OKRs</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Objetivos medibles del proyecto
          </h2>
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3 md:grid-rows-2">
          {/* Big metric */}
          <div className="rounded-2xl border border-border bg-primary p-8 text-primary-foreground md:row-span-2 md:flex md:flex-col md:justify-between">
            <div className="flex items-center gap-2 text-primary-foreground/80">
              <Timer className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Tiempo de cotización</span>
            </div>
            <div className="mt-8">
              <p className="text-6xl font-bold tracking-tight">
                &lt;2<span className="text-3xl text-accent"> min</span>
              </p>
              <p className="mt-3 text-pretty text-sm leading-relaxed text-primary-foreground/80">
                Reducir el tiempo de generación de una cotización completa a menos
                de dos minutos.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BellRing className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Alertas de doble reserva</span>
            </div>
            <p className="mt-4 text-4xl font-bold text-foreground">100%</p>
            <p className="mt-1 text-sm text-muted-foreground">activas y en tiempo real</p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Smartphone className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Flujo en celular</span>
            </div>
            <p className="mt-4 text-4xl font-bold text-foreground">3 clics</p>
            <p className="mt-1 text-sm text-muted-foreground">para completar una reserva</p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <TrendingUp className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Aumento de ventas</span>
            </div>
            <p className="mt-4 text-4xl font-bold text-foreground">+25%</p>
            <p className="mt-1 text-sm text-muted-foreground">por respuestas ágiles</p>
          </div>

          <div className="rounded-2xl border border-border bg-background p-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Boxes className="h-5 w-5 text-accent" />
              <span className="text-sm font-medium">Precisión de inventario</span>
            </div>
            <p className="mt-4 text-4xl font-bold text-foreground">99%</p>
            <p className="mt-1 text-sm text-muted-foreground">de stock sincronizado</p>
          </div>
        </div>
      </div>
    </section>
  )
}
