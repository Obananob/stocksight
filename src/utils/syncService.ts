import { offlineStorage, PendingSale } from './offlineStorage';
import { supabase } from '@/integrations/supabase/client';

export const syncService = {
    syncNow: async () => {
        const unsynced = await offlineStorage.getUnsyncedSales();
        if (unsynced.length === 0) return;

        for (const sale of unsynced) {
            try {
                // Record the sale in Supabase
                const { error: saleError } = await supabase
                    .from('sales')
                    .insert({
                        product_id: sale.product_id,
                        user_id: sale.user_id,
                        quantity: sale.quantity,
                        unit_price: sale.unit_price,
                        total_price: sale.total_price,
                        created_at: sale.created_at
                    });

                if (saleError) throw saleError;

                // If successful, mark as synced locally
                if (sale.id) {
                    await offlineStorage.markAsSynced(sale.id);
                }
            } catch (error) {
                console.error('Failed to sync sale:', error);
                // Continue to next sale
            }
        }

        // Cleanup synced records
        await offlineStorage.removeSynced();
    },

    startSyncTimer: (intervalMs: number = 30000) => {
        // Initial sync
        try {
            syncService.syncNow();
        } catch (error) {
            console.error('Initial sync failed:', error);
        }

        // Periodic sync
        setInterval(() => {
            try {
                syncService.syncNow();
            } catch (error) {
                console.error('Periodic sync failed:', error);
            }
        }, intervalMs);

        // Sync on connection recovery
        window.addEventListener('online', () => {
            try {
                syncService.syncNow();
            } catch (error) {
                console.error('Online sync failed:', error);
            }
        });
    }
};
