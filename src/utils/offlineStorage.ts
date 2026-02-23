import Dexie, { Table } from 'dexie';

export interface PendingSale {
    id?: number;
    product_id: string;
    product_name: string;
    user_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    created_at: string;
    synced: number; // 0 for no, 1 for yes
}

export class StockSightDB extends Dexie {
    pendingSales!: Table<PendingSale>;

    constructor() {
        super('StockSightDB');
        this.version(1).stores({
            pendingSales: '++id, synced, created_at'
        });
    }
}

export const db = new StockSightDB();

export const offlineStorage = {
    saveSale: async (sale: Omit<PendingSale, 'id' | 'synced'>) => {
        return await db.pendingSales.add({
            ...sale,
            synced: 0
        });
    },

    getUnsyncedSales: async () => {
        return await db.pendingSales.where('synced').equals(0).toArray();
    },

    markAsSynced: async (id: number) => {
        return await db.pendingSales.update(id, { synced: 1 });
    },

    removeSynced: async () => {
        return await db.pendingSales.where('synced').equals(1).delete();
    }
};
