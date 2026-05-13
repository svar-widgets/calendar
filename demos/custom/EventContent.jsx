import { useMemo } from "react";
import "./EventContent.css";

function formatTime(d) {
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function EventContent({ event, mode }) {
	const icon = useMemo(
		() =>
			event.priority === "high"
				? "!!"
				: event.priority === "medium"
					? "!"
					: "",
		[event.priority]
	);

	if (mode === "boxes") {
		return (
			<div className="custom-box wx-aabjVKtz">
				<div className="custom-box-header wx-aabjVKtz">
					{icon && (
						<span className="custom-icon wx-aabjVKtz">{icon}</span>
					)}
					<span className="custom-title wx-aabjVKtz">
						{event.text || ""}
					</span>
				</div>
				<div className="custom-time wx-aabjVKtz">
					{formatTime(event.start)} - {formatTime(event.end)}
				</div>
				{event.priority && (
					<div
						className={`custom-badge custom-badge-${event.priority} wx-aabjVKtz`}
					>
						{event.priority}
					</div>
				)}
			</div>
		);
	}

	return (
		<span className="custom-bar wx-aabjVKtz">
			{icon && <span className="custom-icon wx-aabjVKtz">{icon}</span>}
			<span className="custom-bar-title wx-aabjVKtz">
				{event.text || event.title || "Event"}
			</span>
		</span>
	);
}
