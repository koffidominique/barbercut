export const roomTypes = [
  { id: "classic-twin", name: "Classic Twin", code: "TWN-01", category: "Standard", rooms: 12, occupied: 8, available: 4, capacity: "2 adultes · 2 lits", size: "24 m²", rate: "110 €", amenities: ["Wi-Fi", "Climatisation", "TV"] },
  { id: "deluxe-king", name: "Deluxe King", code: "DLX-01", category: "Deluxe", rooms: 18, occupied: 14, available: 4, capacity: "2 adultes · King", size: "30 m²", rate: "145 €", amenities: ["Wi-Fi", "Minibar", "Balcon"] },
  { id: "suite-horizon", name: "Suite Horizon", code: "STE-01", category: "Suite", rooms: 6, occupied: 3, available: 3, capacity: "3 adultes · King", size: "48 m²", rate: "240 €", amenities: ["Salon", "Terrasse", "Minibar"] },
  { id: "premium-suite", name: "Premium Suite", code: "STE-02", category: "Suite", rooms: 4, occupied: 3, available: 1, capacity: "4 adultes · King", size: "62 m²", rate: "320 €", amenities: ["Salon", "Terrasse", "Baignoire"] },
] as const

type RoomType = typeof roomTypes[number]
export type { RoomType }
