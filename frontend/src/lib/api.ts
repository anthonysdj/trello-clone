const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL
    ? `${process.env.NEXT_PUBLIC_API_URL}/api`
    : '/api';  // Use relative URL - nginx will proxy to backend

export const api = {
    // Board operations
    async getBoard(id: number) {
        const response = await fetch(`${API_BASE_URL}/boards/${id}`);
        if (!response.ok) throw new Error('Failed to fetch board');
        return response.json();
    },

    async createBoard(name: string) {
        const response = await fetch(`${API_BASE_URL}/boards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });
        if (!response.ok) throw new Error('Failed to create board');
        return response.json();
    },

    // List operations
    async createList(title: string, position: number, boardId: number) {
        const response = await fetch(`${API_BASE_URL}/lists`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, position, boardId }),
        });
        if (!response.ok) throw new Error('Failed to create list');
        return response.json();
    },

    async updateList(id: number, data: { title?: string; position?: number }) {
        const response = await fetch(`${API_BASE_URL}/lists/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update list');
        return response.json();
    },

    async deleteList(id: number) {
        const response = await fetch(`${API_BASE_URL}/lists/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete list');
    },

    // Card operations
    async createCard(title: string, position: number, listId: number, description?: string) {
        const response = await fetch(`${API_BASE_URL}/cards`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, description, position, listId }),
        });
        if (!response.ok) throw new Error('Failed to create card');
        return response.json();
    },

    async updateCard(id: number, data: { title?: string; description?: string; position?: number; listId?: number }) {
        const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) throw new Error('Failed to update card');
        return response.json();
    },

    async deleteCard(id: number) {
        const response = await fetch(`${API_BASE_URL}/cards/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete card');
    },
};
