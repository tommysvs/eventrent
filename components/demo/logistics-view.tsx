"use client"

import { useMemo, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/demo/status-badge"
import type { Delivery, EventBooking, NewDelivery } from "@/lib/demo-types"
import { MapPin, Clock, Truck, Route } from "lucide-react"

type DeliveryFormState = {
  bookingId: string
  client: string
  address: string
  zone: string
  deliveryDate: string
  windowStart: string
  windowEnd: string
  driver: string
  status: Delivery["status"]
  stops: string
  distanceKm: string
}

type LogisticsViewProps = {
  deliveries: Delivery[]
  bookings: EventBooking[]
  onCreate: (delivery: NewDelivery) => Promise<string | null>
  onUpdate: (id: string, delivery: Delivery) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const statusOptions: Delivery["status"][] = ["programada", "en-ruta", "entregada", "cancelada"]

function emptyDraft(): DeliveryFormState {
  return {
    bookingId: "",
    client: "",
    address: "",
    zone: "",
    deliveryDate: "2026-07-11",
    windowStart: "08:00",
    windowEnd: "10:00",
    driver: "",
    status: "programada",
    stops: "0",
    distanceKm: "0",
  }
}

function toDraft(delivery: Delivery): DeliveryFormState {
  const [windowStart = "08:00", windowEnd = "10:00"] = delivery.window.split(" - ")

  return {
    bookingId: delivery.bookingId,
    client: delivery.client,
    address: delivery.address,
    zone: delivery.zone,
    deliveryDate: delivery.deliveryDate,
    windowStart,
    windowEnd,
    driver: delivery.driver,
    status: delivery.status,
    stops: String(delivery.stops),
    distanceKm: String(delivery.distanceKm),
  }
}

function toBookingDefaults(booking: EventBooking) {
  return {
    client: booking.client,
    deliveryDate: booking.date,
  }
}

export function LogisticsView({ deliveries, bookings, onCreate, onUpdate, onDelete }: LogisticsViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<DeliveryFormState>(emptyDraft())
  const [error, setError] = useState("")
  const formRef = useRef<HTMLDivElement | null>(null)

  const bookingById = useMemo(() => new Map(bookings.map((booking) => [booking.id, booking])), [bookings])
  const bookingOptions = useMemo(() => bookings, [bookings])

  const summary = useMemo(() => {
    const totalKm = deliveries.reduce((sum, delivery) => sum + delivery.distanceKm, 0)
    const totalStops = deliveries.reduce((sum, delivery) => sum + delivery.stops, 0)
    const enRoute = deliveries.filter((delivery) => delivery.status === "en-ruta").length

    return [
      { label: "Rutas activas hoy", value: deliveries.length, icon: Route },
      { label: "En ruta ahora", value: enRoute, icon: Truck },
      { label: "Paradas totales", value: totalStops, icon: MapPin },
      { label: "Distancia optimizada", value: `${totalKm} km`, icon: Clock },
    ]
  }, [deliveries])

  function startCreate() {
    setEditingId(null)
    setDraft(emptyDraft())
    setError("")
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function startEdit(delivery: Delivery) {
    setEditingId(delivery.id)
    setDraft(toDraft(delivery))
    setError("")
  }

  function handleBookingChange(value: string) {
    const selectedBooking = bookingById.get(value)

    setDraft((current) => {
      if (!selectedBooking) {
        return { ...current, bookingId: value }
      }

      const defaults = toBookingDefaults(selectedBooking)

      return {
        ...current,
        bookingId: value,
        client: defaults.client,
        deliveryDate: defaults.deliveryDate,
      }
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload: NewDelivery = {
      bookingId: draft.bookingId.trim(),
      client: draft.client.trim(),
      address: draft.address.trim(),
      zone: draft.zone.trim(),
      deliveryDate: draft.deliveryDate,
      window: `${draft.windowStart} - ${draft.windowEnd}`,
      driver: draft.driver.trim(),
      status: draft.status,
      stops: Number(draft.stops),
      distanceKm: Number(draft.distanceKm),
    }

    if (!payload.bookingId || !bookingById.has(payload.bookingId)) {
      setError("Selecciona un booking válido antes de crear la entrega.")
      return
    }

    if (!payload.client || !payload.address) {
      setError("Completa cliente y dirección.")
      return
    }

    if (editingId) {
      await onUpdate(editingId, { ...payload, id: editingId })
    } else {
      await onCreate(payload)
    }

    startCreate()
  }

  async function handleDelete(id: string) {
    if (!globalThis.confirm(`Eliminar ${id}?`)) {
      return
    }

    await onDelete(id)

    if (editingId === id) {
      startCreate()
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary.map((item) => (
          <Card key={item.label}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold text-foreground">{item.value}</p>
                <p className="text-xs text-muted-foreground">{item.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">Rutas de entrega de hoy</CardTitle>
            <Button type="button" onClick={startCreate}>
              Nueva ruta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {deliveries.map((delivery) => (
            <div key={delivery.id} className="flex flex-col gap-3 rounded-lg border border-border p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-primary">
                  {delivery.zone.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground">{delivery.client}</p>
                  <p className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{delivery.address}</span>
                  </p>
                  <p className="text-xs text-muted-foreground">Booking: {delivery.bookingId}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pl-12 text-sm lg:pl-0">
                <div>
                  <p className="text-xs text-muted-foreground">Entrega</p>
                  <p className="font-medium text-foreground">{delivery.deliveryDate}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ventana</p>
                  <p className="font-medium text-foreground">{delivery.window}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Vehículo</p>
                  <p className="font-medium text-foreground">{delivery.driver}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Ruta</p>
                  <p className="font-medium text-foreground">
                    {delivery.stops} paradas · {delivery.distanceKm} km
                  </p>
                </div>
                <StatusBadge status={delivery.status} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(delivery)}>
                    Editar
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(delivery.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card ref={formRef}>
        <CardHeader>
          <CardTitle className="text-base">{editingId ? `Editando ${editingId}` : "Nueva entrega"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {error && <p className="text-sm text-destructive">{error}</p>}
          <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Booking asociado</p>
              <Select value={draft.bookingId} onValueChange={handleBookingChange}>
                <SelectTrigger className="w-full" aria-label="Booking asociado">
                  <SelectValue placeholder="Selecciona un booking" />
                </SelectTrigger>
                <SelectContent>
                  {bookingOptions.map((booking) => (
                    <SelectItem key={booking.id} value={booking.id}>
                      {booking.id} · {booking.client} · {booking.eventName} · {booking.date}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">Se autocompletan cliente y fecha de entrega desde el booking seleccionado.</p>
            </div>
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cliente</p>
              <Input value={draft.client} onChange={(event) => setDraft((current) => ({ ...current, client: event.target.value }))} placeholder="Cliente" />
            </div>
            <Input value={draft.address} onChange={(event) => setDraft((current) => ({ ...current, address: event.target.value }))} placeholder="Dirección" />
            <Input value={draft.zone} onChange={(event) => setDraft((current) => ({ ...current, zone: event.target.value }))} placeholder="Zona" />
            <Input type="date" value={draft.deliveryDate} onChange={(event) => setDraft((current) => ({ ...current, deliveryDate: event.target.value }))} />
            <div className="space-y-2 md:col-span-2">
              <p className="text-sm font-medium text-foreground">Ventana de entrega</p>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Desde</p>
                  <Input
                    type="time"
                    value={draft.windowStart}
                    onChange={(event) => setDraft((current) => ({ ...current, windowStart: event.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Hasta</p>
                  <Input
                    type="time"
                    value={draft.windowEnd}
                    onChange={(event) => setDraft((current) => ({ ...current, windowEnd: event.target.value }))}
                  />
                </div>
              </div>
            </div>
            <Input value={draft.driver} onChange={(event) => setDraft((current) => ({ ...current, driver: event.target.value }))} placeholder="Conductor" />
            <Select value={draft.status} onValueChange={(value) => setDraft((current) => ({ ...current, status: value as Delivery["status"] }))}>
              <SelectTrigger className="w-full" aria-label="Estado de entrega">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((status) => (
                  <SelectItem key={status} value={status} className="capitalize">
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Paradas</p>
                <Input
                  type="number"
                  value={draft.stops}
                  onChange={(event) => setDraft((current) => ({ ...current, stops: event.target.value }))}
                  placeholder="Cantidad de paradas"
                />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Distancia</p>
                <Input
                  type="number"
                  step="0.01"
                  value={draft.distanceKm}
                  onChange={(event) => setDraft((current) => ({ ...current, distanceKm: event.target.value }))}
                  placeholder="Km estimados"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 md:col-span-2">
              <Button type="button" variant="outline" onClick={startCreate}>
                Cancelar
              </Button>
              <Button type="submit">{editingId ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}