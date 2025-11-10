"use client";

import React, { useEffect, useMemo, useState } from "react";
import MiniCalendar from "./components/miniCalender";
import CalendarFilters from "./components/calenderFilters";
import MainCalendar from "./components/mainCalender";
import CalendarHeader from "./components/calenderHeader";

import { getAllEvents } from "./events/api";
import { getAllSites } from "./sites/api";
import { getAllHps } from "./hps/api";
import { getAllPatients } from "./patients/api";
import { getAllCalendars } from "./calendars/api";

import type { CalendarEvent as CalendarEventType } from "./events/types";
import type { Site } from "./sites/types";
import type { HealthProfessional } from "./hps/types";
import type { Patient } from "./patients/types";
import type { Calendar as CalendarType } from "./calendars/types";

/**
 * CalendarDashboard
 * - loads all data (events, calendars, sites, hps, patients)
 * - exposes filters (site/hp/patient)
 * - shows mini calendar + header + main calendar
 *
 * Notes:
 * - Keep fetch sizes reasonable; adjust page/limit to your needs
 * - Toast UI Calendar will be populated from 'events' and 'calendars' props
 */

const CalendarDashboard: React.FC = () => {
  // data
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [hps, setHps] = useState<HealthProfessional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // ui
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"day" | "week" | "month">("week");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const [selectedSite, setSelectedSite] = useState<string>("");
  const [selectedHp, setSelectedHp] = useState<string>("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");

  // calendar visibility (which calendars are shown)
  const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<string>>(new Set());

  // label shown in header (range or month)
  const [displayLabel, setDisplayLabel] = useState<string>("");

  // load initial data
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [sitesRes, hpsRes, patientsRes, calendarsRes] = await Promise.all([
          getAllSites(1, 200),
          getAllHps(1, 200),
          getAllPatients(1, 200),
          getAllCalendars(1, 200),
        ]);
        setSites(sitesRes.data);
        setHps(hpsRes.data);
        setPatients(patientsRes.data);
        setCalendars(calendarsRes.data);

        // initialize visible calendars to all calendars by default
        setVisibleCalendarIds(new Set((calendarsRes.data || []).map((c) => c.id)));

        // fetch events for a range around selectedDate (for initial load use month range)
        // set from/to as ISO strings
        const start = new Date(selectedDate);
        start.setDate(1);
        const end = new Date(start);
        end.setMonth(start.getMonth() + 1);
        const eventsRes = await getAllEvents(1, 500, start.toISOString(), end.toISOString());
        setEvents(eventsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAll();
  }, []);

  // recalc filtered events based on filters + calendars
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      // calendar must be visible
      if (!visibleCalendarIds.has(ev.calendarId)) return false;

      // site filter (find calendar)
      if (selectedSite) {
        const cal = calendars.find((c) => c.id === ev.calendarId);
        if (!cal || cal.siteId !== selectedSite) return false;
      }

      // hp filter
      if (selectedHp) {
        const cal = calendars.find((c) => c.id === ev.calendarId);
        if (!cal || cal.hpId !== selectedHp) return false;
      }

      // patient filter (patientExId is external ID in events; we compare to patient.id or externalId)
      if (selectedPatient) {
        if (ev.patientExId !== selectedPatient && ev.patientExId !== patients.find((p) => p.id === selectedPatient)?.externalId) {
          return false;
        }
      }

      return true;
    });
  }, [events, visibleCalendarIds, selectedSite, selectedHp, selectedPatient, calendars, patients]);

  // toggle visibility per calendar
  const toggleCalendarVisibility = (calendarId: string) => {
    setVisibleCalendarIds((prev) => {
      const next = new Set(prev);
      if (next.has(calendarId)) next.delete(calendarId);
      else next.add(calendarId);
      return next;
    });
  };

  // header navigation handlers
  const onToday = () => setSelectedDate(new Date());
  const onPrev = () => {
    const d = new Date(selectedDate);
    if (view === "month") d.setMonth(d.getMonth() - 1);
    else if (view === "week") d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };
  const onNext = () => {
    const d = new Date(selectedDate);
    if (view === "month") d.setMonth(d.getMonth() + 1);
    else if (view === "week") d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  // when the main calendar supplies a visible range, format label for header
  const handleRangeChange = (r: { start: Date; end: Date }) => {
    const start = r.start;
    const end = r.end;
    const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
    if (view === "month") {
      setDisplayLabel(start.toLocaleString(undefined, { month: "long", year: "numeric" }));
    } else {
      setDisplayLabel(`${start.toLocaleString(undefined, options)} — ${end.toLocaleString(undefined, options)}`);
    }
  };

  // event click
  const handleEventClick = (ev: CalendarEventType) => {
    // For now, just alert with basic info. Replace with modal as needed.
    const cal = calendars.find((c) => c.id === ev.calendarId);
    const hp = hps.find((h) => h.id === cal?.hpId);
    const patient = patients.find((p) => p.externalId === ev.patientExId || p.id === ev.patientExId);
    alert(`${ev.title}\n${new Date(ev.startAt).toLocaleString()} → ${new Date(ev.endAt).toLocaleString()}\nTherapist: ${hp ? `${hp.firstName} ${hp.lastName}` : "Unknown"}\nPatient: ${patient ? `${patient.firstName} ${patient.lastName}` : "—"}`);
  };

  return (
    <div style={{ display: "flex", gap: 12, padding: 12 }}>
      {/* Left column: mini calendar + filters */}
      <div style={{ width: 340, display: "flex", flexDirection: "column", gap: 12 }}>
        <MiniCalendar selectedDate={selectedDate} onChange={(d) => setSelectedDate(d)} />
        <CalendarFilters
          sites={sites}
          hps={hps}
          patients={patients}
          calendars={calendars}
          selectedSiteId={selectedSite}
          selectedHpId={selectedHp}
          selectedPatientId={selectedPatient}
          onSiteChange={(id) => setSelectedSite(id)}
          onHpChange={(id) => setSelectedHp(id)}
          onPatientChange={(id) => setSelectedPatient(id)}
          visibleCalendarIds={visibleCalendarIds}
          onToggleCalendarVisibility={toggleCalendarVisibility}
        />
      </div>

      {/* Right column: header + calendar */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <CalendarHeader
          displayLabel={displayLabel}
          view={view}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
          onViewChange={(v) => setView(v)}
        />

        {loading ? (
          <div style={{ padding: 24 }}>Loading data…</div>
        ) : (
          <MainCalendar
            events={filteredEvents}
            calendars={calendars}
            view={view}
            selectedDate={selectedDate}
            visibleCalendarIds={visibleCalendarIds}
            onRangeChange={(range) => handleRangeChange(range as any)}
            onEventClick={handleEventClick}
          />
        )}
      </div>
    </div>
  );
};

export default CalendarDashboard;
