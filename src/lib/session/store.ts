/**
 * MoodMuse - Session Store
 * 
 * In-memory session storage for v1.
 * Sessions track the user's journey: mood → language → results.
 * 
 * Design Decision: Using in-memory storage because:
 * 1. No user accounts in v1
 * 2. Sessions are ephemeral by design
 * 3. Easy to swap for Redis/database later
 * 
 * Trade-off: Sessions are lost on server restart.
 * This is acceptable for v1/portfolio demo.
 */

import { MoodResult } from '@/lib/mood/types';
import { SongMatch } from '@/lib/songs/types';

/**
 * Represents a user session through the MoodMuse flow.
 */
export interface Session {
    // Unique session identifier
    id: string;

    // When the session was created
    createdAt: Date;

    // Session expires after this time (default: 1 hour)
    expiresAt: Date;

    // The analyzed mood (set after mood analysis completes)
    moodResult?: MoodResult;

    // User's language preference for this session
    language?: string;

    // Matched songs (set after song matching completes)
    songs?: SongMatch[];

    // Current step in the flow
    step: 'mood' | 'language' | 'processing' | 'results';
}

/**
 * In-memory session storage.
 * In production, this would be Redis or a database.
 */
class SessionStore {
    private sessions: Map<string, Session> = new Map();

    // Session lifetime in milliseconds (1 hour)
    private readonly SESSION_TTL = 60 * 60 * 1000;

    /**
     * Create a new session.
     */
    create(id: string): Session {
        const now = new Date();
        const session: Session = {
            id,
            createdAt: now,
            expiresAt: new Date(now.getTime() + this.SESSION_TTL),
            step: 'mood',
        };

        this.sessions.set(id, session);
        this.cleanupExpired(); // Opportunistic cleanup

        return session;
    }

    /**
     * Get a session by ID.
     * Returns null if session doesn't exist or is expired.
     * Refreshes the session TTL on each access.
     */
    get(id: string): Session | null {
        const session = this.sessions.get(id);

        if (!session) {
            return null;
        }

        // Check if expired
        if (new Date() > session.expiresAt) {
            this.sessions.delete(id);
            return null;
        }

        // Refresh the TTL on each access (keeps session alive while user is active)
        session.expiresAt = new Date(Date.now() + this.SESSION_TTL);
        this.sessions.set(id, session);

        return session;
    }

    /**
     * Update an existing session.
     */
    update(id: string, updates: Partial<Session>): Session | null {
        const session = this.get(id);

        if (!session) {
            return null;
        }

        const updated = { ...session, ...updates };
        this.sessions.set(id, updated);

        return updated;
    }

    /**
     * Delete a session.
     */
    delete(id: string): boolean {
        return this.sessions.delete(id);
    }

    /**
     * Clean up expired sessions.
     * Called opportunistically to prevent memory leaks.
     */
    private cleanupExpired(): void {
        const now = new Date();

        for (const [id, session] of this.sessions) {
            if (now > session.expiresAt) {
                this.sessions.delete(id);
            }
        }
    }

    /**
     * Get the count of active sessions (for debugging).
     */
    get count(): number {
        return this.sessions.size;
    }
}

// Singleton instance
// This persists across API requests within the same server instance
export const sessionStore = new SessionStore();
