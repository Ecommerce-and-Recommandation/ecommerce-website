/**
 * Silent behavior tracker.
 * Buffers events in memory → batch-POSTs to /api/behavior/track every 10 seconds.
 */

import { api } from './api';
import { auth } from './auth';

interface TrackerEvent {
    event_type: 'view' | 'add_to_cart' | 'remove_from_cart' | 'search' | 'click_recommendation';
    product_id?: number;
    duration_seconds?: number;
    metadata?: Record<string, unknown>;
}

let buffer: TrackerEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flush() {
    if (buffer.length === 0 || !auth.isLoggedIn()) return;
    const batch = [...buffer];
    buffer = [];
    try {
        await api.post('/behavior/track', { events: batch });
    } catch {
        // Put events back on failure
        buffer = [...batch, ...buffer];
    }
}

function ensureTimer() {
    if (flushTimer) return;
    flushTimer = setInterval(flush, 10_000);
    // Flush on page close
    window.addEventListener('beforeunload', flush);
}

export const tracker = {
    track(event: TrackerEvent) {
        if (!auth.isLoggedIn()) return;
        buffer.push(event);
        ensureTimer();
    },

    trackView(productId: number, durationSeconds: number) {
        this.track({ event_type: 'view', product_id: productId, duration_seconds: durationSeconds });
    },

    trackAddToCart(productId: number) {
        this.track({ event_type: 'add_to_cart', product_id: productId });
    },

    trackRemoveFromCart(productId: number) {
        this.track({ event_type: 'remove_from_cart', product_id: productId });
    },

    trackSearch(query: string) {
        this.track({ event_type: 'search', metadata: { query } });
    },

    trackClickRecommendation(productId: number, source: string) {
        this.track({ event_type: 'click_recommendation', product_id: productId, metadata: { source } });
    },

    /** Force flush (e.g., before navigation). */
    flush,
};
