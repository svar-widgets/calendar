import { expect, test } from "vite-plus/test";
import { decodeId, encodeId } from "../src/helpers/ids";

test("keeps canonical ids unchanged", () => {
	expect(decodeId(42)).toEqual({ id: 42 });
	expect(decodeId("550e8400-e29b-41d4-a716-446655440000")).toEqual({
		id: "550e8400-e29b-41d4-a716-446655440000",
	});
	expect(decodeId("temp:/7")).toEqual({ id: "temp:/7" });
});

test("encodes fixed render instance slots", () => {
	expect(encodeId(42, { index: 3 })).toBe("42#3##");
	expect(encodeId("42", { index: 3 })).toBe(":42#3##");
	expect(encodeId(42, { eventDate: "2026-07-13" })).toBe("42###2026-07-13");
});

test("round trips combined render instance details", () => {
	const encoded = encodeId("temp:/7", {
		index: 2,
		unitId: "550e8400-e29b-41d4-a716-446655440000",
		eventDate: "2026-07-13",
	});

	expect(encoded).toBe(
		":temp:/7#2#:550e8400-e29b-41d4-a716-446655440000#2026-07-13"
	);
	expect(decodeId(encoded)).toEqual({
		id: "temp:/7",
		index: 2,
		unitId: "550e8400-e29b-41d4-a716-446655440000",
		eventDate: "2026-07-13",
	});
});

test("merges details into an existing synthetic id", () => {
	const recurring = encodeId(10, { eventDate: "2026-07-13" });
	const unit = encodeId(recurring, { index: 0, unitId: 7 });

	expect(unit).toBe("10#0#7#2026-07-13");
	expect(decodeId(unit)).toEqual({
		id: 10,
		index: 0,
		unitId: 7,
		eventDate: "2026-07-13",
	});
});
