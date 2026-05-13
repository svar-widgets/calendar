import { getData } from "../data";
import { Calendar } from "../../src/";
import EventTooltip from "../custom/EventTooltip";

export default function Tooltip() {
	const { data, date } = getData();

	return (
		<Calendar events={data} view="month" date={date} tooltip={EventTooltip} />
	);
}
