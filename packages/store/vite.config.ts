import type { ParsedStack, TestError } from "vite-plus/test";
import { defineConfig, loadEnv } from "vite-plus";
import { stripBlocks } from "../../.vite-plugins/strip-blocks.js";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const getVars = () => ({
		__TRIAL__: JSON.stringify(env.VITE_SVAR_PACKAGE === "trial"),
	});

	return {
		define: getVars(),
		pack: {
			dts: {
				tsgo: true,
			},
			exports: true,
			define: getVars(),
			plugins: [stripBlocks({ strip: env.VITE_SVAR_PACKAGE === "mit" })],
		},
		lint: {
			options: {
				typeAware: true,
				typeCheck: true,
			},
			globals: {
				__TRIAL__: "readonly",
				window: "readonly",
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
	};
});
