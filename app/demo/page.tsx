import { DemoShell } from "@/components/demo/demo-shell"
import { getDemoSnapshot } from "@/lib/demo-store"

export const metadata = {
  title: "Demo · EventRent",
  description:
    "Demo interactiva del panel de EventRent: inventario en tiempo real, calendario de disponibilidad, cotizaciones y logística de entregas.",
}

export default async function DemoPage() {
  const initialData = await getDemoSnapshot()
  return <DemoShell initialData={initialData} />
}
