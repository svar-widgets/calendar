import type { ICalendarStore, RecurringEditMode, StoreActions } from "../types";
import { decodeId } from "../helpers/ids";
import { getEditorEvent } from "../helpers/editor";

export function selectEvent(
	store: ICalendarStore,
	params: StoreActions["select-event"]
) {
	if (params.id == null) {
		store.setState({ editorData: null });
		return;
	}

	const { events } = store.getState();
	const rawId = params.rawId ?? params.id;
	const event = events.getEvent(params.id);
	if (event) {
		const mode: RecurringEditMode =
			params.mode ?? (event.masterEventId != null ? "single" : "series");
		store.setState({
			editorData: getEditorEvent(
				events,
				event,
				mode,
				decodeId(rawId).eventDate,
				rawId,
				!!store.meta.recurring
			),
		});
	}
}
