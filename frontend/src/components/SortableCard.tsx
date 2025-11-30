'use client';


import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CardData } from '@/types';
import Card from './Card';

interface SortableCardProps {
    card: CardData;
    onUpdate: (id: number, data: { title?: string; description?: string }) => void;
    onDelete: (id: number) => void;
}

export default function SortableCard({ card, onUpdate, onDelete }: SortableCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: `card-${card.id}` });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0 : 1,
        cursor: isDragging ? 'grabbing' : 'grab',
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <Card card={card} onUpdate={onUpdate} onDelete={onDelete} />
        </div>
    );
}
