<script lang="ts">
	import type { ScaleUnit } from "@svar-ui/calendar-store";

	const { headers, direction } = $props<{
		headers: ScaleUnit[][];
		direction: "x" | "y";
	}>();
</script>

{#if direction === "x"}
	<div class="wx-x-headers">
		{#each headers as level}
			<div class="wx-x-header-row">
				{#each level as unit}
					<div
						class="wx-x-header-cell"
						role="columnheader"
						style="left:{unit.position}%;width:{unit.size}%"
					>
						{unit.label}
					</div>
				{/each}
			</div>
		{/each}
	</div>
{:else}
	<div class="wx-y-headers">
		{#each headers as level}
			<div class="wx-y-header-col">
				{#each level as unit}
					<div
						class="wx-y-header-cell"
						role="rowheader"
						style="top:{unit.position}%;height:{unit.size}%"
					>
						{unit.label}
					</div>
				{/each}
			</div>
		{/each}
	</div>
{/if}

<style>
	.wx-x-headers {
		flex-shrink: 0;
		border-bottom: var(--wx-border);
	}
	.wx-x-header-row {
		position: relative;
		display: flex;
		height: 32px;
	}
	.wx-x-header-cell {
		position: absolute;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 13px;
		font-weight: 500;
		border-right: var(--wx-border);
	}
	.wx-x-header-cell:last-child {
		border-right: none;
	}

	.wx-y-headers {
		display: flex;
		flex-shrink: 0;
		width: var(--wx-calendar-y-scale-width, 60px);
		height: 100%;
		border-right: var(--wx-border);
	}
	.wx-y-header-col {
		position: relative;
		flex: 1;
		min-width: 0;
		height: 100%;
	}
	.wx-y-header-cell {
		position: absolute;
		width: 100%;
		display: flex;
		align-items: flex-start;
		justify-content: center;
		font-size: 11px;
		color: var(--wx-color-font-alt);
		padding-top: 2px;
	}
</style>
