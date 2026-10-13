import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
// Tous les icônes sont passées en props depuis le composant parent, pas d'import nécessaire ici

interface AccordionMediaItem {
    icon: React.ReactNode
    title: string
    content: string
    media?: string
    category: string
}

interface AccordionMediaContentProps {
    items: AccordionMediaItem[]
}

const AccordionMediaContentDemo = ({ items }: AccordionMediaContentProps) => {
    return (
        <Accordion type="multiple" className='w-full border-0 [&>*>[data-slot="accordion-content"]]:px-0' defaultValue={['item-1']}>
            {items.map((item, index) => (
                <AccordionItem key={index} value={`item-${index + 1}`} className='bg-transparent dark:border-slate-700 border-b border-slate-200 last:border-0'>
                    <AccordionTrigger className='px-0 py-5 hover:no-underline'>
                        <span className='flex items-center gap-4 *:[svg]:size-4 *:[svg]:shrink-0 dark:text-white text-slate-900'>
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                            {item.icon}
                            <span className="text-sm sm:text-base font-bold">{item.title}</span>
                        </span>
                    </AccordionTrigger>
                    <AccordionContent className='h-auto space-y-4 pb-6'>
                        <p className='dark:text-slate-400 text-slate-600 leading-relaxed'>{item.content}</p>
                        {item.media && <img src={item.media} alt={item.title} className='aspect-26/11 w-full rounded-lg' />}
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-[11px] font-mono px-2 py-0.5 rounded dark:bg-slate-800 bg-slate-100 dark:text-slate-500 text-slate-500">
                                Catégorie : {item.category}
                            </span>
                        </div>
                    </AccordionContent>
                </AccordionItem>
            ))}
        </Accordion>
    )
}

export default AccordionMediaContentDemo