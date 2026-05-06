import type { CalendarEvent } from "../../types";

export function isMultiDay(event: CalendarEvent): boolean {
	if (event.allDay) return true;
	const s = event.start;
	const e = event.end;
	return (
		s.getFullYear() !== e.getFullYear() ||
		s.getMonth() !== e.getMonth() ||
		s.getDate() !== e.getDate()
	);
}
