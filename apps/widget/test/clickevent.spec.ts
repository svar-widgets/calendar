import { expect, test } from "vite-plus/test";
import { clickevent } from "../src/directives/clickevent";

function mouse(type: string, x = 10, y = 10): Event {
	const event = new Event(type);
	Object.defineProperties(event, {
		button: { value: 0 },
		clientX: { value: x },
		clientY: { value: y },
	});
	return event;
}

function eventNode(rawId: string | number): HTMLElement {
	const node = new EventTarget() as EventTarget & {
		tagName: string;
		parentNode: null;
		getAttribute: (name: string) => string | null;
	};
	node.tagName = "DIV";
	node.parentNode = null;
	node.getAttribute = name => (name === "data-id" ? String(rawId) : null);
	return node as unknown as HTMLElement;
}

test.each([
	{ rawId: "10###2026-03-09", id: 10 },
	{ rawId: 10, id: 10 },
])("click keeps public id and sends rawId $rawId", ({ rawId, id }) => {
	const calls: { action: string; data: Record<string, unknown> }[] = [];
	const node = eventNode(rawId);
	const action = clickevent(node, {
		exec: (name, data) => calls.push({ action: name, data }),
		getEvent: value => {
			expect(value).toBe(rawId);
			return {
				id,
				start: new Date("2026-03-09T09:00:00Z"),
				end: new Date("2026-03-09T10:00:00Z"),
			};
		},
	});

	node.dispatchEvent(mouse("mousedown"));
	node.dispatchEvent(mouse("mouseup"));

	expect(calls).toEqual([{ action: "select-event", data: { id, rawId } }]);
	action.destroy();
});
