import { supabase } from './supabaseClient';

export interface CalendarEvent {
    id: string;
    summary: string;
    start: { dateTime: string };
    end: { dateTime: string };
    htmlLink: string;
}

class CalendarService {
    async signInWithGoogle() {
        if (!supabase) throw new Error("Supabase not configured");

        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                scopes: 'https://www.googleapis.com/auth/calendar',
                redirectTo: window.location.origin
            }
        });

        if (error) throw error;
    }

    async signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
    }

    async getSession() {
        if (!supabase) return null;
        const { data } = await supabase.auth.getSession();
        return data.session;
    }

    async fetchEvents(start: Date, end: Date): Promise<CalendarEvent[]> {
        const session = await this.getSession();
        if (!session?.provider_token) {
            console.warn("No provider token found. User might need to sign in again with scopes.");
            return [];
        }

        const timeMin = start.toISOString();
        const timeMax = end.toISOString();

        try {
            const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${timeMin}&timeMax=${timeMax}&singleEvents=true&orderBy=startTime`, {
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`
                }
            });

            if (!response.ok) {
                throw new Error(`Calendar API Error: ${response.statusText}`);
            }

            const data = await response.json();
            return data.items || [];
        } catch (error) {
            console.error("Failed to fetch calendar events", error);
            return [];
        }
    }

    async createEvent(event: { summary: string, start: string, end: string, description?: string }) {
        const session = await this.getSession();
        if (!session?.provider_token) return null;

        try {
            const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${session.provider_token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    summary: event.summary,
                    description: event.description,
                    start: { dateTime: event.start },
                    end: { dateTime: event.end }
                })
            });

            if (!response.ok) throw new Error("Failed to create event");
            return await response.json();
        } catch (error) {
            console.error("Error creating calendar event", error);
            throw error;
        }
    }
}

export const calendarService = new CalendarService();
