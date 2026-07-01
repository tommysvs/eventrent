import { Cpu, Warehouse, Users } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const RISKS = [
  {
    icon: Cpu,
    tag: "Riesgo Técnico",
    title: "Bloqueo de stock por fechas",
    desc: "La lógica de disponibilidad por rangos de fecha es compleja: debe manejar solapamientos, devoluciones y mantenimiento sin permitir overbooking.",
  },
  {
    icon: Warehouse,
    tag: "Riesgo Operativo",
    title: "Reporte manual de bodega",
    desc: "Depender de que el equipo registre entradas y salidas a tiempo. Un reporte tardío desincroniza el inventario real del sistema.",
  },
  {
    icon: Users,
    tag: "Riesgo de Adopción",
    title: "Usuarios tradicionales",
    desc: "Equipos acostumbrados al papel y Excel pueden resistirse al cambio. La curva de adopción requiere una UX simple y capacitación.",
  },
]

export function RisksSection() {
  return (
    <section className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Los riesgos</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Desafíos que enfrentamos con transparencia
          </h2>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {RISKS.map((r) => (
            <div
              key={r.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-7 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/5 text-primary">
                  <r.icon className="h-5 w-5" />
                </span>
                <Badge variant="outline" className="border-accent/30 text-accent">
                  {r.tag}
                </Badge>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{r.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
