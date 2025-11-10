"use client";

import React from "react";

interface CalendarHeaderProps {
  displayLabel: string;
  view: "day" | "week" | "month";
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewChange: (v: "day" | "week" | "month") => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({
  displayLabel,
  view,
  onPrev,
  onNext,
  onToday,
  onViewChange,
}) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onToday} style={{ padding: "8px 10px", borderRadius: 6 }}>Today</button>
        <button onClick={onPrev} style={{ padding: "8px 10px", borderRadius: 6 }}>◀</button>
        <button onClick={onNext} style={{ padding: "8px 10px", borderRadius: 6 }}>▶</button>
      </div>

      <div style={{ flex: 1, textAlign: "center", fontWeight: 700 }}>
        {displayLabel}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <select value={view} onChange={(e) => onViewChange(e.target.value as any)} style={{ padding: 8, borderRadius: 6 }}>
          <option value="day">Day</option>
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
      </div>
    </div>
  );
};

export default CalendarHeader;
