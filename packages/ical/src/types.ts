export type EventID = string | number;

export interface CalendarEvent {
	id: EventID;
	start: Date;
	end: Date;
	allDay?: boolean;
	text?: string;
	[key: string]: any;
}
