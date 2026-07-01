import { Check } from "lucide-react"

const CRITERIA = [
  "Diseño 100% responsivo (escritorio y celular)",
  "Simulación de calendario de disponibilidad",
  "Dashboard de inventario en tiempo real",
  "Vista de rutas de entrega y logística",
  "Cotizador rápido con cálculo instantáneo",
  "Sistema de alertas de doble reserva",
]

export function DodSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Definition of Done</p>
            <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Criterios cumplidos por el prototipo
            </h2>
            <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
              Cada entregable del prototipo se valida contra una lista clara de
              criterios de aceptación. Esto es lo que ya está listo y verificado.
            </p>
          </div>

          <ul className="grid gap-3 rounded-2xl border border-border bg-card p-6">
            {CRITERIA.map((c) => (
              <li key={c} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Check className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium text-foreground">{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
