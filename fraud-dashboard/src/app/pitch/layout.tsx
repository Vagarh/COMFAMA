import { Press_Start_2P } from 'next/font/google'
import type { ReactNode } from 'react'

const pixel = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pixel',
  display: 'swap',
})

export default function PitchLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${pixel.variable} min-h-screen bg-[#080C14] overflow-hidden`}>
      {children}
    </div>
  )
}
