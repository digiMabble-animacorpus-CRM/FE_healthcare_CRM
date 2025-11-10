"use client";

import React, { useEffect, useRef } from "react";
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import type { CalendarEvent } from "../events/types";
import type { Calendar as CalendarType } from "../calendars/types";


interface MainCalendarProps {
  events: CalendarEvent[];
  calendars: CalendarType[];
  view: "day" | "week" | "month";
  selectedDate: Date;
  visibleCalendarIds: Set<string>;
  onRangeChange?: (range: { start: Date; end: Date }) => void;
  onEventClick?: (ev: CalendarEvent) => void;
}

const MainCalendar: React.FC<MainCalendarProps> = ({
  events,
  calendars,
  view,
  selectedDate,
  visibleCalendarIds,
  onRangeChange,
  onEventClick,
}) => {
  const calendarRef = useRef<any>(null);

  const formattedEvents = events
    .filter((ev) => visibleCalendarIds.has(ev.calendarId))
    .map((ev) => {
      const cal = calendars.find((c) => c.id === ev.calendarId);
      return {
        id: ev.id,
        calendarId: ev.calendarId,
        title: ev.title || "Untitled",
        category: "time",
        start: ev.startAt,
        end: ev.endAt,
        isReadOnly: true,
        backgroundColor: cal?.color || "#4a90e2",
      };
    });

  useEffect(() => {
    if (!calendarRef.current) return;
    const inst = calendarRef.current.getInstance?.();
    inst?.clear();
    inst?.createEvents(formattedEvents);
  }, [formattedEvents]);

  useEffect(() => {
    if (!calendarRef.current) return;
    const inst = calendarRef.current.getInstance?.();
    inst?.changeView(view);
    inst?.setDate(selectedDate);

    const range = inst?.getDateRange?.();
    if (range && onRangeChange) {
      onRangeChange({ start: range[0], end: range[1] });
    }
  }, [selectedDate, view]);

  const handleClickEvent = (e: any) => {
    const id = e.event?.id;
    const found = events.find((ev) => ev.id === id);
    if (found && onEventClick) onEventClick(found);
  };

  return (
    <div style={{ height: "80vh", background: "#fff", borderRadius: 8 }}>
      <Calendar
        ref={calendarRef}
        view={view}
        height="100%"
        useDetailPopup={true}
        taskView={false}
        scheduleView={["time"]}
        calendars={calendars.map((c) => ({
          id: c.id,
          name: c.label,
          backgroundColor: c.color,
        }))}
        onClickEvent={handleClickEvent}
      />
    </div>
  );
};

export default MainCalendar;
