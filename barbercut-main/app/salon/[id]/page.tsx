import { Metadata } from 'next'
import ClientSalonPage from './ClientSalonPage'

interface SalonPageProps {
  /** Next 15+ : `params` est asynchrone. */
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: SalonPageProps): Promise<Metadata> {
  const { id } = await params

  return {
    title: 'Salon — Barber Cuts Marketplace',
    description: 'Découvrez ce salon de coiffure sur la Marketplace Barber Cuts. Prestations, tarifs et réservation en ligne.',
    alternates: {
      canonical: `/salon/${id}`,
    },
  }
}

export default async function SalonPage({ params }: SalonPageProps) {
  const { id } = await params
  // Le salon est vérifié côté client via useSalonStore ; notFound() est géré dans ClientSalonPage
  return <ClientSalonPage salonId={id} />
}
