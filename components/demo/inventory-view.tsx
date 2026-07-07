"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { StatusBadge } from "@/components/demo/status-badge"
import { inventory, currency } from "@/lib/demo-data"
import { Search } from "lucide-react"

export function InventoryView() {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("todas")

  const categories = useMemo(
    () => ["todas", ...Array.from(new Set(inventory.map((i) => i.category)))],
    [],
  )

  const filtered = useMemo(
    () =>
      inventory.filter((i) => {
        const matchesQuery =
          i.name.toLowerCase().includes(query.toLowerCase()) ||
          i.id.toLowerCase().includes(query.toLowerCase())
        const matchesCategory = category === "todas" || i.category === category
        return matchesQuery && matchesCategory
      }),
    [query, category],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o código..."
            className="pl-9"
            aria-label="Buscar en inventario"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c === "todas" ? "Todas las categorías" : c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Artículo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-center">Disponibilidad</TableHead>
                  <TableHead className="text-right">Precio/día</TableHead>
                  <TableHead className="text-right">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => {
                  const pct = Math.round((item.available / item.total) * 100)
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.id}</div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{item.category}</TableCell>
                      <TableCell>
                        <div className="mx-auto w-40">
                          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
                            <span>{item.available} libres</span>
                            <span>{item.total} total</span>
                          </div>
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        {currency.format(item.pricePerDay)}
                      </TableCell>
                      <TableCell className="text-right">
                        <StatusBadge status={item.status} />
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No se encontraron artículos con esos criterios.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
