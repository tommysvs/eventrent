"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { StatusBadge } from "@/components/demo/status-badge"
import { quotes, quoteTotal, currency } from "@/lib/demo-data"
import { cn } from "@/lib/utils"

export function QuotesView() {
  const [activeId, setActiveId] = useState(quotes[0].id)
  const active = quotes.find((q) => q.id === activeId)!

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      <div className="space-y-3 lg:col-span-2">
        {quotes.map((q) => (
          <button
            key={q.id}
            onClick={() => setActiveId(q.id)}
            className={cn(
              "w-full rounded-lg border p-4 text-left transition-colors",
              q.id === activeId
                ? "border-primary bg-primary/5 ring-1 ring-primary"
                : "border-border hover:bg-secondary",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-muted-foreground">{q.id}</span>
              <StatusBadge status={q.status} />
            </div>
            <p className="mt-1 font-medium text-foreground">{q.event}</p>
            <p className="text-sm text-muted-foreground">{q.client}</p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {currency.format(quoteTotal(q))}
            </p>
          </button>
        ))}
      </div>

      <Card className="lg:col-span-3">
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-base">{active.event}</CardTitle>
            <StatusBadge status={active.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {active.client} · {active.id} ·{" "}
            {new Date(active.date).toLocaleDateString("es-ES", { dateStyle: "long" })}
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {active.items.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-4 text-sm">
                <div>
                  <p className="font-medium text-foreground">{item.name}</p>
                  <p className="text-muted-foreground">
                    {item.qty} uds × {item.days} día(s) × {currency.format(item.price)}
                  </p>
                </div>
                <span className="font-medium text-foreground">
                  {currency.format(item.qty * item.days * item.price)}
                </span>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
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
        </CardContent>
      </Card>
    </div>
  )
}
