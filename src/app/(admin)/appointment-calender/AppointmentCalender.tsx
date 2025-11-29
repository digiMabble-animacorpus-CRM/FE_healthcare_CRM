'use client';

import React, { useEffect, useMemo, useState } from 'react';
import MiniCalendar from './components/miniCalender';
import CalendarFilters from './components/calenderFilters';
import MainCalendar from './components/mainCalender';
import CalendarHeader from './components/calenderHeader';
import EventDetailsModal from './components/eventDetailModel';

import { getAllEvents } from './events/api';
import { getAllSites } from './sites/api';
import { getAllHps } from './hps/api';
import { getAllPatients } from './patients/api';
import { getAllCalendars } from './calendars/api';

import type { CalendarEvent as CalendarEventType } from './events/types';
import type { Site } from './sites/types';
import type { HealthProfessional } from './hps/types';
import type { Patient } from './patients/types';
import type { Calendar as CalendarType } from './calendars/types';
import { Button } from 'react-bootstrap';
import EventFormModal from '../create-appointment/components/eventFormModel';

const CalendarDashboard: React.FC = () => {
  // ... your existing state declarations
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [hps, setHps] = useState<HealthProfessional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Filters...
  const [selectedSiteIds, setSelectedSiteIds] = useState<string[]>([]);
  const [selectedHpIds, setSelectedHpIds] = useState<string[]>([]);
  const [selectedPatientIds, setSelectedPatientIds] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState<string[]>([]);

  const [visibleCalendarIds, setVisibleCalendarIds] = useState<Set<string>>(new Set());
  const [displayLabel, setDisplayLabel] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventType | null>(null);
  const [showCreateEvent, setShowCreateEvent] = useState<boolean>(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [eventMode, setEventMode] = useState<'create' | 'edit'>('create');
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  // Load data
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

        // ✅ Select all filters by default
        setSelectedSiteIds(sitesRes.data.map((s: Site) => s.id));
        setSelectedHpIds(hpsRes.data.map((hp: HealthProfessional) => hp.id));
        setSelectedPatientIds(patientsRes.data.map((p: Patient) => p.id));
        setSelectedStatus(['ACTIVE', 'CONFIRMED', 'CANCELED', 'ARCHIVED', 'DELETED']);
        setSelectedType(['APPOINTMENT', 'LEAVE', 'PERSONAL', 'EXTERNAL_EVENT']);

        // Initialize visible calendars
        const calendarIds = calendarsRes.data.map((c: CalendarType) => c.id);
        setVisibleCalendarIds(new Set(calendarIds));

        // ✅ FIXED: Events for current view range
        const start = new Date(selectedDate);
        const end = new Date(selectedDate);

        // Calculate range based on view
        if (view === 'week') {
          const day = start.getDay();
          start.setDate(start.getDate() - day);
          start.setHours(0, 0, 0, 0);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);
        } else if (view === 'month') {
          start.setDate(1);
          start.setHours(0, 0, 0, 0);
          end.setMonth(start.getMonth() + 1);
          end.setDate(0);
          end.setHours(23, 59, 59, 999);
        } else {
          start.setHours(0, 0, 0, 0);
          end.setHours(23, 59, 59, 999);
        }

        const eventsRes = await getAllEvents(1, 1000, start.toISOString(), end.toISOString());
        setEvents(eventsRes.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const cal = calendars.find((c) => c.id === ev.calendarId);
      if (!cal) return false;

      if (!visibleCalendarIds.has(ev.calendarId)) return false;

      // Filter by site
      if (selectedSiteIds.length && !selectedSiteIds.includes(cal.siteId)) return false;

      // Filter by HP
      if (selectedHpIds.length && !selectedHpIds.includes(cal.hpId)) return false;

      // Filter by patient
      if (selectedPatientIds.length) {
        const match = selectedPatientIds.some(
          (id) =>
            ev.patientExId === id ||
            patients.find((p) => p.id === id)?.externalId === ev.patientExId,
        );
        if (!match) return false;
      }

      // Filter by status
      if (selectedStatus.length && !selectedStatus.includes(ev.status)) return false;

      // Filter by type
      if (selectedType.length && !selectedType.includes(ev.type)) return false;

      return true;
    });
  }, [
    events,
    visibleCalendarIds,
    selectedSiteIds,
    selectedHpIds,
    selectedPatientIds,
    selectedStatus,
    selectedType,
    calendars,
    patients,
  ]);

  // Calendar visibility
  const toggleCalendarVisibility = (calendarId: string) => {
    setVisibleCalendarIds((prev) => {
      const next = new Set(prev);
      if (next.has(calendarId)) next.delete(calendarId);
      else next.add(calendarId);
      return next;
    });
  };

  // Navigation
  const onToday = () => setSelectedDate(new Date());
  const onPrev = () => {
    const d = new Date(selectedDate);
    if (view === 'month') d.setMonth(d.getMonth() - 1);
    else if (view === 'week') d.setDate(d.getDate() - 7);
    else d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };
  const onNext = () => {
    const d = new Date(selectedDate);
    if (view === 'month') d.setMonth(d.getMonth() + 1);
    else if (view === 'week') d.setDate(d.getDate() + 7);
    else d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  // Header label
  const handleRangeChange = (r: { start: Date; end: Date }) => {
    const start = r.start;
    const end = r.end;
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    if (view === 'month') {
      setDisplayLabel(start.toLocaleString(undefined, { month: 'long', year: 'numeric' }));
    } else {
      setDisplayLabel(
        `${start.toLocaleString(undefined, options)} — ${end.toLocaleString(undefined, options)}`,
      );
    }
  };

  // Event click
  const handleEventClick = (ev: CalendarEventType) => {
    setSelectedEvent(ev);
    // Optionally open edit modal instead of details:
    // setShowCreateEvent(true); pass mode="edit" and eventId=ev.id
  };

  // Reload events after create/edit
  const handleSavedEvent = async (result?: any) => {
    // ✅ FIXED: Reload for current view range
    const start = new Date(selectedDate);
    const end = new Date(selectedDate);

    if (view === 'week') {
      const day = start.getDay();
      start.setDate(start.getDate() - day);
      start.setHours(0, 0, 0, 0);
      end.setDate(start.getDate() + 6);
      end.setHours(23, 59, 59, 999);
    } else if (view === 'month') {
      start.setDate(1);
      start.setHours(0, 0, 0, 0);
      end.setMonth(start.getMonth() + 1);
      end.setDate(0);
      end.setHours(23, 59, 59, 999);
    } else {
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
    }

    setShowCreateEvent(false);
    setLoading(true);
    try {
      const eventsRes = await getAllEvents(1, 1000, start.toISOString(), end.toISOString());
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column flex-lg-row gap-3 p-1 w-100">
      {/* LEFT COLUMN — Sidebar */}
      <div className="d-flex flex-column gap-3" style={{ width: '100%', maxWidth: 340 }}>
        {/* Create Event Button */}
        <Button
          variant="primary"
          className="w-100"
          onClick={() => {
            setEventMode('create');
            setEditingEventId(null);
            setShowEventModal(true);
          }}
        >
          + Create Event
        </Button>

        {/* Mini Calendar */}
        <MiniCalendar selectedDate={selectedDate} onChange={setSelectedDate} />

        {/* Filters */}
        <CalendarFilters
          sites={sites}
          hps={hps}
          patients={patients}
          calendars={calendars}
          selectedSiteIds={selectedSiteIds}
          selectedHpIds={selectedHpIds}
          selectedPatientIds={selectedPatientIds}
          selectedStatus={selectedStatus}
          selectedType={selectedType}
          onSiteChange={setSelectedSiteIds}
          onHpChange={setSelectedHpIds}
          onPatientChange={setSelectedPatientIds}
          onStatusChange={setSelectedStatus}
          onTypeChange={setSelectedType}
          visibleCalendarIds={visibleCalendarIds}
          onToggleCalendarVisibility={toggleCalendarVisibility}
        />
      </div>

      {/* RIGHT COLUMN — Calendar */}
      <div className="d-flex flex-column flex-grow-1">
        <CalendarHeader
          selectedDate={selectedDate}
          view={view}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
          onViewChange={(v) => setView(v)}
        />

        {loading ? (
          <div className="p-4">Loading data…</div>
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

      {/* EVENT DETAILS MODAL */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          calendars={calendars}
          hps={hps}
          patients={patients}
          sites={sites}
          onClose={() => setSelectedEvent(null)}
          onEdit={(id) => {
            setSelectedEvent(null);
            setEventMode('edit');
            setEditingEventId(id);
            setShowEventModal(true);
          }}
        />
      )}

      {/* CREATE/EDIT EVENT MODAL */}
      <EventFormModal
        show={showEventModal}
        mode={eventMode}
        eventId={editingEventId || undefined}
        onClose={() => {
          setShowEventModal(false);
          setEditingEventId(null);
        }}
        onSaved={() => {
          setShowEventModal(false);
          setEditingEventId(null);
          handleSavedEvent();
        }}
      />
    </div>
  );
};

export default CalendarDashboard;
