<script lang="ts">
	const { event, mode } = $props<{
		event: any;
		mode: string;
	}>();

	function formatTime(d: Date) {
		return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	}

	const icon = $derived(
		event.priority === "high" ? "!!" :
		event.priority === "medium" ? "!" : ""
	);
</script>

{#if mode === "boxes"}
	<div class="custom-box">
		<div class="custom-box-header">
			{#if icon}<span class="custom-icon">{icon}</span>{/if}
			<span class="custom-title">{event.text || ""}</span>
		</div>
		<div class="custom-time">{formatTime(event.start)} - {formatTime(event.end)}</div>
		{#if event.priority}
			<div class="custom-badge custom-badge-{event.priority}">{event.priority}</div>
		{/if}
	</div>
{:else}
	<span class="custom-bar">
		{#if icon}<span class="custom-icon">{icon}</span>{/if}
		<span class="custom-bar-title">{event.text || ""}</span>
	</span>
{/if}

<style>
	.custom-box {
		padding: 2px 4px;
	}
	.custom-box-header {
		display: flex;
		align-items: center;
		gap: 4px;
		font-weight: 600;
		font-size: 12px;
	}
	.custom-time {
		font-size: 10px;
		opacity: 0.85;
	}
	.custom-badge {
		display: inline-block;
		margin-top: 2px;
		padding: 0 4px;
		border-radius: 3px;
		font-size: 9px;
		font-weight: 600;
		text-transform: uppercase;
	}
	.custom-badge-high { background: #c62828; color: #fff; }
	.custom-badge-medium { background: #ef6c00; color: #fff; }
	.custom-badge-low { background: #2e7d32; color: #fff; }

	.custom-bar {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 0 6px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		font-size: 12px;
		line-height: 1;
	}
	.custom-bar-title {
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.custom-icon {
		color: #fff;
		font-weight: 700;
		flex-shrink: 0;
		background: rgba(0, 0, 0, 0.35);
		border-radius: 3px;
		padding: 0 3px;
		font-size: 10px;
		line-height: 16px;
	}
</style>
