'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { BoardData, CardData } from '@/types';
import Board from '@/components/Board';
import styles from './page.module.css';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [board, setBoard] = useState<BoardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = async () => {
    try {
      setLoading(true);
      const data = await api.getBoard(1); // Load board with ID 1
      setBoard(data);
      setError(null);
    } catch (err) {
      setError('Failed to load board. Make sure the backend is running on port 8080.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    loadBoard();
  }, []);

  const handleAddList = async (title: string) => {
    if (!board) return;
    try {
      const newList = await api.createList(title, board.lists.length, board.id);
      setBoard({
        ...board,
        lists: [...board.lists, { ...newList, cards: [] }],
      });
    } catch (err) {
      console.error('Failed to create list:', err);
    }
  };

  const handleAddCard = async (listId: number, title: string) => {
    if (!board) return;
    const list = board.lists.find((l) => l.id === listId);
    if (!list) return;

    try {
      const newCard = await api.createCard(title, list.cards.length, listId);
      setBoard({
        ...board,
        lists: board.lists.map((l) =>
          l.id === listId ? { ...l, cards: [...l.cards, newCard] } : l
        ),
      });
    } catch (err) {
      console.error('Failed to create card:', err);
    }
  };

  const handleUpdateCard = async (
    cardId: number,
    data: { title?: string; description?: string }
  ) => {
    if (!board) return;
    try {
      await api.updateCard(cardId, data);
      setBoard({
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.map((card) =>
            card.id === cardId ? { ...card, ...data } : card
          ),
        })),
      });
    } catch (err) {
      console.error('Failed to update card:', err);
    }
  };

  const handleDeleteCard = async (cardId: number) => {
    if (!board) return;
    try {
      await api.deleteCard(cardId);
      setBoard({
        ...board,
        lists: board.lists.map((list) => ({
          ...list,
          cards: list.cards.filter((card) => card.id !== cardId),
        })),
      });
    } catch (err) {
      console.error('Failed to delete card:', err);
    }
  };

  const handleDeleteList = async (listId: number) => {
    if (!board) return;
    try {
      await api.deleteList(listId);
      setBoard({
        ...board,
        lists: board.lists.filter((list) => list.id !== listId),
      });
    } catch (err) {
      console.error('Failed to delete list:', err);
    }
  };

  const handleMoveCard = async (cardId: number, newListId: number, newPosition: number) => {
    if (!board) return;

    // Find the card and its current list
    let sourceListId: number | null = null;
    let movedCard: CardData | null = null;

    for (const list of board.lists) {
      const card = list.cards.find(c => c.id === cardId);
      if (card) {
        sourceListId = list.id;
        movedCard = card;
        break;
      }
    }

    if (!movedCard || sourceListId === null) return;

    // Optimistically update the UI
    const newLists = board.lists.map(list => {
      if (list.id === sourceListId && sourceListId === newListId) {
        // Moving within the same list
        const newCards = [...list.cards];
        const cardIndex = newCards.findIndex(c => c.id === cardId);
        if (cardIndex === -1) return list;

        const [removed] = newCards.splice(cardIndex, 1);
        newCards.splice(newPosition, 0, { ...removed, position: newPosition });

        return { ...list, cards: newCards };
      } else if (list.id === sourceListId) {
        // Remove card from source list
        return {
          ...list,
          cards: list.cards.filter(c => c.id !== cardId),
        };
      } else if (list.id === newListId) {
        // Add card to target list at the specified position
        const newCards = [...list.cards];
        newCards.splice(newPosition, 0, { ...movedCard, position: newPosition });
        return {
          ...list,
          cards: newCards,
        };
      }
      return list;
    });

    setBoard({
      ...board,
      lists: newLists,
    });

    // Update the backend
    try {
      await api.updateCard(cardId, { listId: newListId, position: newPosition });
    } catch (err) {
      console.error('Failed to move card:', err);
      // Reload board on error to sync with backend
      loadBoard();
    }
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading your board...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <h2>⚠️ Connection Error</h2>
          <p>{error}</p>
          <button className={styles.retryBtn} onClick={loadBoard}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!board) {
    return null;
  }

  return (
    <main className={styles.page}>
      <Board
        board={board}
        onAddList={handleAddList}
        onAddCard={handleAddCard}
        onUpdateCard={handleUpdateCard}
        onDeleteCard={handleDeleteCard}
        onDeleteList={handleDeleteList}
        onMoveCard={handleMoveCard}
      />
    </main>
  );
}
