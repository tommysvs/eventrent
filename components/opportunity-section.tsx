import { CheckCircle2, PiggyBank, Rocket, BarChart3 } from "lucide-react"

const BENEFITS = [
  {
    icon: CheckCircle2,
    title: "Cero errores de reserva",
    desc: "El bloqueo automático de stock por fechas elimina por completo el overbooking.",
  },
  {
    icon: PiggyBank,
    title: "Ahorro logístico",
    desc: "Rutas optimizadas que reducen kilómetros, combustible y horas de operación.",
  },
  {
    icon: Rocket,
    title: "Más ventas",
    desc: "Respuestas y cotizaciones inmediatas que cierran clientes antes que la competencia.",
  },
  {
    icon: BarChart3,
    title: "Analítica rentable",
    desc: "Descubre tus productos más rentables y toma decisiones basadas en datos.",
  },
]

export function OpportunitySection() {
  return (
    <section id="oportunidad" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">La oportunidad</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Convierte cada operación en una ventaja competitiva
          </h2>
        </div>

        <div className="mt-12 overflow-hidden rounded-2xl border border-border bg-background">
          <div className="grid divide-y divide-border sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 lg:[&>*:not(:last-child)]:border-r sm:[&>*:nth-child(odd)]:border-r [&>*]:border-border">
            {BENEFITS.map((b) => (
              <div key={b.title} className="p-6 lg:p-8">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <b.icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-base font-semibold text-foreground">{b.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
