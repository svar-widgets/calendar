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

export function getToolbarItems(config?: { history?: boolean }): ToolbarItem[] {
	const items: ToolbarItem[] = [
		{ id: "nav", comp: "dateNav" },
		{ id: "today", comp: "todayButton" },
		{ comp: "spacer" },
		{ id: "title", comp: "dateLabel" },
		{ comp: "spacer" },
		{ id: "modes", comp: "richselect-navigation" },
		{ id: "add-event", comp: "addEventButton", pinned: true },
	];


	return items;
}
