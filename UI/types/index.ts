export interface User {
    id: string;
    email: string;
}

export interface Category {
    id: string;
    name: string;
}

export interface Unit {
    id: string;
    name: string;
}

export interface Item {
    id: string;
    name: string;
    category_name: string;
    image?: string;
    current_price?: number;
    previous_price?: number;
    unit?: string;
}

export interface PriceEntry {
    id: string;
    item_id: string;
    unit_id: string;
    price: number;
    created_at: string;
}
