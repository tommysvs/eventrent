import { FileSpreadsheet, CalendarX, PackageX, Clock } from "lucide-react"

const PROBLEMS = [
  {
    icon: FileSpreadsheet,
    title: "Excel y papel",
    desc: "Registros manuales dispersos que generan errores, versiones desactualizadas y pérdida de información.",
  },
  {
    icon: CalendarX,
    title: "Dobles reservas",
    desc: "El caos del overbooking: comprometer el mismo mobiliario en dos eventos y quedar mal con el cliente.",
  },
  {
    icon: PackageX,
    title: "Mobiliario perdido",
    desc: "Sin trazabilidad, el inventario se daña o desaparece sin que nadie lo detecte a tiempo.",
  },
  {
    icon: Clock,
    title: "Entregas tarde",
    desc: "Rutas mal planificadas provocan retrasos, sobrecostos de transporte y clientes insatisfechos.",
  },
]

export function ProblemSection() {
  return (
    <section id="problema" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">El problema</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            El sector sigue operando con herramientas que fallan
          </h2>
          <p className="mt-4 text-pretty leading-relaxed text-muted-foreground">
            Las empresas de alquiler pierden ingresos y reputación por procesos
            manuales que no escalan.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PROBLEMS.map((p) => (
            <div
              key={p.title}
              className="rounded-xl border border-border bg-card p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                <p.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-base font-semibold text-foreground">{p.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
