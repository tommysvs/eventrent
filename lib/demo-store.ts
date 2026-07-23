import { db } from "@/lib/db"
import type {
  BookingItem,
  Delivery,
  DemoKpis,
  DemoResource,
  DemoSnapshot,
  EventBooking,
  InventoryItem,
  InventoryMovement,
  InventoryStatus,
  NewDelivery,
  NewEventBooking,
  NewInventoryItem,
  NewQuote,
  PaymentStatus,
  Quote,
  QuoteItem,
  QuoteStatus,
} from "@/lib/demo-types"

type RawInventoryRow = {
  id: string
  name: string
  category: string
  total: unknown
  available: unknown
  reserved: unknown
  maintenance: unknown
  pricePerDay: unknown
  status: InventoryStatus
}

type RawQuoteRow = {
  id: string
  client: string
  event: string
  date: string
  status: QuoteStatus
  total: unknown
}

type RawQuoteItemRow = {
  quote_id: string
  inventory_id: string
  inventory_name: string | null
  qty: unknown
  days: unknown
  price: unknown
}

type RawBookingRow = {
  id: string
  quote_id: string | null
  client: string
  eventName: string
  date: string
  endDate: string
  items: unknown
  status: EventBooking["status"]
  paymentStatus: PaymentStatus
  value: unknown
}

type RawBookingItemRow = {
  booking_id: string
  inventory_id: string
  inventory_name: string | null
  qty: unknown
  days: unknown
  price: unknown
}

type RawDeliveryRow = {
  id: string
  bookingId: string
  client: string
  address: string
  delivery_zone: string
  delivery_date: string
  delivery_window: string
  driver: string
  status: Delivery["status"]
  stops: unknown
  distance_km: unknown
}

type RawMovementRow = {
  inventory_id: string
  inventory_name: string | null
  booking_id: string | null
  booking_code: string | null
  movement_type: InventoryMovement["movementType"]
  quantity: unknown
  previous_available: unknown
  new_available: unknown
  previous_reserved: unknown
  new_reserved: unknown
  notes: string | null
  created_at: string
}

function toNumber(value: unknown) {
  return typeof value === "number" ? value : Number(value)
}

function toDateString(value: string | Date) {
  if (typeof value === "string") return value.slice(0, 10)
  return value.toISOString().slice(0, 10)
}

function mapInventory(row: RawInventoryRow): InventoryItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    total: toNumber(row.total),
    available: toNumber(row.available),
    reserved: toNumber(row.reserved),
    maintenance: toNumber(row.maintenance),
    pricePerDay: toNumber(row.pricePerDay),
    status: row.status,
  }
}

function mapQuoteItem(row: RawQuoteItemRow): QuoteItem {
  return {
    inventoryId: row.inventory_id,
    inventoryName: row.inventory_name ?? undefined,
    qty: toNumber(row.qty),
    days: toNumber(row.days),
    price: toNumber(row.price),
  }
}

function mapBookingItem(row: RawBookingItemRow): BookingItem {
  return {
    inventoryId: row.inventory_id,
    inventoryName: row.inventory_name ?? undefined,
    qty: toNumber(row.qty),
    days: toNumber(row.days),
    price: toNumber(row.price),
  }
}

function mapBooking(row: RawBookingRow, bookingItems: BookingItem[]): EventBooking {
  return {
    id: row.id,
    quoteId: row.quote_id,
    client: row.client,
    eventName: row.eventName,
    date: toDateString(row.date),
    endDate: toDateString(row.endDate),
    items: toNumber(row.items),
    status: row.status,
    paymentStatus: row.paymentStatus,
    value: toNumber(row.value),
    bookingItems,
  }
}

function mapQuote(row: RawQuoteRow, quoteItems: QuoteItem[]): Quote {
  return {
    id: row.id,
    total: toNumber(row.total),
    client: row.client,
    event: row.event,
    date: toDateString(row.date),
    status: row.status,
    items: quoteItems,
  }
}

function mapDelivery(row: RawDeliveryRow): Delivery {
  return {
    id: row.id,
    bookingId: row.bookingId,
    client: row.client,
    address: row.address,
    zone: row.delivery_zone,
    window: row.delivery_window,
    driver: row.driver,
    deliveryDate: toDateString(row.delivery_date),
    status: row.status,
    stops: toNumber(row.stops),
    distanceKm: toNumber(row.distance_km),
  }
}

