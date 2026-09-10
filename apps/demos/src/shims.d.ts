// Makes this file a module so the `@svar-ui/svelte-filter` augmentation below
// merges with the real types instead of replacing them.
import "@svar-ui/svelte-filter";

// `createFilter` is re-exported from @svar-ui/svelte-filter at runtime (via
// `export * from "@svar-ui/filter-store"`), but it is absent from the published
// types because @svar-ui/filter-store ships a `types` entry that points at a
// non-existent file. Declare it here until the dependency is fixed.
declare module "@svar-ui/svelte-filter" {
	export function createFilter(
		cfg: unknown,
		opts?: unknown,
		fields?: unknown
	): (item: Record<string, unknown>) => boolean;
}
