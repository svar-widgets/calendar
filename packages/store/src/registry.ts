import type { ViewModel } from "./models/model";

type ViewModelConstructor = new () => ViewModel;

const registry = new Map<string, ViewModelConstructor>();

export type ViewConfig =
	| string
	| {
			id: string;
			label?: string;
			sections?: Record<string, any>;
	  };

export function registerCalendarView(
	id: string,
	viewClass: ViewModelConstructor
): void {
	registry.set(id, viewClass);
}

export function getRegisteredViews(): Map<string, ViewModelConstructor> {
	return registry;
}
