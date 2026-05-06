export function getMenuOptions() {
	return [
		{ id: "edit-event", text: "Edit event", icon: "wxi-edit" },
		{ id: "delete-event", text: "Delete event", icon: "wxi-delete" },
	];
}

export type ToolbarItem = {
	id?: string;
	comp: string;
	value?: any;
	options?: { id: string; label: string }[];
	[key: string]: any;
};

export function getToolbarItems(): ToolbarItem[] {
	return [
		{ id: "nav", comp: "dateNav" },
		{ id: "today", comp: "todayButton" },
		{ comp: "spacer" },
		{ id: "title", comp: "dateLabel" },
		{ comp: "spacer" },
		{ id: "modes", comp: "richselect" },
		{ id: "add-event", comp: "addEventButton" },
	];
}