function mapMovement(row: RawMovementRow): InventoryMovement {
  return {
    inventoryId: row.inventory_id,
    inventoryName: row.inventory_name ?? undefined,
    bookingId: row.booking_id,
    bookingCode: row.booking_code,
    movementType: row.movement_type,
    quantity: toNumber(row.quantity),
    previousAvailable: toNumber(row.previous_available),
    newAvailable: toNumber(row.new_available),
    previousReserved: toNumber(row.previous_reserved),
    newReserved: toNumber(row.new_reserved),
    notes: row.notes,
    createdAt: toDateString(row.created_at),
  }
}

function quoteTotal(items: QuoteItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.days * item.price, 0)
}

function bookingTotal(items: BookingItem[]) {
  return items.reduce((sum, item) => sum + item.qty * item.days * item.price, 0)
}

function computeKpis(snapshot: Pick<DemoSnapshot, "inventory" | "bookings" | "quotes" | "deliveries">): DemoKpis {
  const totalUnits = snapshot.inventory.reduce((sum, item) => sum + item.total, 0)
  const unavailableUnits = snapshot.inventory.reduce((sum, item) => sum + item.reserved + item.maintenance, 0)
  const completedDeliveries = snapshot.deliveries.filter((delivery) => delivery.status === "entregada").length
  const totalDeliveries = snapshot.deliveries.length || 1

  return {
    utilization: totalUnits > 0 ? Math.round((unavailableUnits / totalUnits) * 100) : 0,
    activeBookings: snapshot.bookings.filter((booking) => booking.status !== "cancelado").length,
    monthlyRevenue: Math.round(snapshot.bookings.reduce((sum, booking) => sum + booking.value, 0)),
    pendingQuotes: snapshot.quotes.filter((quote) => quote.status === "borrador" || quote.status === "enviada").length,
    onTimeDelivery: Math.round((completedDeliveries / totalDeliveries) * 100),
    itemsOut: snapshot.bookings.reduce((sum, booking) => sum + booking.items, 0),
  }
}

async function getInventoryItemsMap(inventoryIds: string[]) {
  if (inventoryIds.length === 0) return new Map<string, InventoryItem>()

  const rows = await db.$queryRaw<RawInventoryRow[]>`
    SELECT
      id,
      name,
      category,
      total,
      available,
      reserved,
      maintenance,
      price_per_day AS "pricePerDay",
      status
    FROM inventory
    WHERE id = ANY(${inventoryIds})
  `

  return new Map(rows.map((row) => [row.id, mapInventory(row)]))
}

async function readInventoryForUpdate(tx: any, id: string) {
  const rows = await tx.$queryRaw<RawInventoryRow[]>`
    SELECT
      id,
      name,
      category,
      total,
      available,
      reserved,
      maintenance,
      price_per_day AS "pricePerDay",
      status
    FROM inventory
    WHERE id = ${id}
    FOR UPDATE
  `

  return rows[0] ? mapInventory(rows[0]) : null
}

async function writeMovement(
  tx: any,
  movement: Omit<InventoryMovement, "inventoryName" | "bookingCode">,
) {
  await tx.$executeRaw`
    INSERT INTO inventory_movements (
      inventory_id,
      booking_id,
      movement_type,
      quantity,
      previous_available,
      new_available,
      previous_reserved,
      new_reserved,
      notes,
      created_at
    ) VALUES (
      ${movement.inventoryId},
      ${movement.bookingId},
      ${movement.movementType},
      ${movement.quantity},
      ${movement.previousAvailable},
      ${movement.newAvailable},
      ${movement.previousReserved},
      ${movement.newReserved},
      ${movement.notes},
      ${movement.createdAt}
    )
  `
}

function deriveInventoryStatus(available: number, reserved: number, maintenance: number): InventoryStatus {
  if (available <= 0 && reserved > 0) return "agotado"
  if (available <= 0 && maintenance > 0) return "mantenimiento"
  if (reserved > 0) return "reservado"
  if (maintenance > 0) return "mantenimiento"
  return "disponible"
}

