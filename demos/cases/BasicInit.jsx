import { useState, useMemo } from "react";
import { Calendar, Editor } from "../../src/";
import { getData } from "../data.js";

export default function BasicInit() {
	const { data, date } = useMemo(() => getData(), []);
	const [api, setApi] = useState(null);

	return (
		<>
			<Calendar init={setApi} events={data} date={date} />
			{api && <Editor api={api} />}
		</>
	);
}
