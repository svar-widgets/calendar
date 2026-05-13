import "./EventTooltip.css";

function formatTime(d) {
	return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function EventTooltip({ event, events }) {
	return (
		<div className="event-tooltip wx-aacokm6F">
			{event ? (
				<>
					<div className="tooltip-title wx-aacokm6F">
						{event.text || ""}
					</div>
					<div className="tooltip-time wx-aacokm6F">
						{formatTime(event.start)} – {formatTime(event.end)}
					</div>
					{event.text && event.text !== "Event" && (
						<div className="tooltip-id wx-aacokm6F">
							ID: {event.id}
						</div>
					)}
				</>
			) : events ? (
				<>
					<div className="tooltip-header wx-aacokm6F">
						{events.length} event{events.length !== 1 ? "s" : ""}
					</div>
					{events.map((ev, i) => (
						<div className="tooltip-row wx-aacokm6F" key={i}>
							<span className="tooltip-dot wx-aacokm6F"></span>
							<span className="tooltip-row-time wx-aacokm6F">
								{formatTime(ev.start)}
							</span>
							<span className="tooltip-row-title wx-aacokm6F">
								{ev.title}
							</span>
						</div>
					))}
				</>
			) : null}
		</div>
	);
}