async function reserveBookingItems(tx: any, bookingId: string, bookingItems: BookingItem[]) {
  for (const item of bookingItems) {
    const inventory = await readInventoryForUpdate(tx, item.inventoryId)
    if (!inventory) {
      throw new Error(`Inventario no encontrado: ${item.inventoryId}`)
    }

    if (inventory.available < item.qty) {
      throw new Error(`No hay disponibilidad suficiente para ${inventory.name}`)
    }

    const nextAvailable = inventory.available - item.qty
    const nextReserved = inventory.reserved + item.qty
    const nextStatus = deriveInventoryStatus(nextAvailable, nextReserved, inventory.maintenance)

    await tx.$executeRaw`
      UPDATE inventory
      SET available = ${nextAvailable}, reserved = ${nextReserved}, status = ${nextStatus}
      WHERE id = ${item.inventoryId}
    `

    await writeMovement(tx, {
      inventoryId: item.inventoryId,
      bookingId,
      movementType: "reserva",
      quantity: item.qty,
      previousAvailable: inventory.available,
      newAvailable: nextAvailable,
      previousReserved: inventory.reserved,
      newReserved: nextReserved,
      notes: `Reserva de ${item.qty} unidad(es)`,
      createdAt: new Date().toISOString(),
    })
  }
}

async function releaseBookingItems(tx: any, bookingId: string, bookingItems: BookingItem[], notes = "Liberación de inventario") {
  for (const item of bookingItems) {
    const inventory = await readInventoryForUpdate(tx, item.inventoryId)
    if (!inventory) {
      continue
    }

    const nextAvailable = inventory.available + item.qty
    const nextReserved = Math.max(0, inventory.reserved - item.qty)
    const nextStatus = deriveInventoryStatus(nextAvailable, nextReserved, inventory.maintenance)

    await tx.$executeRaw`
      UPDATE inventory
      SET available = ${nextAvailable}, reserved = ${nextReserved}, status = ${nextStatus}
      WHERE id = ${item.inventoryId}
    `

    await writeMovement(tx, {
      inventoryId: item.inventoryId,
      bookingId,
      movementType: "liberacion",
      quantity: item.qty,
      previousAvailable: inventory.available,
      newAvailable: nextAvailable,
      previousReserved: inventory.reserved,
      newReserved: nextReserved,
      notes,
      createdAt: new Date().toISOString(),
    })
  }
}

async function loadBookingItemsByBookingId(bookingId: string) {
  const items = await db.$queryRaw<RawBookingItemRow[]>`
    SELECT
      bi.booking_id,
      bi.inventory_id,
      i.name AS inventory_name,
      bi.qty,
      bi.days,
      bi.price
    FROM booking_items bi
    LEFT JOIN inventory i ON i.id = bi.inventory_id
    WHERE bi.booking_id = ${bookingId}
    ORDER BY bi.inventory_id
  `

  return items.map(mapBookingItem)
}

async function loadBookingsWithItems() {
  const bookings = await db.$queryRaw<RawBookingRow[]>`
    SELECT
      id,
      quote_id,
      client,
      event_name AS "eventName",
      date::text AS date,
      end_date::text AS "endDate",
      items,
      status,
      payment_status AS "paymentStatus",
      value
    FROM bookings
    ORDER BY date DESC, id DESC
  `

  const items = await db.$queryRaw<RawBookingItemRow[]>`
    SELECT
      bi.booking_id,
      bi.inventory_id,
      i.name AS inventory_name,
      bi.qty,
      bi.days,
      bi.price
    FROM booking_items bi
    LEFT JOIN inventory i ON i.id = bi.inventory_id
    ORDER BY bi.booking_id, bi.inventory_id
  `

  const itemsByBooking = new Map<string, BookingItem[]>()
  for (const item of items) {
    const parsed = mapBookingItem(item)
    const existing = itemsByBooking.get(item.booking_id) ?? []
    existing.push(parsed)
    itemsByBooking.set(item.booking_id, existing)
  }

  return bookings.map((booking) => mapBooking(booking, itemsByBooking.get(booking.id) ?? []))
}

async function hydrateQuoteItems(items: QuoteItem[]) {
  const inventoryIds = [...new Set(items.map((item) => item.inventoryId))]
  const inventoryMap = await getInventoryItemsMap(inventoryIds)

  for (const item of items) {
    if (!inventoryMap.has(item.inventoryId)) {
      throw new Error(`Inventario no encontrado: ${item.inventoryId}`)
    }
  }

  return items.map((item) => ({
    ...item,
    inventoryName: inventoryMap.get(item.inventoryId)?.name,
  }))
}

