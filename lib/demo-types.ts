export type InventoryStatus = "disponible" | "reservado" | "mantenimiento" | "agotado"

export type QuoteStatus = "borrador" | "enviada" | "aceptada" | "rechazada"

export type BookingStatus = "confirmado" | "pendiente" | "entregado" | "cancelado"

export type PaymentStatus = "pendiente" | "parcial" | "pagado" | "cancelado"

export type InventoryMovementType = "reserva" | "liberacion" | "entrega" | "devolucion" | "mantenimiento" | "ajuste"

export type DeliveryStatus = "programada" | "en-ruta" | "entregada" | "cancelada"

export type InventoryItem = {
  id: string
  name: string
  category: string
  total: number
  available: number
  reserved: number
  maintenance: number
  pricePerDay: number
  status: InventoryStatus
}

export type NewInventoryItem = Omit<InventoryItem, "id">

export type QuoteItem = {
  inventoryId: string
  inventoryName?: string
  qty: number
  days: number
  price: number
}

export type EventBooking = {
  id: string
  quoteId: string | null
  client: string
  eventName: string
  date: string
  endDate: string
  items: number
  status: BookingStatus
  paymentStatus: PaymentStatus
  value: number
  bookingItems: BookingItem[]
}

export type NewEventBooking = Omit<EventBooking, "id" | "bookingItems"> & {
  bookingItems?: BookingItem[]
}

export type Quote = {
  id: string
  total: number
  client: string
  event: string
  date: string
  items: QuoteItem[]
  status: QuoteStatus
}

export type NewQuote = Omit<Quote, "id" | "total">

export type BookingItem = {
  inventoryId: string
  inventoryName?: string
  qty: number
  days: number
  price: number
}

export type Delivery = {
  id: string
  bookingId: string
  client: string
  address: string
  zone: string
  window: string
  driver: string
  deliveryDate: string
  status: DeliveryStatus
  stops: number
  distanceKm: number
}

export type NewDelivery = Omit<Delivery, "id">

export type InventoryMovement = {
  inventoryId: string
  inventoryName?: string
  bookingId: string | null
  bookingCode?: string | null
  movementType: InventoryMovementType
  quantity: number
  previousAvailable: number
  newAvailable: number
  previousReserved: number
  newReserved: number
  notes: string | null
  createdAt: string
}

export type DemoKpis = {
  utilization: number
  activeBookings: number
  monthlyRevenue: number
  pendingQuotes: number
  onTimeDelivery: number
  itemsOut: number
}

export type DemoSnapshot = {
  inventory: InventoryItem[]
  bookings: EventBooking[]
  quotes: Quote[]
  deliveries: Delivery[]
  inventoryMovements: InventoryMovement[]
  kpis: DemoKpis
}

export type DemoResource = "inventory" | "bookings" | "quotes" | "deliveries" | "inventory-movements"

export function quoteTotal(q: Quote) {
  return q.items.reduce((sum, item) => sum + item.qty * item.days * item.price, 0)
}

export function bookingTotal(booking: EventBooking) {
  return booking.bookingItems.reduce((sum, item) => sum + item.qty * item.days * item.price, 0)
}

export const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "HNL",
  maximumFractionDigits: 0,
})