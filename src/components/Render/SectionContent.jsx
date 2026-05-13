import BoxSection from "./BoxSection.jsx";
import BarSection from "./BarSection.jsx";
import GridSection from "./GridSection.jsx";
import ListSection from "./ListSection.jsx";
import YearSection from "./YearSection.jsx";
import Grid from "./Grid.jsx";
import NowLine from "./NowLine.jsx";
import "./SectionContent.css";

function SectionContent({
	section,
	dx,
	dy,
	scrollHeight,
	measured,
	cellCss,
	eventCss,
	eventContent,
	view,
	tooltip,
	onoverflow,
}) {
	function gridContent() {
		if (section.mode === "grid" && section.cells) {
			return (
				<GridSection
					primitives={section.primitives}
					cells={section.cells}
					dx={dx}
					dy={dy}
					cellCss={cellCss}
					eventCss={eventCss}
					eventContent={eventContent}
					view={view}
					section={section.name}
					onoverflow={onoverflow}
				/>
			);
		} else {
			return (
				<>
					<Grid
						xHeaders={section.xHeaders}
						yHeaders={section.yHeaders}
						dx={dx}
						dy={dy}
						cellCss={cellCss}
						view={view}
						section={section.name}
						mode={section.mode}
					/>
					{section.mode === "boxes" ? (
						<BoxSection
							primitives={section.primitives}
							dx={dx}
							dy={dy}
							layoutMode={section.ui?.boxLayout ?? "split"}
							eventCss={eventCss}
							eventContent={eventContent}
							view={view}
							section={section.name}
						/>
					) : (
						<BarSection
							primitives={section.primitives}
							dx={dx}
							dy={dy}
							eventCss={eventCss}
							eventContent={eventContent}
							view={view}
							section={section.name}
						/>
					)}
					{section.ui?.nowLine && (
						<NowLine yHeaders={section.yHeaders} dy={dy} />
					)}
				</>
			);
		}
	}

	if (section.mode === "list") {
		return <ListSection primitives={section.primitives} eventContent={eventContent} />;
	} else if (section.mode === "year") {
		return <YearSection section={section} tooltip={tooltip} eventContent={eventContent} />;
	} else if (measured) {
		if (scrollHeight !== null) {
			return (
				<div className="wx-scroll-inner wx-aacueXwu" style={{ height: `${scrollHeight}px` }}>
					{gridContent()}
				</div>
			);
		} else {
			return gridContent();
		}
	}

	return null;
}

export default SectionContent;