async function hydrateBookingItems(items: BookingItem[]) {
  const inventoryIds = [...new Set(items.map((item) => item.inventoryId))]
  const inventoryMap = await getInventoryItemsMap(inventoryIds)

  for (const item of items) {
    if (!inventoryMap.has(item.inventoryId)) {
      throw new Error(`Inventario no encontrado: ${item.inventoryId}`)
    }
  }

  return items.map((item) => ({
    ...item,
    inventoryName: inventoryMap.get(item.inventoryId)?.name,
  }))
}

export async function getInventoryRecords() {
  const rows = await db.$queryRaw<RawInventoryRow[]>`
    SELECT
      id,
      name,
      category,
      total,
      available,
      reserved,
      maintenance,
      price_per_day AS "pricePerDay",
      status
    FROM inventory
    ORDER BY id
  `

  return rows.map(mapInventory)
}

export async function getBookingRecords() {
  return loadBookingsWithItems()
}

export async function getQuoteRecords() {
  const quotes = await db.$queryRaw<RawQuoteRow[]>`
    SELECT id, client, event, date::text AS date, status, total
    FROM quotes
    ORDER BY date DESC, id DESC
  `

  const items = await db.$queryRaw<RawQuoteItemRow[]>`
    SELECT
      qi.quote_id,
      qi.inventory_id,
      i.name AS inventory_name,
      qi.qty,
      qi.days,
      qi.price
    FROM quote_items qi
    LEFT JOIN inventory i ON i.id = qi.inventory_id
    ORDER BY qi.quote_id, qi.inventory_id
  `

  const itemsByQuote = new Map<string, QuoteItem[]>()
  for (const item of items) {
    const parsed = mapQuoteItem(item)
    const existing = itemsByQuote.get(item.quote_id) ?? []
    existing.push(parsed)
    itemsByQuote.set(item.quote_id, existing)
  }

  return quotes.map((quote) => mapQuote(quote, itemsByQuote.get(quote.id) ?? []))
}

export async function getDeliveryRecords() {
  const rows = await db.$queryRaw<RawDeliveryRow[]>`
    SELECT
      id,
      booking_id AS "bookingId",
      client,
      address,
      delivery_zone,
      delivery_date::text AS delivery_date,
      delivery_window,
      driver,
      status,
      stops,
      distance_km
    FROM deliveries
    ORDER BY delivery_date DESC, id DESC
  `

  return rows.map(mapDelivery)
}

export async function getInventoryMovementRecords() {
  const rows = await db.$queryRaw<RawMovementRow[]>`
    SELECT
      m.inventory_id,
      i.name AS inventory_name,
      m.booking_id,
      b.id AS booking_code,
      m.movement_type,
      m.quantity,
      m.previous_available,
      m.new_available,
      m.previous_reserved,
      m.new_reserved,
      m.notes,
      m.created_at::text AS created_at
    FROM inventory_movements m
    LEFT JOIN inventory i ON i.id = m.inventory_id
    LEFT JOIN bookings b ON b.id = m.booking_id
    ORDER BY m.created_at DESC
  `

  return rows.map(mapMovement)
}

export async function getDemoSnapshot(): Promise<DemoSnapshot> {
  const [inventory, bookings, quotes, deliveries, inventoryMovements] = await Promise.all([
    getInventoryRecords(),
    getBookingRecords(),
    getQuoteRecords(),
    getDeliveryRecords(),
    getInventoryMovementRecords(),
  ])

  return {
    inventory,
    bookings,
    quotes,
    deliveries,
    inventoryMovements,
    kpis: computeKpis({ inventory, bookings, quotes, deliveries }),
  }
}

export async function getDemoResource(resource: DemoResource) {
  switch (resource) {
    case "inventory":
      return getInventoryRecords()
    case "bookings":
      return getBookingRecords()
    case "quotes":
      return getQuoteRecords()
    case "deliveries":
      return getDeliveryRecords()
    case "inventory-movements":
      return getInventoryMovementRecords()
  }
}

