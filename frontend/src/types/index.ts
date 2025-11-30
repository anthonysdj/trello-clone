export interface CardData {
    id: number;
    title: string;
    description?: string;
    position: number;
}

export interface ListData {
    id: number;
    title: string;
    position: number;
    cards: CardData[];
}

export interface BoardData {
    id: number;
    name: string;
    lists: ListData[];
}
