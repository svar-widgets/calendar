import { getData, relDate } from "../data.js";
import { Calendar } from "../../src/";
import EventContent from "../custom/EventContent.jsx";

const { data, date } = getData();
const events = [
	{
		id: 101,
		text: "Team offsite",
		start: relDate(0),
		end: relDate(3),
		priority: "high",
	},
	{
		id: 102,
		text: "Design review",
		start: relDate(1, 10, 0),
		end: relDate(1, 11, 30),
		priority: "medium",
	},
	{
		id: 103,
		text: "Standup",
		start: relDate(2, 9, 0),
		end: relDate(2, 9, 30),
		priority: "low",
	},
	{
		id: 104,
		text: "Sprint planning",
		start: relDate(2, 14, 0),
		end: relDate(2, 15, 30),
		priority: "high",
	},
	{
		id: 105,
		text: "Lunch break",
		start: relDate(1, 12, 0),
		end: relDate(1, 13, 0),
	},
];

export default function EventContentDemo() {
	return (
		<Calendar
			events={[...data, ...events]}
			views={["day", "week", "month"]}
			view="week"
			date={date}
			eventContent={EventContent}
		/>
	);
}
