import { NextResponse } from "next/server"
import type {
  DemoResource,
  Delivery,
  EventBooking,
  InventoryItem,
  NewDelivery,
  NewEventBooking,
  NewInventoryItem,
  NewQuote,
  Quote,
} from "@/lib/demo-types"
import {
  createBookingRecord,
  createDeliveryRecord,
  createInventoryRecord,
  createQuoteRecord,
  deleteBookingRecord,
  deleteDeliveryRecord,
  deleteInventoryRecord,
  deleteQuoteRecord,
  getDemoResource,
  updateBookingRecord,
  updateDeliveryRecord,
  updateInventoryRecord,
  updateQuoteRecord,
} from "@/lib/demo-store"

function isDemoResource(resource: string): resource is DemoResource {
  return (
    resource === "inventory" ||
    resource === "bookings" ||
    resource === "quotes" ||
    resource === "deliveries" ||
    resource === "inventory-movements"
  )
}

function requireId(url: URL) {
  const id = url.searchParams.get("id")
  if (!id) throw new Error("Record id is required")
  return id
}

export async function GET(_: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await params

    if (!isDemoResource(resource)) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const records = await getDemoResource(resource)
    return NextResponse.json(records)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await params

    if (!isDemoResource(resource)) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const body = await request.json()
    let createdId: string | null = null

    if (resource === "inventory-movements") {
      return NextResponse.json({ error: "Resource not supported for mutations" }, { status: 405 })
    }

    switch (resource) {
      case "inventory":
        createdId = await createInventoryRecord(body as NewInventoryItem)
        break
      case "bookings":
        createdId = await createBookingRecord(body as NewEventBooking)
        break
      case "quotes":
        createdId = await createQuoteRecord(body as NewQuote)
        break
      case "deliveries":
        createdId = await createDeliveryRecord(body as NewDelivery)
        break
    }

    return NextResponse.json({ ok: true, id: createdId })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await params

    if (!isDemoResource(resource)) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const id = requireId(new URL(request.url))
    const body = await request.json()

    if (resource === "inventory-movements") {
      return NextResponse.json({ error: "Resource not supported for mutations" }, { status: 405 })
    }

    switch (resource) {
      case "inventory":
        await updateInventoryRecord(id, body as InventoryItem)
        break
      case "bookings":
        await updateBookingRecord(id, body as EventBooking)
        break
      case "quotes":
        await updateQuoteRecord(id, body as Quote)
        break
      case "deliveries":
        await updateDeliveryRecord(id, body as Delivery)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ resource: string }> }) {
  try {
    const { resource } = await params

    if (!isDemoResource(resource)) {
      return NextResponse.json({ error: "Resource not found" }, { status: 404 })
    }

    const id = requireId(new URL(request.url))

    if (resource === "inventory-movements") {
      return NextResponse.json({ error: "Resource not supported for mutations" }, { status: 405 })
    }

    switch (resource) {
      case "inventory":
        await deleteInventoryRecord(id)
        break
      case "bookings":
        await deleteBookingRecord(id)
        break
      case "quotes":
        await deleteQuoteRecord(id)
        break
      case "deliveries":
        await deleteDeliveryRecord(id)
        break
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Internal server error" }, { status: 500 })
  }
}