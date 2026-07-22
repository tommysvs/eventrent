"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/demo/status-badge"
import type { BookingItem, EventBooking, InventoryItem, NewEventBooking, Quote } from "@/lib/demo-types"
import { currency, quoteTotal } from "@/lib/demo-types"
import { cn } from "@/lib/utils"

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]

const YEAR = 2026
const MONTH = 6

type BookingItemDraft = {
  inventoryId: string
  qty: string
  days: string
  price: string
}

type BookingFormState = {
  quoteId: string
  client: string
  eventName: string
  date: string
  endDate: string
  items: BookingItemDraft[]
  status: EventBooking["status"]
  paymentStatus: EventBooking["paymentStatus"]
  value: string
}

type CalendarViewProps = {
  bookings: EventBooking[]
  quotes: Quote[]
  inventory: InventoryItem[]
  onCreate: (booking: NewEventBooking) => Promise<string | null>
  onUpdate: (id: string, booking: EventBooking) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

function emptyItem(): BookingItemDraft {
  return { inventoryId: "", qty: "1", days: "1", price: "0" }
}

function emptyDraft(): BookingFormState {
  return {
    quoteId: "",
    client: "",
    eventName: "",
    date: "2026-07-11",
    endDate: "2026-07-11",
    items: [emptyItem()],
    status: "pendiente",
    paymentStatus: "pendiente",
    value: "0",
  }
}

function toDraft(booking: EventBooking): BookingFormState {
  return {
    quoteId: booking.quoteId ?? "",
    client: booking.client,
    eventName: booking.eventName,
    date: booking.date,
    endDate: booking.endDate,
    items: booking.bookingItems.length > 0
      ? booking.bookingItems.map((item) => ({ inventoryId: item.inventoryId, qty: String(item.qty), days: String(item.days), price: String(item.price) }))
      : [emptyItem()],
    status: booking.status,
    paymentStatus: booking.paymentStatus,
    value: String(booking.value),
  }
}

function dayToIso(day: number) {
  return `${YEAR}-${String(MONTH + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function parseBookingItems(items: BookingItemDraft[]): BookingItem[] {
  const parsed = items
    .map((item) => ({
      inventoryId: item.inventoryId.trim(),
      qty: Number(item.qty),
      days: Number(item.days),
      price: Number(item.price),
    }))
    .filter((item) => item.inventoryId || item.qty || item.days || item.price)

  if (parsed.some((item) => !item.inventoryId || !Number.isFinite(item.qty) || !Number.isFinite(item.days) || !Number.isFinite(item.price))) {
    throw new Error("Completa inventario, cantidad, días y precio en cada línea.")
  }

  return parsed.map((item) => ({ ...item }))
}

function draftItemsFromQuote(quote: Quote, inventoryById: Map<string, InventoryItem>) {
  return quote.items.map((item) => {
    const matchedInventory = Array.from(inventoryById.values()).find((inventoryItem) => inventoryItem.name === item.name)

    return {
      inventoryId: matchedInventory?.id ?? "",
      qty: String(item.qty),
      days: String(item.days),
      price: String(item.price),
    }
  })
}

export function CalendarView({ bookings, quotes, inventory, onCreate, onUpdate, onDelete }: CalendarViewProps) {
  const [selected, setSelected] = useState<number | null>(11)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<BookingFormState>(emptyDraft())
  const [error, setError] = useState("")
  const formRef = useRef<HTMLDivElement | null>(null)
  const noQuoteValue = "__none__"

  const relatedQuotes = useMemo(() => {
    const pendingQuotes = quotes.filter((quote) => quote.status === "borrador" || quote.status === "enviada")
    if (!draft.quoteId) {
      return pendingQuotes
    }

    const currentQuote = quotes.find((quote) => quote.id === draft.quoteId)
    if (!currentQuote || pendingQuotes.some((quote) => quote.id === currentQuote.id)) {
      return pendingQuotes
    }

    return [currentQuote, ...pendingQuotes]
  }, [draft.quoteId, quotes])

  const inventoryById = useMemo(() => new Map(inventory.map((item) => [item.id, item])), [inventory])

  const { cells, monthLabel } = useMemo(() => {
    const first = new Date(YEAR, MONTH, 1)
    const daysInMonth = new Date(YEAR, MONTH + 1, 0).getDate()
    const startOffset = (first.getDay() + 6) % 7
    const arr: (number | null)[] = Array(startOffset).fill(null)
    for (let day = 1; day <= daysInMonth; day += 1) arr.push(day)
    return {
      cells: arr,
      monthLabel: first.toLocaleDateString("es-ES", { month: "long", year: "numeric" }),
    }
  }, [])

  function bookingsForDay(day: number) {
    const iso = dayToIso(day)
    return bookings.filter((booking) => iso >= booking.date && iso <= booking.endDate)
  }

  const selectedBookings = selected ? bookingsForDay(selected) : []

  useEffect(() => {
    if (editingId) {
      const current = bookings.find((booking) => booking.id === editingId)
      if (current) {
        setDraft(toDraft(current))
      }
    }
  }, [bookings, editingId])

  function startCreate() {
    setEditingId(null)
    setDraft(emptyDraft())
    setSelected(11)
    setError("")
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  function startEdit(booking: EventBooking) {
    setEditingId(booking.id)
    setDraft(toDraft(booking))
    setSelected(Number(booking.date.slice(8, 10)))
    setError("")
  }

  function handleQuoteChange(value: string) {
    const selectedQuote = quotes.find((quote) => quote.id === value)

    setDraft((current) => {
      if (!selectedQuote) {
        return { ...current, quoteId: value }
      }

      return {
        ...current,
        quoteId: value,
        client: selectedQuote.client,
        eventName: selectedQuote.event,
        date: selectedQuote.date,
        endDate: selectedQuote.date,
        value: String(quoteTotal(selectedQuote) * 1.21),
        items: draftItemsFromQuote(selectedQuote, inventoryById),
      }
    })
  }

  function updateItem(index: number, next: Partial<BookingItemDraft>) {
    setDraft((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) => (itemIndex === index ? { ...item, ...next } : item)),
    }))
  }

  function addItem() {
    setDraft((current) => ({ ...current, items: [...current.items, emptyItem()] }))
  }

  function removeItem(index: number) {
    setDraft((current) => {
      const next = current.items.filter((_, itemIndex) => itemIndex !== index)
      return { ...current, items: next.length > 0 ? next : [emptyItem()] }
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    let bookingItems: BookingItem[]
    try {
      bookingItems = parseBookingItems(draft.items)
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Items inválidos")
      return
    }

    if (!draft.quoteId.trim() && bookingItems.length === 0) {
      setError("Agrega al menos un producto o vincula una cotización.")
      return
    }

    const payload: NewEventBooking = {
      quoteId: draft.quoteId.trim() || null,
      client: draft.client.trim(),
      eventName: draft.eventName.trim(),
      date: draft.date,
      endDate: draft.endDate,
      items: bookingItems.reduce((sum, item) => sum + item.qty, 0),
      status: draft.status,
      paymentStatus: draft.paymentStatus,
      value: Number(draft.value),
      bookingItems: bookingItems.map((item) => ({
        inventoryId: item.inventoryId,
        inventoryName: inventoryById.get(item.inventoryId)?.name,
        qty: item.qty,
        days: item.days,
        price: item.price,
      })),
    }

    if (!payload.client || !payload.eventName) {
      setError("Completa cliente y nombre del evento.")
      return
    }

    if (editingId) {
      await onUpdate(editingId, { ...payload, id: editingId, bookingItems: payload.bookingItems ?? [] })
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
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base capitalize">{monthLabel}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs font-medium text-muted-foreground">
            {weekDays.map((day) => (
              <div key={day} className="py-1">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, index) => {
              if (day === null) return <div key={`empty-${index}`} />

              const dayBookings = bookingsForDay(day)
              const hasEvents = dayBookings.length > 0
              const isSelected = selected === day

              return (
                <button
                  key={day}
                  onClick={() => setSelected(day)}
                  className={cn(
                    "flex aspect-square flex-col items-start rounded-lg border p-1.5 text-left transition-colors",
                    isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-secondary",
                  )}
                  aria-label={`Día ${day}${hasEvents ? `, ${dayBookings.length} eventos` : ""}`}
                >
                  <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-foreground")}>{day}</span>
                  <div className="mt-auto flex w-full flex-wrap gap-0.5">
                    {dayBookings.slice(0, 3).map((booking) => (
                      <span
                        key={booking.id}
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          booking.status === "confirmado" && "bg-accent",
                          booking.status === "pendiente" && "bg-amber-500",
                          booking.status === "entregado" && "bg-primary",
                          booking.status === "cancelado" && "bg-destructive",
                        )}
                      />
                    ))}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-accent" /> Confirmado</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-amber-500" /> Pendiente</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-primary" /> Entregado</span>
            <span className="flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-destructive" /> Cancelado</span>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4 lg:col-span-1">
        <Card ref={formRef}>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{selected ? `Eventos del ${selected} de julio` : "Selecciona un día"}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={startCreate}>
                Nuevo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {selectedBookings.length === 0 && <p className="text-sm text-muted-foreground">No hay eventos programados para este día.</p>}
            {selectedBookings.map((booking) => (
              <div key={booking.id} className="space-y-3 rounded-lg border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium text-foreground">{booking.eventName}</p>
                  <StatusBadge status={booking.status} />
                </div>
                <p className="text-sm text-muted-foreground">{booking.client}</p>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{booking.items} piezas</span>
                  <span className="font-medium text-foreground">{currency.format(booking.value)}</span>
                </div>
                <p className="text-xs text-muted-foreground">Pago: {booking.paymentStatus}</p>
                {booking.quoteId && <p className="text-xs text-muted-foreground">Cotización: {booking.quoteId}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => startEdit(booking)}>
                    Editar
                  </Button>
                  <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(booking.id)}>
                    Eliminar
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? `Editando ${editingId}` : "Nueva reserva"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {error && <p className="text-sm text-destructive">{error}</p>}
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cotización relacionada</p>
                <Select
                  value={draft.quoteId || noQuoteValue}
                  onValueChange={(value) => {
                    if (value === noQuoteValue) {
                      setDraft((current) => ({ ...current, quoteId: "" }))
                      return
                    }

                    handleQuoteChange(value)
                  }}
                >
                  <SelectTrigger className="w-full" aria-label="Cotización relacionada">
                    <SelectValue placeholder="Sin cotización" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={noQuoteValue}>Sin cotización</SelectItem>
                    {relatedQuotes.map((quote) => (
                      <SelectItem key={quote.id} value={quote.id}>
                        {quote.id} · {quote.client} · {quote.event} · {currency.format(quoteTotal(quote) * 1.21)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Input value={draft.client} onChange={(event) => setDraft((current) => ({ ...current, client: event.target.value }))} placeholder="Cliente" />
              <Input value={draft.eventName} onChange={(event) => setDraft((current) => ({ ...current, eventName: event.target.value }))} placeholder="Evento" />
              <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
                <Input type="date" value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estado de la reserva</p>
                  <Select value={draft.status} onValueChange={(value) => setDraft((current) => ({ ...current, status: value as EventBooking["status"] }))}>
                    <SelectTrigger className="w-full" aria-label="Estado de la reserva">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="confirmado">Confirmado</SelectItem>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="entregado">Entregado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Estado de pago</p>
                  <Select value={draft.paymentStatus} onValueChange={(value) => setDraft((current) => ({ ...current, paymentStatus: value as EventBooking["paymentStatus"] }))}>
                    <SelectTrigger className="w-full" aria-label="Estado de pago">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="parcial">Parcial</SelectItem>
                      <SelectItem value="pagado">Pagado</SelectItem>
                      <SelectItem value="cancelado">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">Items</p>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    Añadir línea
                  </Button>
                </div>

                <div className="space-y-3">
                  {draft.items.map((item, index) => (
                    <div key={`${index}-${item.inventoryId}`} className="space-y-3 rounded-xl border border-border bg-secondary/30 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-medium text-foreground">Línea {index + 1}</p>
                          <p className="text-xs text-muted-foreground">Selecciona el artículo y completa cantidad, días y precio.</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                          Quitar línea
                        </Button>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Producto del inventario</p>
                        <Select value={item.inventoryId} onValueChange={(value) => updateItem(index, { inventoryId: value ?? "" })}>
                          <SelectTrigger className="w-full" aria-label={`Inventario ${index + 1}`}>
                            <SelectValue placeholder="Selecciona un producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {inventory.map((inventoryItem) => (
                              <SelectItem key={inventoryItem.id} value={inventoryItem.id}>
                                {inventoryItem.id} · {inventoryItem.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cantidad</p>
                          <Input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(event) => updateItem(index, { qty: event.target.value })}
                            placeholder="Unidades"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Días</p>
                          <Input
                            type="number"
                            min="1"
                            value={item.days}
                            onChange={(event) => updateItem(index, { days: event.target.value })}
                            placeholder="Duración del alquiler"
                          />
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Precio por día</p>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.price}
                            onChange={(event) => updateItem(index, { price: event.target.value })}
                            placeholder="Importe unitario"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Input type="number" step="0.01" value={draft.value} onChange={(event) => setDraft((current) => ({ ...current, value: event.target.value }))} placeholder="Valor total" />

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={startCreate}>
                  Cancelar
                </Button>
                <Button type="submit">{editingId ? "Actualizar" : "Crear"}</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}