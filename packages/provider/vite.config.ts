import type { ParsedStack, TestError } from "vite-plus/test";
import { defineConfig } from "vite-plus";

export default defineConfig({
	pack: {
		dts: {
			tsgo: true,
		},
		exports: true,
	},
	lint: {
		options: {
			typeAware: true,
			typeCheck: true,
		},
	},
	fmt: {},
	test: {
		onStackTrace(error: TestError, { file }: ParsedStack): boolean | void {
			// Reject all frames from third party libraries.
			if (file.includes("node_modules")) {
				return false;
			}
		},
	},
});
