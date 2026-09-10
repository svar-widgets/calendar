import type { EventID } from "../types";

const SEPARATOR = "#";

export interface DecodedEventId {
	id: EventID;
	index?: number;
	unitId?: EventID;
	eventDate?: string;
}

export interface EventIdDetails {
	index?: number | null;
	unitId?: EventID | null;
	eventDate?: string | null;
}

function encodeValue(value: EventID): string {
	return typeof value === "string" ? `:${value}` : String(value);
}

function decodeValue(value: string): EventID {
	return value.startsWith(":") ? value.slice(1) : Number(value);
}

function setDetail<T>(
	current: T | undefined,
	next: T | null | undefined
): T | undefined {
	return next === undefined ? current : next === null ? undefined : next;
}

/**
 * The `YYYY-MM-DD` occurrence key carried by a recurring instance id. Built
 * from local calendar parts, matching how occurrences are expanded.
 */
export function formatEventDate(date: Date): string {
	const pad = (value: number) => String(value).padStart(2, "0");
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function decodeId(value: EventID): DecodedEventId {
	if (typeof value !== "string" || !value.includes(SEPARATOR)) {
		return { id: value };
	}

	const [rawId, ...details] = value.split(SEPARATOR);
	const id = decodeValue(rawId);
	const [rawIndex, rawUnitId, eventDate] = details;
	return {
		id,
		...(rawIndex ? { index: Number(rawIndex) } : {}),
		...(rawUnitId ? { unitId: decodeValue(rawUnitId) } : {}),
		...(eventDate ? { eventDate } : {}),
	};
}

export function encodeId(value: EventID, details: EventIdDetails): EventID {
	const decoded = decodeId(value);
	const index = setDetail(decoded.index, details.index);
	const unitId = setDetail(decoded.unitId, details.unitId);
	const eventDate = setDetail(decoded.eventDate, details.eventDate);

	if (index === undefined && unitId === undefined && eventDate === undefined) {
		return decoded.id;
	}

	const encodedId = encodeValue(decoded.id);
	return [
		encodedId,
		index ?? "",
		unitId === undefined ? "" : encodeValue(unitId),
		eventDate ?? "",
	].join(SEPARATOR);
}
