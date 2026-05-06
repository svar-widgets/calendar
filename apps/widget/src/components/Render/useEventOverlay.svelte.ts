import { getID, locate } from "@svar-ui/lib-dom";
import type { EventPopupInfo } from "../../directives/clickevent.js";
import type { TPosition } from "@svar-ui/lib-dom";
import type { EventID } from "@svar-ui/calendar-store";

export function useEventOverlay(
	getEvent: (id: EventID) => any,
	getEventPopupAt: (element: HTMLElement) => TPosition
) {
	let _tooltipTarget: HTMLElement | null = null;
	let tooltipState = $state<{ event: any } | null>(null);
	let mousePos = $state({ x: 0, y: 0 });
	let eventPopupState = $state<{
		event: any;
		element: HTMLElement;
		at: TPosition;
	} | null>(null);

	function handleTooltipMove(e: MouseEvent) {
		mousePos = { x: e.clientX, y: e.clientY };
		if (eventPopupState || !e.target) return;
		const el = locate(e.target as HTMLElement) ?? null;
		if (el === _tooltipTarget) return;
		_tooltipTarget = el;
		if (!el) {
			tooltipState = null;
			return;
		}
		const ev = getEvent(getID(el));
		tooltipState = ev ? { event: ev } : null;
	}

	function handleTooltipLeave() {
		_tooltipTarget = null;
		tooltipState = null;
	}

	function handleEventPopup(info: EventPopupInfo | null) {
		tooltipState = null;
		_tooltipTarget = null;
		if (!info) {
			eventPopupState = null;
			return;
		}
		const ev = getEvent(info.eventId);
		if (ev) {
			eventPopupState = {
				event: ev,
				element: info.element,
				at: getEventPopupAt(info.element),
			};
		}
	}

	function hideEventPopup() {
		eventPopupState = null;
	}

	return {
		get tooltipState() {
			return tooltipState;
		},
		get mousePos() {
			return mousePos;
		},
		get eventPopupState() {
			return eventPopupState;
		},
		handleTooltipMove,
		handleTooltipLeave,
		handleEventPopup,
		hideEventPopup,
	};
}
