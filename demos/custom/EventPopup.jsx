import { createContext, useContext } from "react";
import "./EventPopup.css";

export const ResourcesContext = createContext(null);

function formatDateTime(d) {
	return (
		d.toLocaleDateString([], {
			weekday: "short",
			month: "short",
			day: "numeric",
		}) +
		" " +
		d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
	);
}

export default function EventPopup({ event, close }) {
	const resources = useContext(ResourcesContext);

	function handleAction(action) {
		alert(`Action: ${action} for "${event.text}"`);
		close();
	}

	return (
		<div className="event-card wx-aace0zHy">
			<div className="card-header wx-aace0zHy">
				<div className="card-title wx-aace0zHy">
					{event.text || ""}
				</div>
			</div>
			<div className="card-body wx-aace0zHy">
				<div className="card-row wx-aace0zHy">
					<span className="card-label wx-aace0zHy">Start</span>
					<span className="card-value wx-aace0zHy">
						{formatDateTime(event.start)}
					</span>
				</div>
				<div className="card-row wx-aace0zHy">
					<span className="card-label wx-aace0zHy">End</span>
					<span className="card-value wx-aace0zHy">
						{formatDateTime(event.end)}
					</span>
				</div>
				{resources && event.unit_id && (
					<div className="card-row wx-aace0zHy">
						<span className="card-label wx-aace0zHy">Assignee</span>
						<span className="card-value wx-aace0zHy">
							{resources.find((r) => r.id === event.unit_id)
								?.label || event.unit_id}
						</span>
					</div>
				)}
			</div>
			<div className="card-actions wx-aace0zHy">
				<button
					className="btn btn-primary wx-aace0zHy"
					onClick={() => handleAction("view")}
				>
					View Details
				</button>
				<button
					className="btn btn-secondary wx-aace0zHy"
					onClick={() => handleAction("share")}
				>
					Share
				</button>
			</div>
		</div>
	);
}
