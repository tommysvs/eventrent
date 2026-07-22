"use client"

import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/demo/status-badge"
import { SearchField } from "@/components/demo/search-field"
import type { BookingItem, EventBooking, InventoryItem, NewEventBooking, NewQuote, Quote, QuoteItem } from "@/lib/demo-types"
import { currency, quoteTotal } from "@/lib/demo-types"
import { cn } from "@/lib/utils"

type QuoteItemDraft = {
  inventoryId: string
  qty: string
  days: string
  price: string
}

type QuoteFormState = {
  client: string
  event: string
  date: string
  status: Quote["status"]
  items: QuoteItemDraft[]
}

type QuotesViewProps = {
  quotes: Quote[]
  inventory: InventoryItem[]
  bookings: EventBooking[]
  onCreate: (quote: NewQuote) => Promise<string | null>
  onUpdate: (id: string, quote: Quote) => Promise<void>
  onDelete: (id: string) => Promise<void>
  onCreateBooking: (booking: NewEventBooking) => Promise<string | null>
}

const statusOptions: Quote["status"][] = ["borrador", "enviada", "aceptada", "rechazada"]

function emptyItem(): QuoteItemDraft {
  return { inventoryId: "", qty: "1", days: "1", price: "0" }
}

function emptyDraft(): QuoteFormState {
  return {
    client: "",
    event: "",
    date: "2026-07-06",
    status: "borrador",
    items: [emptyItem()],
  }
}

function toDraft(quote: Quote): QuoteFormState {
  return {
    client: quote.client,
    event: quote.event,
    date: quote.date,
    status: quote.status,
    items: quote.items.length > 0
      ? quote.items.map((item) => ({ inventoryId: item.inventoryId, qty: String(item.qty), days: String(item.days), price: String(item.price) }))
      : [emptyItem()],
  }
}

