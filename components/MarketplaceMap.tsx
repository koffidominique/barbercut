'use client'

import { useEffect, useState, useCallback } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { useSalonStore } from '@/lib/store'
import { Salon } from '@/lib/store'

interface MarketplaceMapProps {
  salons: Salon[]
  onSelectSalon?: (salonId: string) => void
}

/* Compose un marker custom avec la couleur du salon */
function SalonMarker({ salon, onClick }: { salon: Salon; onClick: () => void }) {
  const position: [number, number] = [salon.latitude ?? 5.33, salon.longitude ?? -4.00]
  return (
    <Marker position={position}>
      <Popup>
        <div className="p-3 min-w-[200px]">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-serif text-base font-bold text-[#202321]">{salon.name}</h3>
              <p className="text-[11px] text-[#747873]">{salon.neighborhood}, {salon.city}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-[#f4c58d] font-bold">
              ★ {salon.rating}
            </div>
          </div>
          <p className="text-[11px] text-[#555a53] line-clamp-2 mb-3">{salon.tagline}</p>
          <div className="flex gap-2">
            <button
              onClick={onClick}
              className="flex-1 rounded-xl bg-[#202321] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#383d39] transition"
            >
              Voir la fiche
            </button>
            <a
              href={`https://wa.me/${salon.whatsapp.replace('+', '')}?text=Bonjour%20${salon.name}%2C%20je%20viens%20de%20la%20carte%20interactive`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 rounded-xl bg-[#25d366] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#20bd5e] transition whitespace-nowrap"
            >
              💬 WhatsApp
            </a>
          </div>
        </div>
      </Popup>
    </Marker>
  )
}

/* Centrer la carte automatiquement sur les marqueurs */
function MapCenter({ salons }: { salons: Salon[] }) {
  const map = useMap()
  useEffect(() => {
    const publishedWithCoords = salons.filter((s) => s.isPublished && s.latitude && s.longitude)
    if (publishedWithCoords.length === 0) return

    const bounds: [number, number][] = publishedWithCoords.map((s) => [s.latitude!, s.longitude!])
    map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 })
  }, [map, salons])
  return null
}

export function MarketplaceMap({ salons, onSelectSalon }: MarketplaceMapProps) {
  const [selectedSalonId, setSelectedSalonId] = useState<string | null>(null)

  const publishedSalons = salons.filter((s) => s.isPublished)

  const handleMarkerClick = useCallback(
    (salonId: string) => {
      setSelectedSalonId(salonId)
      onSelectSalon?.(salonId)
    },
    [onSelectSalon]
  )

  return (
    <div className="w-full h-[500px] rounded-3xl border border-[#e8e4dc] overflow-hidden shadow-sm">
      <MapContainer
        center={[5.33, -4.00]}
        zoom={13}
        className="h-full w-full"
        scrollWheelZoom={false}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <MapCenter salons={publishedSalons} />
        {publishedSalons.map((salon) => (
          <SalonMarker
            key={salon.id}
            salon={salon}
            onClick={() => handleMarkerClick(salon.id)}
          />
        ))}
      </MapContainer>

      {/* Légende / sélection en bas */}
      {selectedSalonId && (
        <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-center">
          <div className="max-w-md rounded-2xl border border-[#e8e4dc] bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-serif text-base font-bold text-[#202321]">
                {publishedSalons.find((s) => s.id === selectedSalonId)?.name || 'Salon'}
              </h3>
              <button
                onClick={() => setSelectedSalonId(null)}
                className="rounded-full p-1 text-[#7c807b] hover:bg-[#eae7e0] transition"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
