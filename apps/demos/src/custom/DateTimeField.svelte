<script lang="ts">
	import { DatePicker, TimePicker } from "@svar-ui/svelte-core";

	let {
		value,
		id,
		onchange,
	}: {
		value?: Date;
		id?: string | number;
		onchange?: (ev: { value: Date | null }) => void;
	} = $props();
</script>

<div class="wx-date-time-field">
	<div class="date">
		<DatePicker {id} {value} {onchange} buttons={false} />
	</div>
	<TimePicker {id} {value} {onchange} />
</div>

<style>
	.wx-date-time-field {
		display: flex;
		gap: 8px;
	}
	.wx-date-time-field .date {
		flex: 1 1 auto;
	}
	.wx-date-time-field :global(.timepicker) {
		width: unset !important;
	}
</style>
