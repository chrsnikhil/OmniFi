import type { Metadata } from 'next'
import './globals.css'
import PrivyProviderWrapper from './privy-provider-wrapper'

export const metadata: Metadata = {
  title: 'OmniFi',
  description: 'Growing Assets to infinity and beyond',
  generator: 'Chris and Aditya',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <PrivyProviderWrapper>
          {children}
        </PrivyProviderWrapper>
      </body>
    </html>
  )
}