export async function createInventoryRecord(item: NewInventoryItem) {
  const created = await db.$queryRaw<{ id: string }[]>`
    INSERT INTO inventory (
      name,
      category,
      total,
      available,
      reserved,
      maintenance,
      price_per_day,
      status
    ) VALUES (
      ${item.name},
      ${item.category},
      ${item.total},
      ${item.available},
      ${item.reserved},
      ${item.maintenance},
      ${item.pricePerDay},
      ${item.status}
    )
    RETURNING id
  `

  return created[0]?.id ?? null
}

export async function updateInventoryRecord(id: string, item: InventoryItem) {
  await db.$transaction(async (tx) => {
    const currentRows = await tx.$queryRaw<RawInventoryRow[]>`
      SELECT
        id,
        name,
        category,
        total,
        available,
        reserved,
        maintenance,
        price_per_day AS "pricePerDay",
        status
      FROM inventory
      WHERE id = ${id}
      FOR UPDATE
    `

    const previous = currentRows[0] ? mapInventory(currentRows[0]) : null

    await tx.$executeRaw`
      UPDATE inventory
      SET
        name = ${item.name},
        category = ${item.category},
        total = ${item.total},
        available = ${item.available},
        reserved = ${item.reserved},
        maintenance = ${item.maintenance},
        price_per_day = ${item.pricePerDay},
        status = ${item.status}
      WHERE id = ${id}
    `

    if (previous && (previous.available !== item.available || previous.reserved !== item.reserved || previous.status !== item.status)) {
      await writeMovement(tx, {
        inventoryId: id,
        bookingId: null,
        movementType: "ajuste",
        quantity: item.available - previous.available,
        previousAvailable: previous.available,
        newAvailable: item.available,
        previousReserved: previous.reserved,
        newReserved: item.reserved,
        notes: "Ajuste manual de inventario",
        createdAt: new Date().toISOString(),
      })
    }
  })
}

export async function deleteInventoryRecord(id: string) {
  await db.$executeRaw`DELETE FROM inventory WHERE id = ${id}`
}

export async function createQuoteRecord(quote: NewQuote) {
  return db.$transaction(async (tx) => {
    const quoteItems = await hydrateQuoteItems(quote.items)
    const total = quoteTotal(quoteItems)

    const createdQuote = await tx.$queryRaw<{ id: string }[]>`
      INSERT INTO quotes (client, event, date, status, total)
      VALUES (${quote.client}, ${quote.event}, ${quote.date}, ${quote.status}, ${total})
      RETURNING id
    `

    const createdId = createdQuote[0]?.id
    if (!createdId) {
      throw new Error("No se pudo obtener el id generado de la cotización")
    }

    for (const item of quoteItems) {
      await tx.$executeRaw`
        INSERT INTO quote_items (quote_id, inventory_id, qty, days, price)
        VALUES (${createdId}, ${item.inventoryId}, ${item.qty}, ${item.days}, ${item.price})
      `
    }

    return createdId
  })
}

export async function updateQuoteRecord(id: string, quote: Quote) {
  await db.$transaction(async (tx) => {
    const quoteItems = await hydrateQuoteItems(quote.items)
    const total = quoteTotal(quoteItems)

    await tx.$executeRaw`
      UPDATE quotes
      SET client = ${quote.client}, event = ${quote.event}, date = ${quote.date}, status = ${quote.status}, total = ${total}
      WHERE id = ${id}
    `

    await tx.$executeRaw`DELETE FROM quote_items WHERE quote_id = ${id}`

    for (const item of quoteItems) {
      await tx.$executeRaw`
        INSERT INTO quote_items (quote_id, inventory_id, qty, days, price)
        VALUES (${id}, ${item.inventoryId}, ${item.qty}, ${item.days}, ${item.price})
      `
    }
  })
}

export async function deleteQuoteRecord(id: string) {
  await db.$executeRaw`DELETE FROM quotes WHERE id = ${id}`
}

async function resolveBookingItems(tx: any, booking: NewEventBooking) {
  if (booking.bookingItems && booking.bookingItems.length > 0) {
    return hydrateBookingItems(booking.bookingItems)
  }

  if (booking.quoteId) {
    const quoteItems = await loadQuoteItemsByQuoteId(booking.quoteId)
    return quoteItems.map((item) => ({
      inventoryId: item.inventoryId,
      inventoryName: item.inventoryName,
      qty: item.qty,
      days: item.days,
      price: item.price,
    }))
  }

  return [] as BookingItem[]
}

