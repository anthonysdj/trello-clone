'use client';

import { useState } from 'react';
import { CardData } from '@/types';
import styles from './Card.module.css';

interface CardProps {
    card: CardData;
    onUpdate: (id: number, data: { title?: string; description?: string }) => void;
    onDelete: (id: number) => void;
}

export default function Card({ card, onUpdate, onDelete }: CardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [title, setTitle] = useState(card.title);
    const [description, setDescription] = useState(card.description || '');

    const handleSave = () => {
        if (title.trim()) {
            onUpdate(card.id, { title, description });
            setIsEditing(false);
        }
    };

    const handleCancel = () => {
        setTitle(card.title);
        setDescription(card.description || '');
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <div className={styles.card}>
                <input
                    className={styles.input}
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Card title"
                    autoFocus
                />
                <textarea
                    className={styles.textarea}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={3}
                />
                <div className={styles.actions}>
                    <button className={styles.saveBtn} onClick={handleSave}>
                        Save
                    </button>
                    <button className={styles.cancelBtn} onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.card} onClick={() => setIsEditing(true)}>
            <div className={styles.cardHeader}>
                <h3 className={styles.title}>{card.title}</h3>
                <button
                    className={styles.deleteBtn}
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete(card.id);
                    }}
                >
                    ×
                </button>
            </div>
            {card.description && (
                <p className={styles.description}>{card.description}</p>
            )}
        </div>
    );
}
