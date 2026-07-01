const STEPS = [
  {
    n: "01",
    title: "Validación del prototipo",
    desc: "Probar el prototipo con empresas de alquiler reales y recoger feedback del sector.",
  },
  {
    n: "02",
    title: "Diseño de base de datos",
    desc: "Modelar inventario, clientes, reservas y rutas con integridad referencial.",
  },
  {
    n: "03",
    title: "Lógica de stock por fecha",
    desc: "Implementar el motor de disponibilidad y bloqueo por rangos de fecha.",
  },
  {
    n: "04",
    title: "Integración de mapas",
    desc: "Conectar geolocalización y optimización de rutas de entrega y recolección.",
  },
  {
    n: "05",
    title: "Modelo de negocio SaaS",
    desc: "Definir planes, suscripciones y estrategia de escalamiento comercial.",
  },
]

export function TimelineSection() {
  return (
    <section id="roadmap" className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Próximos pasos</p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Ruta de trabajo del proyecto
          </h2>
        </div>

        <ol className="relative mt-12 border-l border-border pl-6 sm:mx-auto sm:max-w-3xl">
          {STEPS.map((s) => (
            <li key={s.n} className="relative mb-8 last:mb-0">
              <span className="absolute -left-[35px] flex h-6 w-6 items-center justify-center rounded-full border-2 border-accent bg-background text-[10px] font-bold text-accent">
                {s.n}
              </span>
              <div className="rounded-xl border border-border bg-card p-5">
                <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
