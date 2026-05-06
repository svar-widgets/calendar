import { mount } from "svelte";
import Demos from "./common/Index.svelte";

import { Willow, WillowDark } from "@svar-ui/svelte-calendar";
import { WillowIcon, WillowDarkIcon } from "./common/icons/index";

mount(Demos, {
	target: document.querySelector("#wx_demo_area") || document.body,
	props: {
		publicName: "Calendar",
		productTag: "calendar",
		productLink: "calendar",
		skins: [
			{
				id: "willow",
				label: "Willow",
				component: Willow,
				icon: WillowIcon,
			},
			{
				id: "willow-dark",
				label: "Dark",
				component: WillowDark,
				icon: WillowDarkIcon,
			},
		],
	},
});
