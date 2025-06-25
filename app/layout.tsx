import type { Metadata } from 'next'
import './globals.css'
import PrivyProviderWrapper from './privy-provider-wrapper'
import { Toaster } from '@/components/ui/sonner'

export const metadata: Metadata = {
  title: 'OmniFi',
  description: 'Growing Assets to infinity and beyond',
  generator: 'Chris and Aditya',
  icons: {
    icon: '/icon.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrivyProviderWrapper>
          {children}
          <Toaster />
        </PrivyProviderWrapper>
      </body>
    </html>
  )
}