import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Transparencia Chaco | Iniciativa Ciudadana",
  description:
    "Iniciativa comunitaria para que los gobiernos municipales rindan cuentas a la ciudadanía. Monitoreamos la transparencia en municipios del sudoeste chaqueño.",
  keywords: ["transparencia", "chaco", "municipios", "rendición de cuentas", "charata", "argentina"],
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