async function loadQuoteItemsByQuoteId(quoteId: string) {
  const items = await db.$queryRaw<RawQuoteItemRow[]>`
    SELECT
      qi.quote_id,
      qi.inventory_id,
      i.name AS inventory_name,
      qi.qty,
      qi.days,
      qi.price
    FROM quote_items qi
    LEFT JOIN inventory i ON i.id = qi.inventory_id
    WHERE qi.quote_id = ${quoteId}
    ORDER BY qi.inventory_id
  `

  return items.map(mapQuoteItem)
}

async function loadBookingItemsForUpdate(tx: any, bookingId: string) {
  const items = await tx.$queryRaw<RawBookingItemRow[]>`
    SELECT
      bi.booking_id,
      bi.inventory_id,
      i.name AS inventory_name,
      bi.qty,
      bi.days,
      bi.price
    FROM booking_items bi
    LEFT JOIN inventory i ON i.id = bi.inventory_id
    WHERE bi.booking_id = ${bookingId}
    ORDER BY bi.inventory_id
  `

  return items.map(mapBookingItem)
}

async function saveBookingItems(tx: any, bookingId: string, items: BookingItem[]) {
  await tx.$executeRaw`DELETE FROM booking_items WHERE booking_id = ${bookingId}`

  for (const item of items) {
    await tx.$executeRaw`
      INSERT INTO booking_items (booking_id, inventory_id, qty, days, price)
      VALUES (${bookingId}, ${item.inventoryId}, ${item.qty}, ${item.days}, ${item.price})
    `
  }
}

async function syncBookingItems(tx: any, bookingId: string, previousItems: BookingItem[], nextItems: BookingItem[]) {
  const diff = diffBookingItems(previousItems, nextItems)

  if (diff.toRelease.length > 0) {
    await releaseBookingItems(tx, bookingId, diff.toRelease)
  }

  if (diff.toReserve.length > 0) {
    await reserveBookingItems(tx, bookingId, diff.toReserve)
  }
}

function diffBookingItems(previousItems: BookingItem[], nextItems: BookingItem[]) {
  const previousById = new Map(previousItems.map((item) => [item.inventoryId, item]))
  const nextById = new Map(nextItems.map((item) => [item.inventoryId, item]))

  const toReserve: BookingItem[] = []
  const toRelease: BookingItem[] = []

  for (const previousItem of previousItems) {
    const nextItem = nextById.get(previousItem.inventoryId)
    if (!nextItem) {
      toRelease.push(previousItem)
      continue
    }

    const qtyDiff = nextItem.qty - previousItem.qty
    if (qtyDiff > 0) {
      toReserve.push({ ...nextItem, qty: qtyDiff })
    } else if (qtyDiff < 0) {
      toRelease.push({ ...previousItem, qty: Math.abs(qtyDiff) })
    }
  }

  for (const nextItem of nextItems) {
    if (!previousById.has(nextItem.inventoryId)) {
      toReserve.push(nextItem)
    }
  }

  return { toReserve, toRelease }
}

export async function createBookingRecord(booking: NewEventBooking) {
  return db.$transaction(async (tx) => {
    const bookingItems = await resolveBookingItems(tx, booking)
    const hydratedItems = await hydrateBookingItems(bookingItems)
    const itemsCount = hydratedItems.reduce((sum, item) => sum + item.qty, 0)
    const totalValue = booking.value || bookingTotal(hydratedItems)

    const created = await tx.$queryRaw<{ id: string }[]>`
      INSERT INTO bookings (quote_id, client, event_name, date, end_date, items, status, payment_status, value)
      VALUES (
        ${booking.quoteId},
        ${booking.client},
        ${booking.eventName},
        ${booking.date},
        ${booking.endDate},
        ${itemsCount},
        ${booking.status},
        ${booking.paymentStatus},
        ${totalValue}
      )
      RETURNING id
    `

    const createdId = created[0]?.id
    if (!createdId) {
      throw new Error("No se pudo obtener el id generado de la reserva")
    }

    await saveBookingItems(tx, createdId, hydratedItems)

    if (hydratedItems.length > 0) {
      await reserveBookingItems(tx, createdId, hydratedItems)
    }

    return createdId
  })
}

