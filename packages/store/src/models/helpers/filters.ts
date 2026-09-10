import type { CalendarEvent } from "../../types";

export function isMultiDay(event: CalendarEvent): boolean {
	if (event.allDay) return true;
	const s = event.start;
	let e = event.end;
	// end is exclusive: an end exactly at midnight belongs to the previous day
	if (
		e.getHours() === 0 &&
		e.getMinutes() === 0 &&
		e.getSeconds() === 0 &&
		e.getMilliseconds() === 0
	) {
		e = new Date(e.getTime() - 1);
	}
	return (
		s.getFullYear() !== e.getFullYear() ||
		s.getMonth() !== e.getMonth() ||
		s.getDate() !== e.getDate()
	);
}
