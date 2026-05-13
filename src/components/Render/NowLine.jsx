import { useState, useEffect, useMemo } from "react";
import "./NowLine.css";

function NowLine({ yHeaders, dy }) {
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const id = window.setInterval(() => {
			setNow(new Date());
		}, 60_000);
		return () => window.clearInterval(id);
	}, []);

	const position = useMemo(() => {
		if (!yHeaders) return null;
		const inner = yHeaders[yHeaders.length - 1];
		if (!inner?.length) return null;
		const first = inner[0]?.ui?.date;
		const last = inner[inner.length - 1]?.ui?.date;
		if (!first || !last) return null;
		const rangeStart = first.getTime();
		const unitMs =
			(last.getTime() - first.getTime()) / (inner.length - 1 || 1);
		const rangeEnd = last.getTime() + unitMs;
		const nowMs = now.getTime();
		if (nowMs < rangeStart || nowMs > rangeEnd) return null;
		const pos = ((nowMs - rangeStart) / (rangeEnd - rangeStart)) * 100;
		return pos;
	}, [yHeaders, now]);

	if (position === null) return null;

	return (
		<div
			className="wx-now-line wx-aaeJfseq"
			style={{ top: `${dy * position}px` }}
			aria-hidden="true"
		>
			<div className="wx-now-dot wx-aaeJfseq"></div>
		</div>
	);
}

export default NowLine;
