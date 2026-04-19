/**
 * Silent behavior tracker.
 * Buffers events in memory → batch-POSTs to /api/behavior/track every 10 seconds.
 * After successful flush → invalidates recommendation cache so UI updates.
 *
 * Tracks:
 * - view: product page (only if >3 seconds — ignores quick bounces)
 * - add_to_cart / remove_from_cart
 * - search: search queries
 * - click_recommendation: when user clicks a recommended product
 */

import { apiClient as api } from '@/services/apiClient';
import { auth } from './auth';
import { queryClient } from './queryClient';

interface TrackerEvent {
    event_type: 'view' | 'add_to_cart' | 'remove_from_cart' | 'search' | 'click_recommendation';
    product_id?: number;
    duration_seconds?: number;
    metadata?: Record<string, unknown>;
}

/** Minimum seconds on a product page before we consider it a meaningful view. */
const MIN_VIEW_DURATION = 3;

let buffer: TrackerEvent[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;

async function flush() {
    if (buffer.length === 0 || !auth.isLoggedIn()) return;
    const batch = [...buffer];
    buffer = [];
    try {
        await api.post('/behavior/track', { events: batch });
        // Invalidate recommendation cache so UI picks up new behavior data
        void queryClient.invalidateQueries({ queryKey: ['shopRecommendations'] });
    } catch {
        // Put events back on failure
        buffer = [...batch, ...buffer];
    }
}

function ensureTimer() {
    if (flushTimer) return;
    flushTimer = setInterval(flush, 10_000);
    // Flush on page close
    window.addEventListener('beforeunload', () => {
        void flush();
    });
}

export const tracker = {
    track(event: TrackerEvent) {
        if (!auth.isLoggedIn()) return;
        buffer.push(event);
        ensureTimer();
    },

    /**
     * Track a product view with duration.
     * Ignores views shorter than MIN_VIEW_DURATION (quick bounces).
     */
    trackView(productId: number, durationSeconds: number) {
        if (durationSeconds < MIN_VIEW_DURATION) return; // ignore quick bounces
        this.track({
            event_type: 'view',
            product_id: productId,
            duration_seconds: Math.round(durationSeconds),
        });
    },

    trackAddToCart(productId: number) {
        this.track({ event_type: 'add_to_cart', product_id: productId });
        // Flush immediately on add-to-cart (high-signal event)
        void flush();
    },

    trackRemoveFromCart(productId: number) {
        this.track({ event_type: 'remove_from_cart', product_id: productId });
    },

    trackSearch(query: string) {
        if (!query.trim()) return;
        this.track({ event_type: 'search', metadata: { query: query.trim() } });
        // Flush immediately on search (affects recommendations)
        void flush();
    },

    trackClickRecommendation(productId: number, source: string) {
        this.track({ event_type: 'click_recommendation', product_id: productId, metadata: { source } });
    },

    /** Force flush (e.g., before navigation). */
    flush,
};
