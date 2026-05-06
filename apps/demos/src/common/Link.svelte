<script>
	import { link } from "svelte-spa-router";
	import active from "svelte-spa-router/active";
	let { data, skin } = $props();

	const fullPath = $derived(data[0].replace(":skin", skin));
</script>

<a
	use:link={fullPath}
	use:active
	href="/"
	class="demo"
>
	{data[1]}
	{#if data[3] && data[3].pro}
		<span class="pro">PRO</span>
	{/if}
</a>

<style>
	.demo {
		display: flex;
		align-items: center;
		height: 37px;
		font-weight: 400;
		padding: 0 16px 0 12px;
		border-left: 4px solid transparent;
		color: #595b66;
		list-style: none;
		cursor: pointer;
		text-decoration: none;
	}

	:global(.demo.active) {
		border-left-color: var(--demo-framework-color);
	}

	:global(.demo.active),
	.demo:hover {
		font-weight: 500;
		color: #42454d;
		background-color: #f1f1f1;
	}
	.pro {
		color: var(--demo-framework-color);
		border: 1px solid var(--demo-framework-color);
		border-radius: 4px;
		padding: 0px 8px;
		font-size: 12px;
		font-weight: 600;
		margin-left: auto;
	}
</style>
