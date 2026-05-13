import { useState, useMemo, useEffect } from 'react';
import { setID } from '@svar-ui/lib-dom';
import './GridSection.css';

const scope = 'wx-aaa8Xrhj';

const laneHeight = 22;
const gap = 2;
const fullLaneHeight = laneHeight + gap * 2;
const dayLabelHeight = 20;
const moreLabelHeight = 18;

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes();
  if (m === 0) return `${h % 12 || 12}${h < 12 ? 'am' : 'pm'}`;
  return `${h % 12 || 12}:${String(m).padStart(2, '0')}${h < 12 ? 'am' : 'pm'}`;
}

function eventLabel(p) {
  return p.event.text || ' ';
}

function eventTime(p) {
  if (p.isMultiDay === false) {
    return `${formatTime(p.event.start)} `;
  }
  return '';
}

function dateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function GridSection({
  primitives,
  cells,
  dx,
  dy,
  cellCss,
  eventCss,
  eventContent,
  view,
  section,
  onoverflow,
}) {
  const [expandedRows, setExpandedRows] = useState(() => new Set());

  const rowLayout = useMemo(() => {
    const rowInfo = new Map();
    for (const p of primitives) {
      const existing = rowInfo.get(p.y);
      const lanes = p.totalLanes ?? 1;
      if (!existing || lanes > existing.totalLanes) {
        rowInfo.set(p.y, { totalLanes: lanes, height: p.height });
      }
    }

    const layout = new Map();

    for (const [y, info] of rowInfo) {
      const groupHeight = dy * info.height - dayLabelHeight;
      const allFit =
        Math.floor(groupHeight / fullLaneHeight) >= info.totalLanes;
      const maxVisible = allFit
        ? info.totalLanes
        : Math.max(
            0,
            Math.floor((groupHeight - moreLabelHeight) / fullLaneHeight),
          );
      const isExpanded = expandedRows.has(y);

      let extraHeight = 0;
      if (isExpanded && info.totalLanes > maxVisible) {
        const neededHeight = dayLabelHeight + info.totalLanes * fullLaneHeight;
        const normalHeight = dy * info.height;
        extraHeight = Math.max(0, neededHeight - normalHeight);
      }

      layout.set(y, {
        maxVisible,
        expanded: isExpanded,
        extraHeight,
      });
    }

    return layout;
  }, [primitives, dy, expandedRows]);

  const rowExtraOffsets = useMemo(() => {
    const offsets = new Map();
    const sorted = [...rowLayout.entries()].sort((a, b) => a[0] - b[0]);
    let cumulative = 0;
    for (const [y, info] of sorted) {
      offsets.set(y, cumulative);
      cumulative += info.extraHeight;
    }
    return { offsets, totalExtra: cumulative };
  }, [rowLayout]);

  function getRowOffset(y) {
    return rowExtraOffsets.offsets.get(y) ?? 0;
  }

  const totalExtra = rowExtraOffsets.totalExtra;
  const totalHeight = totalExtra > 0 ? dy * 100 + totalExtra : null;
  const hasOverflow = totalExtra > 0;

  useEffect(() => {
    onoverflow?.(hasOverflow);
  }, [hasOverflow, onoverflow]);

  const { visiblePrimitives, hiddenByRow } = useMemo(() => {
    const visible = [];
    const hidden = new Map();
    for (const p of primitives) {
      const info = rowLayout.get(p.y);
      if (!info || info.expanded || (p.lane ?? 0) < info.maxVisible) {
        visible.push(p);
      } else {
        let arr = hidden.get(p.y);
        if (!arr) {
          arr = [];
          hidden.set(p.y, arr);
        }
        arr.push(p);
      }
    }
    return { visiblePrimitives: visible, hiddenByRow: hidden };
  }, [primitives, rowLayout]);

  const moreIndicators = useMemo(() => {
    const indicators = [];

    for (const cell of cells) {
      const hidden = hiddenByRow.get(cell.y);
      if (!hidden) continue;
      let count = 0;
      for (const p of hidden) {
        if (p.x < cell.x + cell.width && p.x + p.width > cell.x) {
          count++;
        }
      }
      if (count > 0) {
        indicators.push({
          rowY: cell.y,
          cellX: cell.x,
          cellWidth: cell.width,
          count,
        });
      }
    }

    return indicators;
  }, [cells, hiddenByRow]);

  function barStyle(p) {
    const left = dx * p.x + gap;
    const width = dx * p.width - gap * 2;
    const lane = p.lane ?? 0;
    const groupTop = dy * p.y + dayLabelHeight + getRowOffset(p.y);
    const top = groupTop + lane * fullLaneHeight + gap;
    const height = laneHeight;

    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }

  function css(p) {
    const base = p.event.css || '';
    const dynamic = eventCss
      ? eventCss({ event: p.event, view, section, mode: 'grid' })
      : '';
    return base + (dynamic ? ' ' + dynamic : '');
  }

  function cellStyleObj(cell) {
    const offset = getRowOffset(cell.y);
    const info = rowLayout.get(cell.y);
    const extra = info?.extraHeight ?? 0;
    const left = dx * cell.x;
    const top = dy * cell.y + offset;
    const width = dx * cell.width;
    const height = dy * cell.height + extra;
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  }

  function moreStyleObj(indicator) {
    const offset = getRowOffset(indicator.rowY);
    const info = rowLayout.get(indicator.rowY);
    const top =
      dy * indicator.rowY +
      dayLabelHeight +
      offset +
      info.maxVisible * fullLaneHeight;
    const left = dx * indicator.cellX;
    const width = dx * indicator.cellWidth;
    return {
      left: `${left}px`,
      top: `${top}px`,
      width: `${width}px`,
      height: `${moreLabelHeight}px`,
    };
  }

  function toggleRow(y) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(y)) {
        next.delete(y);
      } else {
        next.add(y);
      }
      return next;
    });
  }

  const EventContentCmp = eventContent;

  return (
    <div
      className={`wx-grid-section ${scope}`}
      style={totalHeight !== null ? { height: `${totalHeight}px` } : undefined}
    >
      {cells.map((cell, i) => {
        const extraClass = cellCss
          ? cellCss({
              view,
              section,
              mode: 'grid',
              x: null,
              y: null,
              date: cell.date,
            })
          : '';
        const cn = [
          'wx-grid-cell',
          scope,
          extraClass,
          cell.weekend ? 'wx-weekend' : '',
          !cell.inMonth ? 'wx-out-of-month' : '',
          cell.today ? 'wx-today' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={i}
            className={cn}
            aria-current={cell.today ? 'date' : undefined}
            style={cellStyleObj(cell)}
          >
            <span
              className={`wx-day-number ${scope}`}
              data-date={dateStr(cell.date)}
            >
              {cell.day}
            </span>
          </div>
        );
      })}

      {visiblePrimitives.map((p) => {
        const cn = [
          'wx-bar-event',
          scope,
          css(p),
          p.isMultiDay === false ? 'wx-bar-single-day' : '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <div
            key={p.id}
            className={cn}
            style={barStyle(p)}
            data-id={setID(p.id)}
          >
            {EventContentCmp ? (
              <EventContentCmp event={p.event} mode="grid" />
            ) : (
              <>
                <span className={`wx-bar-marker ${scope}`}></span>
                <span className={`wx-bar-time ${scope}`}>{eventTime(p)}</span>
                <span className={`wx-bar-title ${scope}`}>{eventLabel(p)}</span>
              </>
            )}
          </div>
        );
      })}

      {moreIndicators.map((indicator, i) => (
        <button
          key={i}
          className={`wx-more-button ${scope}`}
          style={moreStyleObj(indicator)}
          onClick={() => toggleRow(indicator.rowY)}
        >
          +{indicator.count} more
        </button>
      ))}
    </div>
  );
}

export default GridSection;
