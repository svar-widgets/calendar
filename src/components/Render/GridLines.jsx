import "./GridLines.css";

const scope = "wx-aaeh5mqL";

export default function GridLines({ xHeaders, yHeaders, dx, dy }) {
	return (
		<div className={`wx-grid ${scope}`} aria-hidden="true">
			{xHeaders &&
				xHeaders[xHeaders.length - 1].slice(0, -1).map((unit, i) => (
					<div
						key={i}
						className={`wx-grid-line wx-vertical ${scope}`}
						style={{ left: `${dx * (unit.position + unit.size)}px` }}
					></div>
				))}
			{yHeaders &&
				yHeaders[yHeaders.length - 1].slice(0, -1).map((unit, i) => (
					<div
						key={i}
						className={`wx-grid-line wx-horizontal ${scope}`}
						style={{ top: `${dy * (unit.position + unit.size)}px` }}
					></div>
				))}
		</div>
	);
}
