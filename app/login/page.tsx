"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, CalendarClock, Eye, EyeOff, Lock, ShieldCheck, Sparkles, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error ?? "No se pudo iniciar sesión")
        return
      }

      router.push("/demo")
      router.refresh()
    } catch {
      setError("No se pudo conectar con el servidor")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,theme(colors.accent/12%),transparent_45%),linear-gradient(135deg,theme(colors.background),theme(colors.secondary))]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-6 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <CalendarClock className="h-5 w-5" />
          </span>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            Event<span className="text-accent">Rent</span>
          </span>
        </Link>

        <Button
          render={<a href="/" />}
          nativeButton={false}
          variant="ghost"
          size="sm"
          className="text-foreground"
        >
          Volver al inicio
        </Button>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-4 pb-16 pt-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-16 lg:py-12">
        <section className="max-w-xl">
          <Badge
            variant="secondary"
            className="mb-6 gap-1.5 rounded-full border-accent/20 bg-accent/10 px-3 py-1 text-accent"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Acceso privado para clientes del SaaS
          </Badge>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Inicia sesión con tu usuario y gestiona inventarios, reservas y logística.
          </h1>

          <p className="mt-4 max-w-lg text-pretty text-lg leading-relaxed text-muted-foreground">
            El acceso lo define el dueño del SaaS. Tú solo entras con las credenciales que te entreguen para operar tu cuenta.
          </p>

          <div className="mt-8 space-y-3 rounded-2xl border border-border/70 bg-card/70 p-5 shadow-sm">
            <div className="flex items-center gap-3 text-sm text-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span>Credenciales asignadas por el dueño del sistema.</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-foreground">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
                <CalendarClock className="h-4 w-4" />
              </div>
              <span>Acceso simple para revisar stock, reservas y entregas.</span>
            </div>
          </div>
        </section>

        <Card className="w-full max-w-md rounded-2xl border-border/80 bg-card/95 p-0 shadow-[0_30px_80px_-30px_rgba(15,23,42,0.35)]">
          <CardHeader className="px-6 pb-0 pt-6">
            <CardTitle className="text-2xl text-foreground">Bienvenido de nuevo</CardTitle>
            <CardDescription>
              Usa tu usuario y contraseña para entrar al panel de EventRent.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-foreground">
                  Usuario
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Ingresa tu usuario"
                    className="h-11 pl-9"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-foreground">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="••••••••"
                    className="h-11 pl-9 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                    aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-muted-foreground">
                  <input type="checkbox" className="rounded border-border" />
                  Recordarme
                </label>
                <a href="#" className="font-medium text-accent transition-colors hover:text-accent/80">
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            {error && (
              <div className="mt-4 rounded-lg border border-accent/20 bg-accent/10 p-3 text-sm text-accent">
                {error}
              </div>
            )}

            <p className="mt-4 text-center text-sm text-muted-foreground">
              ¿Aún no tienes cuenta? <a href="mailto:soporte@eventrent.local" className="font-medium text-foreground hover:text-accent">Solicita acceso</a>
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
