import { Zap } from "lucide-react"

export function UrgencyBanner() {
  return (
    <section className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:py-16">
        <div className="flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-accent/20 px-3 py-1 text-sm font-medium text-primary-foreground">
              <Zap className="h-4 w-4 text-accent" />
              ¿Por qué resolverlo ahora?
            </span>
            <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
              El sector de eventos crece a un ritmo récord este año.
            </h2>
            <p className="mt-3 text-pretty leading-relaxed text-primary-foreground/80">
              La demanda de bodas, ferias y eventos corporativos se dispara. Quien
              responda con más agilidad y digitalización ganará el mercado. Seguir
              con hojas de cálculo es quedarse atrás.
            </p>
          </div>

          <div className="grid w-full shrink-0 grid-cols-3 gap-4 lg:w-auto">
            {[
              { value: "+11%", label: "Crecimiento anual del sector" },
              { value: "3x", label: "Más rápido para cotizar" },
              { value: "24/7", label: "Disponibilidad en la nube" },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-primary-foreground/10 p-4 text-center">
                <p className="text-2xl font-bold text-accent">{s.value}</p>
                <p className="mt-1 text-xs leading-tight text-primary-foreground/80">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
