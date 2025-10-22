import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Controle Fiscal - Gerenciamento de Prazos',
  description: 'Sistema colaborativo para gerenciamento de prazos fiscais, obrigações e impostos',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  )
}

