import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'EventRent — Gestión inteligente de inventario y logística de eventos',
  description:
    'Plataforma web inteligente para empresas de alquiler de mobiliario y organización de eventos: inventario en tiempo real, calendario de disponibilidad, cotizaciones instantáneas y optimización logística de entregas.',
  icons: {
    icon: [
      {
        url: '/logo.png',
        type: 'image/png',
        sizes: '32x32',
      },
    ],
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: 'white' },
    { media: '(prefers-color-scheme: dark)', color: 'black' },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const themeInitScript = `
    (() => {
      try {
        const stored = localStorage.getItem('theme')
        const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches
        const theme = stored === 'dark' || stored === 'light' ? stored : (prefersLight ? 'light' : 'dark')
        const root = document.documentElement
        root.classList.remove('light', 'dark')
        root.classList.add(theme)
      } catch {}
    })();
  `

  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} bg-background`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
