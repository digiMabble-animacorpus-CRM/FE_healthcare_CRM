"use client";

import React, { useEffect, useRef } from "react";
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import type { CalendarEvent as CalendarEventType } from "../events/types";
import type { Calendar as CalendarType } from "../calendars/types";

interface MainCalendarProps {
  events: CalendarEventType[];
  calendars: CalendarType[];
  view: "day" | "week" | "month";
  selectedDate: Date;
  visibleCalendarIds: Set<string>;
  onRangeChange?: (range: { start: Date; end: Date; label?: string }) => void;
  onEventClick?: (ev: CalendarEventType) => void;
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
  const calendarRef = useRef<any | null>(null);

  // Convert backend event -> toast event
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
        backgroundColor: cal?.color || "#8cb1d1",
        borderColor: cal?.color || "#8cb1d1",
      };
    });

  // When events change, update calendar instance
  useEffect(() => {
    if (!calendarRef.current) return;
    const inst = calendarRef.current.getInstance();
    try {
      // Clear existing, then create new events
      inst.clear();
      // createEvents expects array
      if (formattedEvents.length > 0) inst.createEvents(formattedEvents);
    } catch (err) {
      // It may throw if API shape slightly different — keep safe
      console.error("ToastCalendar: error creating events", err);
    }
  }, [formattedEvents]);

  // When selectedDate or view changes, set the calendar date/view and call onRangeChange
  useEffect(() => {
    if (!calendarRef.current) return;
    const inst = calendarRef.current.getInstance();

    try {
      // set view
      inst.changeView(view);

      // set date
      inst.setDate(selectedDate);

      // compute current range and fire onRangeChange
      const range = inst.getDateRange(); // returns {start: Date, end: Date}
      if (onRangeChange) {
        onRangeChange({ start: range[0], end: range[1] });
      }
    } catch (err) {
      // some methods differ across versions — try fallback
      try {
        inst.changeView(view);
        inst.setDate(selectedDate);
      } catch (e) {
        // ignore
      }
    }
  }, [selectedDate, view]);

  // event click handler
  const handleClickEvent = (ev: any) => {
    // ev has id and calendarId etc
    const id = ev?.id;
    const found = events.find((e) => e.id === id);
    if (found && onEventClick) onEventClick(found);
  };

  return (
    <div style={{ height: "78vh", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
      <Calendar
        ref={calendarRef}
        height="100%"
        view={view}
        taskView={false}
        scheduleView={["time"]}
        useCreationPopup={false}
        useDetailPopup={true}
        calendars={calendars.map((c) => ({ id: c.id, name: c.label, backgroundColor: c.color }))}
        onClickEvent={(ev: any) => handleClickEvent(ev)}
      />
    </div>
  );
};

export default MainCalendar;
