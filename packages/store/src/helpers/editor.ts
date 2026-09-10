import type {
	CalendarEvent,
	EditorData,
	EventID,
	IEventStore,
	RecurringEditMode,
} from "../types";

function withoutStorageFields(event: CalendarEvent): CalendarEvent {
	const result = { ...event };
	delete result.duration;
	delete result.exdates;
	return result;
}

export function getEditorEvent(
	events: IEventStore,
	event: CalendarEvent,
	mode: RecurringEditMode = "series",
	originalDate?: string | null,
	rawId: EventID = event.id,
	recurring = false
): EditorData {
	let date = originalDate ?? null;
	const createEditorData = (values: CalendarEvent): EditorData => ({
		id: values.id,
		values,
		rawId,
		recurring,
		recurringMode: mode,
		recurringOriginalDate: date,
	});


	return createEditorData(withoutStorageFields(event));
}
