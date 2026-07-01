import { CalendarRange, Calculator, ShieldCheck, Route } from "lucide-react"

const FEATURES = [
  {
    icon: CalendarRange,
    title: "Stock por fechas",
    desc: "Controla la disponibilidad real de cada producto según rangos de fechas de entrega y devolución.",
  },
  {
    icon: Calculator,
    title: "Cotizaciones al instante",
    desc: "Genera presupuestos precisos en segundos combinando productos, cantidades, transporte y descuentos.",
  },
  {
    icon: ShieldCheck,
    title: "Cero doble reserva",
    desc: "El motor de disponibilidad bloquea el stock comprometido y alerta cualquier intento de overbooking.",
  },
  {
    icon: Route,
    title: "Rutas optimizadas",
    desc: "Organiza entregas y recolecciones agrupando destinos para reducir kilómetros y tiempos muertos.",
  },
]

export function ProductSection() {
  return (
    <section id="producto" className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">El producto</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Una sola plataforma para todo tu negocio de alquiler
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            EventRent conecta inventario, calendario, cotizaciones y logística en
            un flujo de trabajo inteligente y sin fricción.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-border bg-background p-6 transition-shadow hover:shadow-md"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <f.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
