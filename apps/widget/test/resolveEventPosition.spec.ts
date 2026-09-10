import { test, expect } from "vite-plus/test";
import type { SectionResult, ViewModel } from "@svar-ui/calendar-store";
import { resolveEventPosition } from "../src/components/Render/resolveEventPosition";

const element = {
	scrollLeft: 0,
	scrollTop: 0,
	getBoundingClientRect: () => ({
		left: 100,
		right: 500,
		top: 50,
		bottom: 250,
	}),
	contains: (_element: HTMLElement) => true,
} as HTMLElement;
const document = {
	elementFromPoint: (_x: number, _y: number) => {
		return element;
	},
};

const section = { name: "timeGrid", mode: "boxes" } as SectionResult;

test("resolves viewport coordinates and preserves explicit duration", () => {
	let coordinates: [number, number] | undefined;
	const model = {
		toPositionStart(_section: string, x: number, y: number) {
			coordinates = [x, y];
			return { start: new Date("2025-10-29T09:00:00") };
		},
	} as ViewModel;

	const result = resolveEventPosition(
		{ clientX: 300, clientY: 150 },
		{
			duration: 30 * 60 * 1000,
			start: new Date("2025-01-01T00:00:00"),
			end: new Date("2025-01-01T02:00:00"),
		},
		section,
		element,
		4,
		2,
		model,
		document
	);

	expect(coordinates).toEqual([50, 50]);
	expect(result?.start).toEqual(new Date("2025-10-29T09:00:00"));
	expect(result?.end).toEqual(new Date("2025-10-29T09:30:00"));
});

test("returns null outside the section or for unsupported modes", () => {
	const model = {
		toPositionStart() {
			throw new Error("should not resolve");
		},
	} as unknown as ViewModel;

	expect(
		resolveEventPosition(
			{ clientX: 10, clientY: 10 },
			{},
			section,
			element,
			4,
			2,
			model,
			document
		)
	).toBeNull();
	expect(
		resolveEventPosition(
			{ clientX: 300, clientY: 150 },
			{},
			{ ...section, mode: "list" },
			element,
			4,
			2,
			model,
			document
		)
	).toBeNull();
});