function draftToItems(items: QuoteItemDraft[]): QuoteItem[] {
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

function bookingPayloadFromQuote(quote: Quote): NewEventBooking {
  const totalItems = quote.items.reduce((sum, item) => sum + item.qty, 0)

  return {
    quoteId: quote.id,
    client: quote.client,
    eventName: quote.event,
    date: quote.date,
    endDate: quote.date,
    items: totalItems,
    status: "pendiente",
    paymentStatus: "pendiente",
    value: quoteTotal(quote) * 1.21,
    bookingItems: quote.items.map((item) => ({
      inventoryId: item.inventoryId,
      inventoryName: item.inventoryName,
      qty: item.qty,
      days: item.days,
      price: item.price,
    })),
  }
}

export function QuotesView({ quotes, inventory, bookings, onCreate, onUpdate, onDelete, onCreateBooking }: QuotesViewProps) {
  const [query, setQuery] = useState("")
  const [activeId, setActiveId] = useState(quotes[0]?.id ?? "")
  const [draft, setDraft] = useState<QuoteFormState>(quotes[0] ? toDraft(quotes[0]) : emptyDraft())
  const [error, setError] = useState("")

  const inventoryById = useMemo(() => new Map(inventory.map((item) => [item.id, item])), [inventory])
  const active = useMemo(() => quotes.find((quote) => quote.id === activeId), [quotes, activeId])
  const bookingByQuoteId = useMemo(() => new Map(bookings.filter((booking) => booking.quoteId).map((booking) => [booking.quoteId as string, booking])), [bookings])
  const normalizedQuery = query.trim().toLowerCase()

  const filteredQuotes = useMemo(() => {
    if (!normalizedQuery) {
      return quotes
    }

    return quotes.filter((quote) => {
      const haystack = [quote.id, quote.client, quote.event, quote.status, ...quote.items.map((item) => item.inventoryName ?? item.inventoryId)].join(" ").toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [quotes, normalizedQuery])

  useEffect(() => {
    if (active) {
      setDraft(toDraft(active))
    } else {
      setDraft(emptyDraft())
    }
  }, [active])

  function startCreate() {
    setActiveId("")
    setDraft(emptyDraft())
    setError("")
  }

  function selectQuote(quote: Quote) {
    setActiveId(quote.id)
    setDraft(toDraft(quote))
    setError("")
  }

  function updateItem(index: number, next: Partial<QuoteItemDraft>) {
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

    let items: QuoteItem[]
    try {
      items = draftToItems(draft.items)
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Items inválidos")
      return
    }

    if (items.length === 0) {
      setError("Agrega al menos un producto al presupuesto.")
      return
    }

    const payload: NewQuote = {
      client: draft.client.trim(),
      event: draft.event.trim(),
      date: draft.date,
      status: draft.status,
      items: items.map((item) => ({
        inventoryId: item.inventoryId,
        inventoryName: inventoryById.get(item.inventoryId)?.name,
        qty: item.qty,
        days: item.days,
        price: item.price,
      })),
    }

    if (!payload.client || !payload.event) {
      setError("Completa cliente y evento.")
      return
    }

    if (active) {
      await onUpdate(active.id, { ...payload, id: active.id, total: quoteTotal({ ...payload, id: active.id, total: 0 }) })
      setActiveId(active.id)
    } else {
      const createdId = await onCreate(payload)
      setActiveId(createdId ?? "")
    }

    setError("")
  }

  async function handleDelete(id: string) {
    if (!globalThis.confirm(`Eliminar ${id}?`)) {
      return
    }

    await onDelete(id)

    if (activeId === id) {
      startCreate()
    }
  }

  async function handleConvertToBooking(quote: Quote) {
    if (bookingByQuoteId.has(quote.id)) {
      setError("Esta cotización ya tiene una reserva creada.")
      return
    }

    await onCreateBooking(bookingPayloadFromQuote(quote))
    setError("")
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-2">
        <SearchField
          value={query}
          onChange={setQuery}
          placeholder="Buscar cotizaciones..."
          ariaLabel="Buscar cotizaciones"
        />
        <Button type="button" className="w-full" onClick={startCreate}>
          Nueva cotización
        </Button>
        {filteredQuotes.map((quote) => (
          <button
            key={quote.id}
            onClick={() => selectQuote(quote)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-colors",
              quote.id === activeId
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:bg-secondary",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{quote.id}</span>
              <StatusBadge status={quote.status} />
            </div>
            <p className="mt-1 font-medium text-foreground">{quote.event}</p>
            <p className="text-sm text-muted-foreground">{quote.client}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">{currency.format(quoteTotal(quote) * 1.21)}</p>
          </button>
        ))}
        {filteredQuotes.length === 0 && <p className="rounded-lg border border-dashed border-border px-4 py-6 text-sm text-muted-foreground">No se encontraron cotizaciones con esos criterios.</p>}
      </div>

      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{active ? active.event : "Nueva cotización"}</CardTitle>
            <div className="flex items-center gap-2">
              {active && <StatusBadge status={active.status} />}
              {active?.status === "aceptada" && !bookingByQuoteId.has(active.id) && (
                <Button type="button" variant="outline" size="sm" onClick={() => handleConvertToBooking(active)}>
                  Crear reserva
                </Button>
              )}
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {active ? `${active.client} · ${active.id} · ${new Date(active.date).toLocaleDateString("es-ES", { dateStyle: "long" })}` : "Crea una nueva cotización o selecciona una existente."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {active ? (
            <>
              <div className="space-y-3">
                {active.items.map((item, index) => (
                  <div key={`${item.inventoryId}-${index}`} className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.inventoryName ?? inventoryById.get(item.inventoryId)?.name ?? item.inventoryId}</p>
                      <p className="text-muted-foreground">
                        {item.qty} uds × {item.days} día(s) × {currency.format(item.price)}
                      </p>
                    </div>
                    <span className="font-medium text-foreground">{currency.format(item.qty * item.days * item.price)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{currency.format(quoteTotal(active))}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>IVA (21%)</span>
                  <span>{currency.format(quoteTotal(active) * 0.21)}</span>
                </div>
                <div className="flex justify-between pt-1 text-base font-semibold text-foreground">
                  <span>Total</span>
                  <span>{currency.format(quoteTotal(active) * 1.21)}</span>
                </div>
              </div>
            </>
          ) : null}

          {error && <p className="text-sm text-destructive">{error}</p>}

          <form className="space-y-3 rounded-xl border border-border p-4" onSubmit={handleSubmit}>
            <div className="grid gap-3 md:grid-cols-2">
              <Input value={draft.client} onChange={(event) => setDraft((current) => ({ ...current, client: event.target.value }))} placeholder="Cliente" />
              <Input value={draft.event} onChange={(event) => setDraft((current) => ({ ...current, event: event.target.value }))} placeholder="Evento" />
              <Input type="date" value={draft.date} onChange={(event) => setDraft((current) => ({ ...current, date: event.target.value }))} />
              <Select value={draft.status} onValueChange={(value) => setDraft((current) => ({ ...current, status: value as Quote["status"] }))}>
                <SelectTrigger className="w-full" aria-label="Estado quote">
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
                  <div key={`${index}-${item.inventoryId}`} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-5">
                    <div className="space-y-2 md:col-span-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Producto</p>
                      <Select value={item.inventoryId} onValueChange={(value) => updateItem(index, { inventoryId: value ?? "" })}>
                        <SelectTrigger className="w-full" aria-label={`Producto ${index + 1}`}>
                          <SelectValue placeholder="Selecciona inventario" />
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
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Cantidad</p>
                      <Input type="number" min="1" value={item.qty} onChange={(event) => updateItem(index, { qty: event.target.value })} placeholder="Cantidad" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Días</p>
                      <Input type="number" min="1" value={item.days} onChange={(event) => updateItem(index, { days: event.target.value })} placeholder="Días" />
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Precio</p>
                      <div className="flex items-center gap-2">
                        <Input type="number" step="0.01" value={item.price} onChange={(event) => updateItem(index, { price: event.target.value })} placeholder="Precio" />
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeItem(index)}>
                          Quitar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap justify-between gap-2">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={startCreate}>
                  Limpiar
                </Button>
                {active && (
                  <Button type="button" variant="destructive" onClick={() => handleDelete(active.id)}>
                    Eliminar
                  </Button>
                )}
              </div>
              <Button type="submit">{active ? "Actualizar" : "Crear"}</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}