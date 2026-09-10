import { svelte } from "@sveltejs/vite-plugin-svelte";
import { defineConfig, loadEnv } from "vite-plus";
import { stripBlocks } from "../../.vite-plugins/strip-blocks.js";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), "");
	const getVars = () => ({
		__TRIAL__: JSON.stringify(env.VITE_SVAR_PACKAGE === "trial"),
	});

	let build;
	if (mode === "export") {
		build = {
			lib: {
				entry: "src/pro_export.ts",
				formats: ["es"],
				fileName: "calendar",
			},
		};
	}

	return {
		build,
		define: getVars(),
		plugins: [
			stripBlocks({ strip: env.VITE_SVAR_PACKAGE === "mit" }),
			svelte(),
		],
		resolve: {
			dedupe: ["svelte"],
		},
		server: {
			port: 3104,
			host: "0.0.0.0",
		},
	};
});
