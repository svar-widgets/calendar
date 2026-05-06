<script lang="ts">
	import { Willow } from "@svar-ui/svelte-core";
	let { fonts = true, children } = $props();
</script>

{#if children}
	<Willow {fonts}>{@render children()}</Willow>
{:else}
	<Willow {fonts} />
{/if}

<style>
	:global(.wx-willow-theme) {
		--wx-calendar-grid-color: #e6e6e6;
		--wx-calendar-weekend-background: #fbf9ff;
	}
</style>
