<script lang="ts">
	import { getData } from "../data.js";
	import { Calendar, Editor } from "@svar-ui/svelte-calendar";
	import { Layout } from "@svar-ui/svelte-layout";
	import { Segmented, Locale } from "@svar-ui/svelte-core";

	import {
		en as enCore,
		cn as cnCore,
		de as deCore,
		es as esCore,
		fr as frCore,
		it as itCore,
		ja as jaCore,
		pt as ptCore,
		ru as ruCore,
	} from "@svar-ui/core-locales";
	import {
		en,
		cn,
		de,
		es,
		fr,
		it,
		jp,
		pt,
		ru,
	} from "@svar-ui/calendar-locales";

	let api = $state();
	const { data, date } = getData();

	const dictionaries: Record<string, { calendar: any; core: any }> = {
		en: { calendar: en, core: enCore },
		cn: { calendar: cn, core: cnCore },
		de: { calendar: de, core: deCore },
		es: { calendar: es, core: esCore },
		fr: { calendar: fr, core: frCore },
		it: { calendar: it, core: itCore },
		jp: { calendar: jp, core: jaCore },
		pt: { calendar: pt, core: ptCore },
		ru: { calendar: ru, core: ruCore },
	};

	let locale = $state("en");
	let words = $derived({
		...dictionaries[locale].calendar,
		...dictionaries[locale].core,
	});

	const options = [
		{ id: "en", label: "English" },
		{ id: "cn", label: "Chinese" },
		{ id: "de", label: "German" },
		{ id: "es", label: "Spanish" },
		{ id: "fr", label: "French" },
		{ id: "it", label: "Italian" },
		{ id: "jp", label: "Japanese" },
		{ id: "pt", label: "Portuguese" },
		{ id: "ru", label: "Russian" },
	];
</script>

<Layout direction="column">
	<Segmented {options} value={locale} onchange={v => locale = v.value as string} />
	{#key locale}
		<Locale {words} >
			<Calendar init={(v) => api = v} events={data} view="week" {date} />
			{#if api}<Editor {api} />{/if}
		</Locale>
	{/key}
</Layout>
