'use client'

import { useRouter } from 'next/navigation'
import { useSalonStore } from '@/lib/store'
import { MarketplaceView } from '@/components/MarketplaceView'

export default function MarketplacePage() {
  const router = useRouter()
  const { salons, bookAppointment } = useSalonStore()

  return (
    <MarketplaceView
      salons={salons}
      onBookAppointment={bookAppointment}
      onSwitchToErp={() => router.push('/')}
    />
  )
}
