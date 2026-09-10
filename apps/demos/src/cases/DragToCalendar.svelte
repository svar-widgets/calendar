<script lang="ts">
	import { getData } from "../data.js";
	import {
		Calendar,
		Editor,
		type CalendarEvent,
		type CalendarInstanceApi,
	} from "@svar-ui/svelte-calendar";

	const { data, date } = getData();

	// tasks available to drag into the calendar (no dates - resolved on drop)
	const tasks = [
		{ id: "t1", text: "Design review", duration: 60*60000 },
		{ id: "t2", text: "Quick sync", duration: 30*60000 },
		{ id: "t3", text: "Workshop", duration: 18*60000 },
		{ id: "t4", text: "Conference day", duration: 1440*60000 },
	];

	let api = $state<CalendarInstanceApi>();
	let eventProjection = $state<Partial<CalendarEvent> | null>(null);

	function onTaskDragStart(_ev: DragEvent, task: any) {
		console.log("onTaskDragStart", task);
		eventProjection = { htmlEvent:null, event: { ...task, id: null }};
	}

	function onTaskDragEnd() {
		eventProjection = null;
	}

	function onTaskDrag(ev: DragEvent){
		eventProjection = { ...eventProjection, htmlEvent: ev };
		ev.preventDefault();
	}

	function onTaskDrop(ev: DragEvent) {
		if (!api || !eventProjection?.event.start || !eventProjection.event.end) return;
		ev.preventDefault();
		void api.exec("add-event", { event: { ...eventProjection.event, duration: null } });
		eventProjection = null;
	}

	function formatDuration(minutes: number) {
		if (minutes >= 1440) return `${minutes / 1440} day`;
		if (minutes >= 60) return `${minutes / 60} h`;
		return `${minutes} min`;
	}
</script>

<div class="demo">
	<div class="tasks">
		<h4>Tasks</h4>
		<p class="hint">
			Drag a task onto the calendar — it previews as an event box and is
			created on drop.
		</p>
		{#each tasks as task (task.id)}
			<div
				class="task"
				draggable="true"
				ondragstart={ev => onTaskDragStart(ev, task)}
				ondragend={onTaskDragEnd}
				role="listitem"
			>
				<div class="task-title">{task.text}</div>
				<div class="task-duration">{formatDuration(task.duration/60000)}</div>
			</div>
		{/each}
	</div>

	<div
		class="calendar-box"
		role="group"
		aria-label="Calendar drop area"
		ondragover={onTaskDrag}
		ondrop={onTaskDrop}
	>
		<Calendar
			bind:this={api}
			events={data}
			{date}
			view="day"
			views={["day", "month"]}
			{eventProjection}
		/>
		{#if api}
			<Editor {api}/>
		{/if}
	</div>
</div>

<style>
	.demo {
		display: flex;
		gap: 20px;
		padding: 20px;
		height: 100%;
		box-sizing: border-box;
	}
	.tasks {
		width: 220px;
		flex: 0 0 auto;
		display: flex;
		flex-direction: column;
		gap: 10px;
		overflow: auto;
	}
	.tasks h4 {
		margin: 0;
	}
	.hint {
		margin: 0 0 4px;
		font-size: 13px;
		color: var(--wx-color-font-alt);
	}
	.task {
		border: var(--wx-border);
		border-radius: 6px;
		padding: 10px 12px;
		background: var(--wx-background);
		color: var(--wx-color-font);
		cursor: grab;
		box-shadow: var(--wx-shadow-light);
		user-select: none;
	}
	.task:active {
		cursor: grabbing;
	}
	.task-title {
		font-weight: 600;
	}
	.task-duration {
		font-size: 12px;
		color: var(--wx-color-font-alt);
		margin-top: 2px;
	}
	.calendar-box {
		flex: 1 1 auto;
		min-width: 0;
	}
</style>
