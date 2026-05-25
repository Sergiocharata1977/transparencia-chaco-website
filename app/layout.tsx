import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    default: "Observatorio Ciudadano de Transparencia | Chaco",
    template: "%s | Observatorio Transparencia Chaco"
  },
  description: "Monitoreamos obras públicas, reportes ciudadanos, pedidos de información y transparencia institucional en Charata, Las Breñas, Corzuela y Presidencia Roque Sáenz Peña.",
  keywords: ["transparencia", "chaco", "municipios", "obras públicas", "charata", "rendición de cuentas", "argentina"],
  openGraph: {
    type: "website",
    locale: "es_AR",
    siteName: "Observatorio Transparencia Chaco",
    description: "Monitoreamos obras públicas, reportes ciudadanos y transparencia institucional en municipios del sudoeste chaqueño.",
  },
  icons: {
    icon: "/logo-modelo1.png",
    apple: "/logo-modelo1.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="es">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
