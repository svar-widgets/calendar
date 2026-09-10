export type EventID = string | number;

export interface CalendarEvent {
	id: EventID;
	start: Date;
	end: Date;
	allDay?: boolean;
	text?: string;
	/** iCal RRULE of a recurring master */
	rrule?: string;
	/** occurrences removed from the series */
	exdates?: Date[];
	/** set on an exception: the master it belongs to */
	masterEventId?: EventID;
	/** set on an exception: the occurrence it replaces */
	originalDate?: Date;
	/** single instance duration in ms, set by the store on a master */
	duration?: number;
	[key: string]: any;
}
