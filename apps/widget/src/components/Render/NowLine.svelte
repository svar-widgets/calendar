<script lang="ts">
	import type { ScaleUnit } from "@svar-ui/calendar-store";
	import { onMount } from "svelte";

	const { yHeaders, dy } = $props<{
		yHeaders: ScaleUnit[][] | null;
		dy: number;
	}>();

	let now = $state(new Date());

	onMount(() => {
		const id = setInterval(() => {
			now = new Date();
		}, 60_000);
		return () => clearInterval(id);
	});

	const position = $derived.by(() => {
		if (!yHeaders) return null;
		const inner = yHeaders[yHeaders.length - 1];
		if (!inner?.length) return null;

		const first = inner[0]?.ui?.date as Date | undefined;
		const last = inner[inner.length - 1]?.ui?.date as Date | undefined;
		if (!first || !last) return null;

		const rangeStart = first.getTime();
		// range end = last unit position + last unit size worth of time
		const unitMs =
			(last.getTime() - first.getTime()) / (inner.length - 1 || 1);
		const rangeEnd = last.getTime() + unitMs;
		const nowMs = now.getTime();

		if (nowMs < rangeStart || nowMs > rangeEnd) return null;

		// same math as LinearScale.eventToPosition
		const pos = ((nowMs - rangeStart) / (rangeEnd - rangeStart)) * 100;
		return pos;
	});
</script>

{#if position !== null}
	<div
		class="wx-now-line"
		style="top:{dy * position}px"
		aria-hidden="true"
	>
		<div class="wx-now-dot"></div>
	</div>
{/if}

<style>
	.wx-now-line {
		position: absolute;
		left: 0;
		right: 0;
		height: 0;
		z-index: 3;
		pointer-events: none;
	}
	.wx-now-line::after {
		content: "";
		position: absolute;
		left: 0;
		right: 0;
		top: 0;
		height: 2px;
		background: var(--wx-color-danger);
		transform: translateY(-50%);
	}
	.wx-now-dot {
		position: absolute;
		left: 0;
		top: 0;
		width: 8px;
		height: 8px;
		border-radius: 50%;
		background: var(--wx-color-danger);
		transform: translate(-50%, -50%);
	}
</style>
