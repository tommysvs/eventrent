"use client"

import { createPortal } from "react-dom"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
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
import type { InventoryItem, InventoryStatus, NewInventoryItem } from "@/lib/demo-types"
import { currency } from "@/lib/demo-types"
import { Search } from "lucide-react"

type InventoryFormState = {
  name: string
  category: string
  total: string
  available: string
  reserved: string
  maintenance: string
  pricePerDay: string
  status: InventoryStatus
}

type InventoryViewProps = {
  inventory: InventoryItem[]
  onCreate: (item: NewInventoryItem) => Promise<string | null>
  onUpdate: (id: string, item: InventoryItem) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

const statusOptions: InventoryStatus[] = ["disponible", "reservado", "mantenimiento", "agotado"]

function emptyDraft(): InventoryFormState {
  return {
    name: "",
    category: "",
    total: "",
    available: "",
    reserved: "",
    maintenance: "",
    pricePerDay: "",
    status: "disponible",
  }
}

function toDraft(item: InventoryItem): InventoryFormState {
  return {
    name: item.name,
    category: item.category,
    total: String(item.total),
    available: String(item.available),
    reserved: String(item.reserved),
    maintenance: String(item.maintenance),
    pricePerDay: String(item.pricePerDay),
    status: item.status,
  }
}

export function InventoryView({ inventory, onCreate, onUpdate, onDelete }: InventoryViewProps) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState("todas")
  const [editingId, setEditingId] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [draft, setDraft] = useState<InventoryFormState>(emptyDraft())
  const [error, setError] = useState("")

  const categories = useMemo(
    () => ["todas", ...Array.from(new Set(inventory.map((item) => item.category)))],
    [inventory],
  )

  const filtered = useMemo(
    () =>
      inventory.filter((item) => {
        const matchesQuery =
          item.name.toLowerCase().includes(query.toLowerCase()) ||
          item.id.toLowerCase().includes(query.toLowerCase())
        const matchesCategory = category === "todas" || item.category === category
        return matchesQuery && matchesCategory
      }),
    [inventory, query, category],
  )

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

  function startCreate() {
    setEditingId(null)
    setDraft(emptyDraft())
    setError("")
    setIsFormOpen(true)
  }

  function startEdit(item: InventoryItem) {
    setEditingId(item.id)
    setDraft(toDraft(item))
    setError("")
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingId(null)
    setDraft(emptyDraft())
    setError("")
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const payload: NewInventoryItem = {
      name: draft.name.trim(),
      category: draft.category.trim(),
      total: Number(draft.total),
      available: Number(draft.available),
      reserved: Number(draft.reserved),
      maintenance: Number(draft.maintenance),
      pricePerDay: Number(draft.pricePerDay),
      status: draft.status,
    }

    if (!payload.name || !payload.category) {
      setError("Completa nombre y categoría.")
      return
    }

    if (editingId) {
      await onUpdate(editingId, { ...payload, id: editingId })
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
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por nombre o código..."
            className="pl-9"
            aria-label="Buscar en inventario"
          />
        </div>
        <Select value={category} onValueChange={(value) => setCategory(value ?? "todas")}>
          <SelectTrigger className="sm:w-56" aria-label="Filtrar por categoría">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((itemCategory) => (
              <SelectItem key={itemCategory} value={itemCategory} className="capitalize">
                {itemCategory === "todas" ? "Todas las categorías" : itemCategory}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" onClick={startCreate} className="sm:w-auto">
          Nuevo artículo
        </Button>
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
                  <TableHead className="text-right">Acciones</TableHead>
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
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => startEdit(item)}>
                            Editar
                          </Button>
                          <Button type="button" variant="destructive" size="sm" onClick={() => handleDelete(item.id)}>
                            Eliminar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                      No se encontraron artículos con esos criterios.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {isFormOpen && typeof document !== "undefined" ? createPortal(
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/75 px-4 py-6 backdrop-blur-[2px] sm:items-center sm:p-6" role="presentation" onClick={closeForm}>
          <div
            className="w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-background shadow-[0_30px_80px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
            role="dialog"
            aria-modal="true"
            aria-labelledby="inventory-form-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border bg-muted/35 px-5 py-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Inventario</p>
                <h2 id="inventory-form-title" className="text-lg font-semibold text-foreground">
                  {editingId ? `Editando ${editingId}` : "Nuevo artículo"}
                </h2>
                <p className="text-sm text-muted-foreground">Los cambios se guardan directamente en Postgres.</p>
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={closeForm} aria-label="Cerrar modal">
                Cerrar
              </Button>
            </div>

            <div className="max-h-[80vh] overflow-y-auto px-5 py-4 sm:max-h-[82vh]">
              {error && <p className="mb-3 text-sm text-destructive">{error}</p>}

              <form className="grid gap-3 md:grid-cols-2" onSubmit={handleSubmit}>
                <Input
                  value={draft.name}
                  onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                  placeholder="Nombre del artículo"
                />
                <Input
                  value={draft.category}
                  onChange={(event) => setDraft((current) => ({ ...current, category: event.target.value }))}
                  placeholder="Categoría"
                />
                <Select
                  value={draft.status}
                  onValueChange={(value) => setDraft((current) => ({ ...current, status: value as InventoryStatus }))}
                >
                  <SelectTrigger className="w-full" aria-label="Estado">
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
                <Input
                  type="number"
                  value={draft.total}
                  onChange={(event) => setDraft((current) => ({ ...current, total: event.target.value }))}
                  placeholder="Total"
                />
                <Input
                  type="number"
                  value={draft.available}
                  onChange={(event) => setDraft((current) => ({ ...current, available: event.target.value }))}
                  placeholder="Disponibles"
                />
                <Input
                  type="number"
                  value={draft.reserved}
                  onChange={(event) => setDraft((current) => ({ ...current, reserved: event.target.value }))}
                  placeholder="Reservados"
                />
                <Input
                  type="number"
                  value={draft.maintenance}
                  onChange={(event) => setDraft((current) => ({ ...current, maintenance: event.target.value }))}
                  placeholder="Mantenimiento"
                />
                <Input
                  type="number"
                  step="0.01"
                  value={draft.pricePerDay}
                  onChange={(event) => setDraft((current) => ({ ...current, pricePerDay: event.target.value }))}
                  placeholder="Precio por día"
                />
                <div className="flex items-end justify-end gap-2 md:col-span-2">
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