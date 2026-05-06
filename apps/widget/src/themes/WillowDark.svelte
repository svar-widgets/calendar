<script lang="ts">
	import { WillowDark } from "@svar-ui/svelte-core";
	let { fonts = true, children } = $props();
</script>

{#if children}
	<WillowDark {fonts}>{@render children()}</WillowDark>
{:else}
	<WillowDark {fonts} />
{/if}

<style>
	:global(.wx-willow-dark-theme) {
		--wx-calendar-grid-color: #384047;
		--wx-calendar-weekend-background: #201d25;
	}
</style>
