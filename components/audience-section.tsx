import { Armchair, Heart, Hotel } from "lucide-react"

const AUDIENCES = [
  {
    icon: Armchair,
    title: "Empresas de alquiler",
    desc: "Negocios de sillas, mesas, carpas y mobiliario que necesitan controlar cientos de unidades por evento.",
  },
  {
    icon: Heart,
    title: "Wedding Planners",
    desc: "Planificadores de eventos y bodas que coordinan proveedores, tiempos y montajes con precisión.",
  },
  {
    icon: Hotel,
    title: "Salones de hoteles",
    desc: "Administradores de espacios y salones que gestionan reservas y equipamiento de forma recurrente.",
  },
]

export function AudienceSection() {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Público objetivo</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Diseñado para quienes hacen posibles los eventos
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {AUDIENCES.map((a) => (
            <div
              key={a.title}
              className="group rounded-2xl border border-border bg-background p-8 text-center transition-colors hover:border-accent/40"
            >
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent transition-transform group-hover:scale-105">
                <a.icon className="h-7 w-7" />
              </span>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{a.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{a.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
