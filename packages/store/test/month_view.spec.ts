import { test, expect } from "vite-plus/test";
import { MonthViewModel } from "../src/models/month_view";

test("month position resolution feeds a lightweight projection", () => {
	const vm = new MonthViewModel();
	vm.setRange(new Date("2025-10-15T12:00"));
	vm.process([]);

	// Third column and third week of the grid resolve to Wednesday, October 15.
	const positioned = vm.toPositionStart("month", (2.5 / 7) * 100, 50, {}, true);
	expect(positioned.start).toBeInstanceOf(Date);
	expect((positioned.start as Date).getFullYear()).toBe(2025);
	expect((positioned.start as Date).getMonth()).toBe(9);
	expect((positioned.start as Date).getDate()).toBe(15);

	const projections = vm.projectEvent({
		...positioned,
		end: new Date((positioned.start as Date).getTime() + 60 * 60 * 1000),
	});
	expect(projections).toHaveLength(1);
	expect(projections[0].section).toBe("month");
	expect(projections[0].mode).toBe("grid");
	expect(projections[0].primitives).toHaveLength(1);
	expect(projections[0].primitives[0].lane).toBeUndefined();
});
