import GridLines from "./GridLines.jsx";
import GridCells from "./GridCells.jsx";

function hasWeekend(headers) {
	if (!headers) return false;
	const last = headers[headers.length - 1];
	for (const u of last) if (u.weekend) return true;
	return false;
}

function Grid({ xHeaders, yHeaders, dx, dy, cellCss, view, section, mode }) {
	if (cellCss || hasWeekend(xHeaders)) {
		return (
			<GridCells
				xHeaders={xHeaders}
				yHeaders={yHeaders}
				dx={dx}
				dy={dy}
				cellCss={cellCss}
				view={view}
				section={section}
				mode={mode}
			/>
		);
	}

	return (
		<GridLines
			xHeaders={xHeaders}
			yHeaders={yHeaders}
			dx={dx}
			dy={dy}
		/>
	);
}

export default Grid;
