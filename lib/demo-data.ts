export type InventoryStatus = "disponible" | "reservado" | "mantenimiento"

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

export type EventBooking = {
  id: string
  client: string
  eventName: string
  date: string // ISO date
  endDate: string
  items: number
  status: "confirmado" | "pendiente" | "entregado"
  value: number
}

export type Quote = {
  id: string
  client: string
  event: string
  date: string
  items: { name: string; qty: number; days: number; price: number }[]
  status: "borrador" | "enviada" | "aceptada" | "rechazada"
}

export type Delivery = {
  id: string
  client: string
  address: string
  zone: string
  window: string
  driver: string
  status: "programada" | "en-ruta" | "entregada"
  stops: number
  distanceKm: number
}

export const inventory: InventoryItem[] = [
  {
    id: "MB-001",
    name: "Silla Tiffany transparente",
    category: "Sillas",
    total: 500,
    available: 320,
    reserved: 160,
    maintenance: 20,
    pricePerDay: 3.5,
    status: "disponible",
  },
  {
    id: "MB-002",
    name: "Mesa redonda 1.80m",
    category: "Mesas",
    total: 120,
    available: 42,
    reserved: 74,
    maintenance: 4,
    pricePerDay: 12,
    status: "reservado",
  },
  {
    id: "MB-003",
    name: "Carpa modular 6x6m",
    category: "Estructuras",
    total: 18,
    available: 5,
    reserved: 11,
    maintenance: 2,
    pricePerDay: 180,
    status: "reservado",
  },
  {
    id: "MB-004",
    name: "Sofá lounge blanco",
    category: "Mobiliario lounge",
    total: 40,
    available: 0,
    reserved: 34,
    maintenance: 6,
    pricePerDay: 45,
    status: "mantenimiento",
  },
  {
    id: "MB-005",
    name: "Barra de bar iluminada LED",
    category: "Barras",
    total: 25,
    available: 14,
    reserved: 11,
    maintenance: 0,
    pricePerDay: 90,
    status: "disponible",
  },
  {
    id: "MB-006",
    name: "Pista de baile 5x5m",
    category: "Estructuras",
    total: 12,
    available: 3,
    reserved: 9,
    maintenance: 0,
    pricePerDay: 220,
    status: "reservado",
  },
  {
    id: "MB-007",
    name: "Mantel premium (blanco)",
    category: "Textiles",
    total: 800,
    available: 610,
    reserved: 180,
    maintenance: 10,
    pricePerDay: 2.2,
    status: "disponible",
  },
  {
    id: "MB-008",
    name: "Calefactor de exterior",
    category: "Climatización",
    total: 30,
    available: 8,
    reserved: 18,
    maintenance: 4,
    pricePerDay: 35,
    status: "disponible",
  },
]

export const bookings: EventBooking[] = [
  {
    id: "EV-1042",
    client: "Bodas Belmonte",
    eventName: "Boda Martínez-Ruiz",
    date: "2026-07-11",
    endDate: "2026-07-12",
    items: 340,
    status: "confirmado",
    value: 8450,
  },
  {
    id: "EV-1043",
    client: "Corporativo Andes",
    eventName: "Convención anual",
    date: "2026-07-15",
    endDate: "2026-07-16",
    items: 620,
    status: "pendiente",
    value: 15200,
  },
  {
    id: "EV-1044",
    client: "Grupo Solaris",
    eventName: "Lanzamiento de producto",
    date: "2026-07-18",
    endDate: "2026-07-18",
    items: 210,
    status: "confirmado",
    value: 6100,
  },
  {
    id: "EV-1045",
    client: "Fundación Aurora",
    eventName: "Gala benéfica",
    date: "2026-07-24",
    endDate: "2026-07-25",
    items: 480,
    status: "entregado",
    value: 11750,
  },
  {
    id: "EV-1046",
    client: "Bodas Belmonte",
    eventName: "Boda García-Lop",
    date: "2026-07-26",
    endDate: "2026-07-27",
    items: 300,
    status: "pendiente",
    value: 7900,
  },
]

export const quotes: Quote[] = [
  {
    id: "COT-2201",
    client: "Corporativo Andes",
    event: "Convención anual",
    date: "2026-07-04",
    status: "enviada",
    items: [
      { name: "Silla Tiffany transparente", qty: 400, days: 2, price: 3.5 },
      { name: "Mesa redonda 1.80m", qty: 50, days: 2, price: 12 },
      { name: "Carpa modular 6x6m", qty: 6, days: 2, price: 180 },
    ],
  },
  {
    id: "COT-2202",
    client: "Grupo Solaris",
    event: "Lanzamiento de producto",
    date: "2026-07-05",
    status: "aceptada",
    items: [
      { name: "Barra de bar iluminada LED", qty: 3, days: 1, price: 90 },
      { name: "Sofá lounge blanco", qty: 12, days: 1, price: 45 },
      { name: "Pista de baile 5x5m", qty: 1, days: 1, price: 220 },
    ],
  },
  {
    id: "COT-2203",
    client: "Bodas Belmonte",
    event: "Boda García-Lop",
    date: "2026-07-06",
    status: "borrador",
    items: [
      { name: "Silla Tiffany transparente", qty: 250, days: 2, price: 3.5 },
      { name: "Mantel premium (blanco)", qty: 60, days: 2, price: 2.2 },
      { name: "Calefactor de exterior", qty: 10, days: 2, price: 35 },
    ],
  },
]

export const deliveries: Delivery[] = [
  {
    id: "LOG-501",
    client: "Bodas Belmonte",
    address: "Finca El Olivar, Km 12 vía norte",
    zone: "Norte",
    window: "07:00 - 09:00",
    driver: "Camión 3 · R. Díaz",
    status: "en-ruta",
    stops: 2,
    distanceKm: 34,
  },
  {
    id: "LOG-502",
    client: "Grupo Solaris",
    address: "Centro de Convenciones, Av. Central 450",
    zone: "Centro",
    window: "08:30 - 10:00",
    driver: "Camión 1 · M. Peña",
    status: "programada",
    stops: 1,
    distanceKm: 12,
  },
  {
    id: "LOG-503",
    client: "Fundación Aurora",
    address: "Hotel Continental, Salón Imperial",
    zone: "Sur",
    window: "06:00 - 08:00",
    driver: "Camión 2 · L. Soto",
    status: "entregada",
    stops: 3,
    distanceKm: 27,
  },
  {
    id: "LOG-504",
    client: "Corporativo Andes",
    address: "Recinto Ferial, Puerta 4",
    zone: "Este",
    window: "09:00 - 11:30",
    driver: "Camión 4 · J. Ortiz",
    status: "programada",
    stops: 2,
    distanceKm: 41,
  },
]

export const kpis = {
  utilization: 78,
  activeBookings: 14,
  monthlyRevenue: 128400,
  pendingQuotes: 6,
  onTimeDelivery: 96,
  itemsOut: 2140,
}

export function quoteTotal(q: Quote) {
  return q.items.reduce((sum, i) => sum + i.qty * i.days * i.price, 0)
}

export const currency = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
})
