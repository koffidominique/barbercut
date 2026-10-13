import Image from "next/image"
import { Card } from "@/components/ui/card"

type BakeryImageCardProps = {
  image: string
  alt: string
  title: string
  description: string
}

export function BakeryImageCard({ image, alt, title, description }: BakeryImageCardProps) {
  return (
    <Card className="group/card relative h-full min-h-65 w-full overflow-hidden border-0 p-0!">
      <Image
        src={image}
        alt={alt}
        fill
        sizes="(max-width: 1024px) 100vw, 50vw"
        className="absolute inset-0 size-full object-cover transition-transform duration-500 group-hover/card:scale-110"
      />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/60 to-transparent transition-opacity duration-500 group-hover/card:from-black/70" />
      <div className="relative flex h-full flex-col justify-end p-6">
        <h3 className="text-xl font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-white/90">{description}</p>
      </div>
    </Card>
  )
}