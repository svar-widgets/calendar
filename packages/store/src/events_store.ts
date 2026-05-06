import { tempID } from "@svar-ui/lib-state";
import type { CalendarEvent, IEventStore, EventID } from "./types";

export class EventsStore implements IEventStore {
	protected events: CalendarEvent[] = [];

	constructor(initialEvents?: CalendarEvent[]) {
		if (initialEvents) {
			for (const ev of initialEvents) {
				this.addEvent(ev);
			}
		}
	}

	addEvent(event: Partial<CalendarEvent>): CalendarEvent {
		const id = event.id ?? tempID();
		const full = { ...event, id } as CalendarEvent;
		this.events.push(full);
		return full;
	}

	updateEvent(
		id: EventID,
		updates: Partial<CalendarEvent>,
		_mode?: "single" | "following",
		_originalDate?: string
	): CalendarEvent | null {
		const idx = this.events.findIndex(e => e.id === id);
		if (idx === -1) return null;
		const existing = this.events[idx];
		const updated = { ...existing, ...updates, id: existing.id };
		this.events[idx] = updated;
		return updated;
	}

	removeEvent(id: EventID): boolean {
		const idx = this.events.findIndex(e => e.id === id);
		if (idx === -1) return false;
		this.events.splice(idx, 1);
		return true;
	}

	getEvent(id: EventID): CalendarEvent | undefined {
		return this.events.find(e => e.id === id);
	}

	getEvents(start?: Date, end?: Date): CalendarEvent[] {
		if (!start && !end) return [...this.events];

		return this.events.filter(e => {
			if (start && !(e.end > start)) return false;
			if (end && !(e.start < end)) return false;
			return true;
		});
	}

	clear(): void {
		this.events = [];
	}

	getCount(): number {
		return this.events.length;
	}
}
