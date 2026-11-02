import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ClientSalonPage from './ClientSalonPage'

interface SalonPageProps {
  params: { id: string }
}

export async function generateMetadata({ params }: SalonPageProps): Promise<Metadata> {
  return {
    title: 'Salon — Barber Cuts Marketplace',
    description: 'Découvrez ce salon de coiffure sur la Marketplace Barber Cuts. Prestations, tarifs et réservation en ligne.',
    alternates: {
      canonical: `/salon/${params.id}`,
    },
  }
}

export default async function SalonPage({ params }: SalonPageProps) {
  // Le salon est vérifié côté client via useSalonStore ; notFound() est géré dans ClientSalonPage
  return <ClientSalonPage salonId={params.id} />
}
