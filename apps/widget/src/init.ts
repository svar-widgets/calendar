import { mount } from "svelte";
import Demo from "./Demo.svelte";

mount(Demo, {
	target: document.querySelector("#wx_demo_area") || document.body,
});
