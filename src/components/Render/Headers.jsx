import "./Headers.css";

function Headers({ headers, direction }) {
	if (direction === "x") {
		return (
			<div className="wx-x-headers wx-aacjiXlA">
				{headers.map((level, levelIndex) => (
					<div className="wx-x-header-row wx-aacjiXlA" key={levelIndex}>
						{level.map((unit, unitIndex) => (
							<div
								className="wx-x-header-cell wx-aacjiXlA"
								role="columnheader"
								style={{ left: `${unit.position}%`, width: `${unit.size}%` }}
								key={unitIndex}
							>
								{unit.label}
							</div>
						))}
					</div>
				))}
			</div>
		);
	}

	return (
		<div className="wx-y-headers wx-aacjiXlA">
			{headers.map((level, levelIndex) => (
				<div className="wx-y-header-col wx-aacjiXlA" key={levelIndex}>
					{level.map((unit, unitIndex) => (
						<div
							className="wx-y-header-cell wx-aacjiXlA"
							role="rowheader"
							style={{ top: `${unit.position}%`, height: `${unit.size}%` }}
							key={unitIndex}
						>
							{unit.label}
						</div>
					))}
				</div>
			))}
		</div>
	);
}

export default Headers;
