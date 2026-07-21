import { ArrowRight, CalendarClock } from "lucide-react"
import { Button } from "@/components/ui/button"

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-primary text-primary-foreground">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:py-20">
        <div className="rounded-2xl bg-primary-foreground/5 p-8 text-center sm:p-12">
          <h2 className="text-balance text-2xl font-bold tracking-tight sm:text-3xl">
            Digitaliza tu empresa de alquiler hoy
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-pretty leading-relaxed text-primary-foreground/80">
            Únete a las empresas que ya sincronizan inventario y logística en
            tiempo real con EventRent.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button 
              type="button"
              render={<a href="/login" />} 
              nativeButton={false}
              size="lg" 
              className="gap-2 bg-accent text-accent-foreground hover:bg-accent/90">
              Digitalizar mi Inventario
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-primary-foreground/10 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground">
              <CalendarClock className="h-4 w-4" />
            </span>
            <span className="font-semibold">
              Event<span className="text-accent">Rent</span>
            </span>
          </div>
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} EventRent. Prototipo académico.
          </p>
        </div>
      </div>
    </footer>
  )
}
