"use client";

import React from "react";
import Calendar, { CalendarProps } from "react-calendar";
import "react-calendar/dist/Calendar.css";

interface MiniCalendarProps {
  selectedDate: Date;
  onChange: (date: Date) => void;
}

const MiniCalendar: React.FC<MiniCalendarProps> = ({ selectedDate, onChange }) => {
  const handleChange: CalendarProps["onChange"] = (value) => {
    // value can be Date | Date[] | null
    if (value instanceof Date) {
      onChange(value);
    } else if (Array.isArray(value) && value[0] instanceof Date) {
      onChange(value[0]);
    }
    // if null — ignore
  };

  return (
    <div
      style={{
        padding: 12,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
      }}
    >
      <Calendar
        onChange={handleChange}
        value={selectedDate}
        view="month"
        showNeighboringMonth={false}
      />
    </div>
  );
};

export default MiniCalendar;
