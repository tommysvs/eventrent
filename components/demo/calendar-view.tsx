"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { createPortal } from "react-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StatusBadge } from "@/components/demo/status-badge"
import { SearchField } from "@/components/demo/search-field"
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

function getTodayIso() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
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
  const todayIso = getTodayIso()

  return {
    quoteId: "",
    client: "",
    eventName: "",
    date: todayIso,
    endDate: todayIso,
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
    const quoteItem = item as Quote['items'][number] & { name?: string; inventoryName?: string }
    let matchedInventory: InventoryItem | undefined

    if (quoteItem.inventoryId) {
      matchedInventory = inventoryById.get(quoteItem.inventoryId)
    }

    if (!matchedInventory) {
      matchedInventory = Array.from(inventoryById.values()).find(
        (inventoryItem) => inventoryItem.name === quoteItem.inventoryName || inventoryItem.name === quoteItem.name,
      )
    }

    return {
      inventoryId: matchedInventory?.id ?? quoteItem.inventoryId ?? "",
      qty: String(quoteItem.qty),
      days: String(quoteItem.days),
      price: String(quoteItem.price),
    }
  })
}

function bookingDraftTotal(items: BookingItemDraft[]) {
  return items.reduce((sum, item) => {
    const qty = Number(item.qty)
    const days = Number(item.days)
    const price = Number(item.price)

    if (!Number.isFinite(qty) || !Number.isFinite(days) || !Number.isFinite(price)) {
      return sum
    }

    return sum + qty * days * price
  }, 0)
}

export function CalendarView({ bookings, quotes, inventory, onCreate, onUpdate, onDelete }: CalendarViewProps) {
  const [selected, setSelected] = useState<number | null>(11)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState<BookingFormState>(emptyDraft())
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const todayIso = getTodayIso()
  const noQuoteValue = "__none__"
  const normalizedQuery = query.trim().toLowerCase()

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

  const calculatedTotal = useMemo(() => bookingDraftTotal(draft.items), [draft.items])

  const inventoryById = useMemo(() => new Map(inventory.map((item) => [item.id, item])), [inventory])
  const matchesQuery = (booking: EventBooking) => {
    if (!normalizedQuery) {
      return true
    }

    const haystack = [booking.id, booking.client, booking.eventName, booking.date, booking.endDate, booking.quoteId, booking.status, booking.paymentStatus, booking.value].join(" ").toLowerCase()
    return haystack.includes(normalizedQuery)
  }

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
    return bookings.filter((booking) => iso >= booking.date && iso <= booking.endDate && matchesQuery(booking))
  }

  const selectedBookings = selected ? bookingsForDay(selected) : []

  useEffect(() => {
    if (!isFormOpen) {
      return
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isFormOpen])

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
    setIsFormOpen(true)
  }

  function startEdit(booking: EventBooking) {
    setEditingId(booking.id)
    setDraft(toDraft(booking))
    setSelected(Number(booking.date.slice(8, 10)))
    setError("")
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setDraft(emptyDraft())
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

    if (draft.date < todayIso || draft.endDate < todayIso) {
      setError("La fecha de la reserva no puede ser anterior a hoy.")
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
      value: calculatedTotal,
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

    closeForm()
  }

  async function handleDelete(id: string) {
    if (!globalThis.confirm(`Eliminar ${id}?`)) {
      return
    }

    await onDelete(id)

    if (editingId === id) {
      closeForm()
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base capitalize">{monthLabel}</CardTitle>
            <SearchField
              value={query}
              onChange={setQuery}
              placeholder="Buscar reservas..."
              ariaLabel="Buscar reservas"
              className="sm:max-w-sm"
            />
          </div>
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
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-base">{selected ? `Eventos del ${selected} de julio` : "Selecciona un día"}</CardTitle>
              <Button type="button" variant="outline" size="sm" onClick={startCreate}>
                Nuevo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
              {selectedBookings.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {normalizedQuery ? "No hay eventos que coincidan con la búsqueda para este día." : "No hay eventos programados para este día."}
                </p>
              )}
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
      </div>

      {isFormOpen && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation" onClick={closeForm}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-background shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="booking-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/35 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Reserva</p>
                <h2 id="booking-form-title" className="text-lg font-semibold text-foreground">
                  {editingId ? `Editando ${editingId}` : "Nueva reserva"}
                </h2>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={closeForm} aria-label="Cerrar modal">
                Cerrar
              </Button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-5 py-4 sm:max-h-[82vh]">
              {error && <p className="mb-3 text-sm text-destructive">{error}</p>}
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

                      if (value) {
                        handleQuoteChange(value)
                      }
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
                  <Input type="date" min={todayIso} value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
                  <Input type="date" min={draft.date || todayIso} value={draft.endDate} onChange={(event) => setDraft((current) => ({ ...current, endDate: event.target.value }))} />
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

                <div className="space-y-2 md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Valor total</p>
                  <Input
                    type="text"
                    value={currency.format(calculatedTotal)}
                    readOnly
                    aria-readonly="true"
                    tabIndex={-1}
                    className="bg-muted/60 font-medium text-foreground"
                    placeholder="Valor total"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button type="button" variant="outline" onClick={closeForm}>
                    Cancelar
                  </Button>
                  <Button type="submit">{editingId ? "Actualizar" : "Crear"}</Button>
                </div>
              </form>
            </div>
          </div>
        </div>,
        document.body,
      ) : null}
    </div>
  )
}