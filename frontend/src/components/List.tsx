'use client';

import { useState } from 'react';
import { ListData } from '@/types';
import styles from './List.module.css';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableCard from './SortableCard';

interface ListProps {
    list: ListData;
    activeId: string | null;
    onAddCard: (listId: number, title: string) => void;
    onUpdateCard: (cardId: number, data: { title?: string; description?: string }) => void;
    onDeleteCard: (cardId: number) => void;
    onDeleteList: (listId: number) => void;
}

export default function List({ list, activeId, onAddCard, onUpdateCard, onDeleteCard, onDeleteList }: ListProps) {
    const [isAddingCard, setIsAddingCard] = useState(false);
    const [newCardTitle, setNewCardTitle] = useState('');

    const { setNodeRef, isOver } = useDroppable({
        id: `list-${list.id}`,
    });

    // Check if we're dragging over this empty list
    const isDraggingOverEmpty = isOver && list.cards.length === 0 && activeId !== null;

    const handleAddCard = () => {
        if (newCardTitle.trim()) {
            onAddCard(list.id, newCardTitle);
            setNewCardTitle('');
            setIsAddingCard(false);
        }
    };

    return (
        <div className={styles.list}>
            <div className={styles.listHeader}>
                <h2 className={styles.title}>{list.title}</h2>
                <button
                    className={styles.deleteBtn}
                    onClick={() => onDeleteList(list.id)}
                    title="Delete list"
                >
                    ×
                </button>
            </div>

            <div ref={setNodeRef} className={`${styles.cardsContainer} ${isDraggingOverEmpty ? styles.dragOverEmpty : ''}`}>
                <SortableContext
                    items={list.cards.map(card => `card-${card.id}`)}
                    strategy={verticalListSortingStrategy}
                >
                    {list.cards.map((card) => (
                        <SortableCard
                            key={card.id}
                            card={card}
                            onUpdate={onUpdateCard}
                            onDelete={onDeleteCard}
                        />
                    ))}
                </SortableContext>
            </div>

            {isAddingCard ? (
                <div className={styles.addCardForm}>
                    <input
                        className={styles.input}
                        type="text"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Enter card title"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddCard();
                            if (e.key === 'Escape') {
                                setIsAddingCard(false);
                                setNewCardTitle('');
                            }
                        }}
                    />
                    <div className={styles.formActions}>
                        <button className={styles.addBtn} onClick={handleAddCard}>
                            Add Card
                        </button>
                        <button
                            className={styles.cancelBtn}
                            onClick={() => {
                                setIsAddingCard(false);
                                setNewCardTitle('');
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    className={styles.addCardBtn}
                    onClick={() => setIsAddingCard(true)}
                >
                    + Add a card
                </button>
            )}
        </div>
    );
}
