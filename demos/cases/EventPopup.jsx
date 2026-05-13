import { getData } from "../data";
import { Calendar } from "../../src/";
import EventPopup from "../custom/EventPopup";

export default function EventPopupDemo() {
	const { data, date } = getData();

	return (
		<Calendar
			events={data}
			view="week"
			date={date}
			eventPopup={EventPopup}
			views={["day", "week", "month"]}
		/>
	);
}
