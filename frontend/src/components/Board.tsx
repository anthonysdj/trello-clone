import { useEffect, useState } from 'react';
import { BoardData } from '@/types';
import List from './List';
import Card from './Card';
import styles from './Board.module.css';
import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
    closestCorners,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

interface BoardProps {
    board: BoardData;
    onAddList: (title: string) => void;
    onAddCard: (listId: number, title: string) => void;
    onUpdateCard: (cardId: number, data: { title?: string; description?: string }) => void;
    onDeleteCard: (cardId: number) => void;
    onDeleteList: (listId: number) => void;
    onMoveCard: (cardId: number, newListId: number, newPosition: number) => void;
}

export default function Board({
    board,
    onAddList,
    onAddCard,
    onUpdateCard,
    onDeleteCard,
    onDeleteList,
    onMoveCard,
}: BoardProps) {
    const [boardData, setBoardData] = useState<BoardData>(board);
    const [isAddingList, setIsAddingList] = useState(false);
    const [newListTitle, setNewListTitle] = useState('');
    const [activeId, setActiveId] = useState<string | null>(null);

    // Sync props to state
    useEffect(() => {
        setBoardData(board);
    }, [board]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    const handleAddList = () => {
        if (newListTitle.trim()) {
            onAddList(newListTitle);
            setNewListTitle('');
            setIsAddingList(false);
        }
    };

    const findContainer = (id: string): number | undefined => {
        const listId = parseInt(id.replace('list-', ''));
        if (!isNaN(listId) && boardData.lists.find(l => l.id === listId)) {
            return listId;
        }

        const cardId = parseInt(id.replace('card-', ''));
        const list = boardData.lists.find(l => l.cards.some(c => c.id === cardId));
        return list?.id;
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        const overId = over?.id;

        if (overId == null || active.id in boardData.lists) {
            return;
        }

        const activeContainer = findContainer(active.id as string);
        const overContainer = findContainer(overId as string);

        if (!activeContainer || !overContainer || activeContainer === overContainer) {
            return;
        }

        setBoardData((prev) => {
            const activeListIndex = prev.lists.findIndex(l => l.id === activeContainer);
            const overListIndex = prev.lists.findIndex(l => l.id === overContainer);

            if (activeListIndex === -1 || overListIndex === -1) return prev;

            const activeList = prev.lists[activeListIndex];
            const overList = prev.lists[overListIndex];

            const activeIndex = activeList.cards.findIndex(c => `card-${c.id}` === active.id);
            const overIndex = overList.cards.findIndex(c => `card-${c.id}` === overId);

            let newIndex: number;
            if (overId.toString().startsWith('list-')) {
                newIndex = overList.cards.length + 1;
            } else {
                const isBelowOverItem =
                    over &&
                    active.rect.current.translated &&
                    active.rect.current.translated.top >
                    over.rect.top + over.rect.height;

                const modifier = isBelowOverItem ? 1 : 0;
                newIndex = overIndex >= 0 ? overIndex + modifier : overList.cards.length + 1;
            }

            const newLists = [...prev.lists];
            const newActiveCards = [...activeList.cards];
            const newOverCards = [...overList.cards];

            const [movedCard] = newActiveCards.splice(activeIndex, 1);

            // Ensure we don't go out of bounds
            const insertIndex = Math.min(newIndex, newOverCards.length);
            newOverCards.splice(insertIndex, 0, movedCard);

            newLists[activeListIndex] = { ...activeList, cards: newActiveCards };
            newLists[overListIndex] = { ...overList, cards: newOverCards };

            return { ...prev, lists: newLists };
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const activeContainer = findContainer(active.id as string);
        const overContainer = over ? findContainer(over.id as string) : null;

        if (
            !activeContainer ||
            !overContainer ||
            activeContainer !== overContainer
        ) {
            setActiveId(null);
            return;
        }

        const activeListIndex = boardData.lists.findIndex(l => l.id === activeContainer);
        const list = boardData.lists[activeListIndex];

        const activeIndex = list.cards.findIndex(c => `card-${c.id}` === active.id);
        const overIndex = list.cards.findIndex(c => `card-${c.id}` === over!.id);

        if (activeIndex !== overIndex) {
            // Optimistic update for same list reorder
            setBoardData((prev) => {
                const newLists = [...prev.lists];
                const newList = { ...list };
                newList.cards = arrayMove(list.cards, activeIndex, overIndex);
                newLists[activeListIndex] = newList;
                return { ...prev, lists: newLists };
            });

            // Trigger backend update
            const cardId = parseInt((active.id as string).replace('card-', ''));
            onMoveCard(cardId, activeContainer, overIndex);
        } else {
            // Even if indices are same, if we moved containers, we need to trigger update
            // But wait, if we moved containers, activeContainer === overContainer is true
            // because we updated state in DragOver.
            // So we need to check if the card is actually in the correct list in the BACKEND
            // We can do this by checking the original board prop?
            // Or just always trigger onMoveCard if we know we moved?

            // Actually, if we moved lists, indices might be different from original.
            // Let's just trigger the update.
            const cardId = parseInt((active.id as string).replace('card-', ''));
            onMoveCard(cardId, activeContainer, activeIndex);
        }

        setActiveId(null);
    };



    const activeCard = activeId ? (() => {
        const cardId = parseInt(activeId.replace('card-', ''));
        for (const list of boardData.lists) {
            const card = list.cards.find(c => c.id === cardId);
            if (card) return card;
        }
        return null;
    })() : null;

    return (
        <div className={styles.board}>
            <header className={styles.header}>
                <h1 className={styles.boardTitle}>{board.name}</h1>
            </header>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners} // Using closestCorners as it works well generally
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className={styles.listsContainer}>
                    {boardData.lists.map((list) => (
                        <List
                            key={list.id}
                            list={list}
                            activeId={activeId}
                            onAddCard={onAddCard}
                            onUpdateCard={onUpdateCard}
                            onDeleteCard={onDeleteCard}
                            onDeleteList={onDeleteList}
                        />
                    ))}

                    {isAddingList ? (
                        <div className={styles.addListForm}>
                            <input
                                className={styles.input}
                                type="text"
                                value={newListTitle}
                                onChange={(e) => setNewListTitle(e.target.value)}
                                placeholder="Enter list title"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleAddList();
                                    if (e.key === 'Escape') {
                                        setIsAddingList(false);
                                        setNewListTitle('');
                                    }
                                }}
                            />
                            <div className={styles.formActions}>
                                <button className={styles.addBtn} onClick={handleAddList}>
                                    Add List
                                </button>
                                <button
                                    className={styles.cancelBtn}
                                    onClick={() => {
                                        setIsAddingList(false);
                                        setNewListTitle('');
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <button
                            className={styles.addListBtn}
                            onClick={() => setIsAddingList(true)}
                        >
                            + Add a list
                        </button>
                    )}
                </div>

                <DragOverlay>
                    {activeCard ? (
                        <div className={styles.dragOverlay}>
                            <Card
                                card={activeCard}
                                onUpdate={() => { }}
                                onDelete={() => { }}
                            />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
}
