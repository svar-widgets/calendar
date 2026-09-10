<script lang="ts">
	import type { Primitive } from "@svar-ui/calendar-store";

	const { primitives, dx, dy } = $props<{
		primitives: Primitive[];
		dx: number;
		dy: number;
	}>();

	const gap = 2;

	function style(primitive: Primitive): string {
		const left = primitive.x * dx + gap;
		const top = primitive.y * dy + gap;
		const width = Math.max(2, primitive.width * dx - gap * 2);
		const height = Math.max(2, primitive.height * dy - gap * 2);
		return `left:${left}px;top:${top}px;width:${width}px;height:${height}px`;
	}
</script>

<div class="wx-event-placeholders" aria-hidden="true">
	{#each primitives as primitive (primitive.id)}
		<div class="wx-event-placeholder" style={style(primitive)}></div>
	{/each}
</div>

<style>
	.wx-event-placeholders {
		position: absolute;
		inset: 0;
		z-index: 5;
		pointer-events: none;
	}

	.wx-event-placeholder {
		position: absolute;
		box-sizing: border-box;
		min-width: 2px;
		min-height: 2px;
		border: 2px solid var(--wx-color-primary);
		border-radius: var(--wx-border-radius);
		background: color-mix(in srgb, var(--wx-color-primary) 20%, var(--wx-background) 30%, transparent);
	}
</style>