export async function updateBookingRecord(id: string, booking: EventBooking) {
  await db.$transaction(async (tx) => {
    const currentRows = await tx.$queryRaw<RawBookingRow[]>`
      SELECT
        id,
        quote_id,
        client,
        event_name AS "eventName",
        date::text AS date,
        end_date::text AS "endDate",
        items,
        status,
        payment_status AS "paymentStatus",
        value
      FROM bookings
      WHERE id = ${id}
      FOR UPDATE
    `

    const current = currentRows[0]
    if (!current) {
      throw new Error(`Reserva no encontrada: ${id}`)
    }

    const previousItems = await loadBookingItemsForUpdate(tx, id)
    const nextItems = booking.bookingItems.length > 0 ? await hydrateBookingItems(booking.bookingItems) : previousItems

    await tx.$executeRaw`
      UPDATE bookings
      SET
        quote_id = ${booking.quoteId},
        client = ${booking.client},
        event_name = ${booking.eventName},
        date = ${booking.date},
        end_date = ${booking.endDate},
        items = ${booking.items},
        status = ${booking.status},
        payment_status = ${booking.paymentStatus},
        value = ${booking.value}
      WHERE id = ${id}
    `

    if (booking.status === "cancelado") {
      await releaseBookingItems(tx, id, previousItems)
    } else {
      if (booking.bookingItems.length > 0) {
        await syncBookingItems(tx, id, previousItems, nextItems)
        await saveBookingItems(tx, id, nextItems)
      }

      if (current.status !== "entregado" && booking.status === "entregado") {
        for (const item of nextItems) {
          await writeMovement(tx, {
            inventoryId: item.inventoryId,
            bookingId: id,
            movementType: "entrega",
            quantity: item.qty,
            previousAvailable: 0,
            newAvailable: 0,
            previousReserved: 0,
            newReserved: 0,
            notes: "Entrega registrada",
            createdAt: new Date().toISOString(),
          })
        }
      }
    }
  })
}

export async function deleteBookingRecord(id: string) {
  await db.$transaction(async (tx) => {
    const items = await loadBookingItemsForUpdate(tx, id)
    if (items.length > 0) {
      await releaseBookingItems(tx, id, items)
    }

    await tx.$executeRaw`DELETE FROM booking_items WHERE booking_id = ${id}`
    await tx.$executeRaw`DELETE FROM bookings WHERE id = ${id}`
  })
}

export async function createDeliveryRecord(delivery: NewDelivery) {
  const bookingRows = await db.$queryRaw<{ id: string }[]>`
    SELECT id
    FROM bookings
    WHERE id = ${delivery.bookingId}
  `

  if (!bookingRows[0]) {
    throw new Error("No se puede crear una entrega sin booking asociado")
  }

  const created = await db.$queryRaw<{ id: string }[]>`
    INSERT INTO deliveries (
      booking_id,
      client,
      address,
      delivery_zone,
      delivery_date,
      delivery_window,
      driver,
      status,
      stops,
      distance_km
    ) VALUES (
      ${delivery.bookingId},
      ${delivery.client},
      ${delivery.address},
      ${delivery.zone},
      ${delivery.deliveryDate},
      ${delivery.window},
      ${delivery.driver},
      ${delivery.status},
      ${delivery.stops},
      ${delivery.distanceKm}
    )
    RETURNING id
  `

  return created[0]?.id ?? null
}

export async function updateDeliveryRecord(id: string, delivery: Delivery) {
  await db.$executeRaw`
    UPDATE deliveries
    SET
      booking_id = ${delivery.bookingId},
      client = ${delivery.client},
      address = ${delivery.address},
      delivery_zone = ${delivery.zone},
      delivery_date = ${delivery.deliveryDate},
      delivery_window = ${delivery.window},
      driver = ${delivery.driver},
      status = ${delivery.status},
      stops = ${delivery.stops},
      distance_km = ${delivery.distanceKm}
    WHERE id = ${id}
  `
}

export async function deleteDeliveryRecord(id: string) {
  await db.$executeRaw`DELETE FROM deliveries WHERE id = ${id}`
}
