import { NextResponse } from "next/server"
import { getDemoSnapshot } from "@/lib/demo-store"

export async function GET() {
  try {
    const snapshot = await getDemoSnapshot()
    return NextResponse.json(snapshot)
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}