import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const styles: Record<string, string> = {
  disponible: "bg-accent/15 text-accent border-accent/30",
  reservado: "bg-primary/10 text-primary border-primary/25",
  mantenimiento: "bg-destructive/10 text-destructive border-destructive/25",
  confirmado: "bg-accent/15 text-accent border-accent/30",
  pendiente: "bg-amber-500/10 text-amber-600 border-amber-500/25",
  entregado: "bg-primary/10 text-primary border-primary/25",
  entregada: "bg-primary/10 text-primary border-primary/25",
  borrador: "bg-muted text-muted-foreground border-border",
  enviada: "bg-primary/10 text-primary border-primary/25",
  aceptada: "bg-accent/15 text-accent border-accent/30",
  rechazada: "bg-destructive/10 text-destructive border-destructive/25",
  programada: "bg-amber-500/10 text-amber-600 border-amber-500/25",
  "en-ruta": "bg-accent/15 text-accent border-accent/30",
}

const labels: Record<string, string> = {
  "en-ruta": "En ruta",
}

export function StatusBadge({ status }: { status: string }) {
  const label = labels[status] ?? status.charAt(0).toUpperCase() + status.slice(1)
  return (
    <Badge variant="outline" className={cn("font-medium capitalize", styles[status])}>
      {label}
    </Badge>
  )
}
