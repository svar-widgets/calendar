import { useMemo } from "react";
import "./GridCells.css";

function getDate(unit) {
	return unit?.ui?.date instanceof Date ? unit.ui.date : null;
}

function combineDates(dateUnit, timeUnit) {
	const d = new Date(dateUnit);
	d.setHours(timeUnit.getHours(), timeUnit.getMinutes(), timeUnit.getSeconds(), 0);
	return d;
}

function resolveDate(x, y) {
	const xd = getDate(x);
	const yd = getDate(y);
	if (xd && yd) return combineDates(xd, yd);
	return xd ?? yd;
}

function GridCells({ xHeaders, yHeaders, dx, dy, cellCss, view, section, mode }) {
	const cells = useMemo(() => {
		const xUnits = xHeaders ? xHeaders[xHeaders.length - 1] : null;
		const yUnits = yHeaders ? yHeaders[yHeaders.length - 1] : null;
		const result = [];

		const computeCss = cellCss
			? (x, y) =>
					cellCss({
						view,
						section,
						mode,
						x,
						y,
						date: resolveDate(x, y),
					})
			: () => "";

		if (xUnits && yUnits) {
			for (const xUnit of xUnits) {
				for (const yUnit of yUnits) {
					result.push({
						x: xUnit.position,
						y: yUnit.position,
						width: xUnit.size,
						height: yUnit.size,
						css: computeCss(xUnit, yUnit),
						weekend: !!(xUnit.weekend || yUnit.weekend),
					});
				}
			}
		} else if (xUnits) {
			for (const xUnit of xUnits) {
				result.push({
					x: xUnit.position,
					y: 0,
					width: xUnit.size,
					height: 100,
					css: computeCss(xUnit, null),
					weekend: !!xUnit.weekend,
				});
			}
		} else if (yUnits) {
			for (const yUnit of yUnits) {
				result.push({
					x: 0,
					y: yUnit.position,
					width: 100,
					height: yUnit.size,
					css: computeCss(null, yUnit),
					weekend: !!yUnit.weekend,
				});
			}
		}
		return result;
	}, [xHeaders, yHeaders, cellCss, view, section, mode]);

	function cellStyle(c) {
		return {
			left: `${dx * c.x}px`,
			top: `${dy * c.y}px`,
			width: `${dx * c.width}px`,
			height: `${dy * c.height}px`,
		};
	}

	return (
		<div className="wx-grid wx-aabePxNp" aria-hidden="true">
			{cells.map((c, i) => (
				<div
					key={i}
					className={`wx-grid-cell ${c.css}${c.weekend ? " wx-weekend" : ""} wx-aabePxNp`}
					style={cellStyle(c)}
				></div>
			))}
		</div>
	);
}

export default GridCells;
