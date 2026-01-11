'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
import { Button, Spinner } from 'react-bootstrap';
import EventFormModal from '../create-appointment/components/eventFormModel';

const calculateRange = (date: Date, view: 'day' | 'week' | 'month') => {
  const start = new Date(date);
  const end = new Date(date);

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

  return { start, end };
};

const CalendarDashboard: React.FC = () => {
  const [events, setEvents] = useState<CalendarEventType[]>([]);
  const [calendars, setCalendars] = useState<CalendarType[]>([]);
  const [sites, setSites] = useState<Site[]>([]);
  const [hps, setHps] = useState<HealthProfessional[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);

  const [isLoadingStaticData, setIsLoadingStaticData] = useState(false);
  const [isEventsRefreshing, setIsEventsRefreshing] = useState(false);
  const [view, setView] = useState<'day' | 'week' | 'month'>('week');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

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

  const fetchEventsForCurrentView = useCallback(async () => {
    setIsEventsRefreshing(true);
    try {
      const { start, end } = calculateRange(selectedDate, view);
      const eventsRes = await getAllEvents(1, 2000, start.toISOString(), end.toISOString());
      setEvents(eventsRes.data || []);
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setIsEventsRefreshing(false);
    }
  }, [selectedDate, view]);

  useEffect(() => {
    const loadStaticData = async () => {
      setIsLoadingStaticData(true);
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

        setSelectedSiteIds(sitesRes.data.map((s: Site) => s.id));
        setSelectedHpIds(hpsRes.data.map((hp: HealthProfessional) => hp.id));
        setSelectedPatientIds(patientsRes.data.map((p: Patient) => p.id));
        setSelectedStatus(['ACTIVE', 'CONFIRMED', 'CANCELED', 'ARCHIVED', 'DELETED']);
        setSelectedType(['APPOINTMENT', 'LEAVE', 'PERSONAL', 'EXTERNAL_EVENT']);

        const calendarIds = calendarsRes.data.map((c: CalendarType) => c.id);
        setVisibleCalendarIds(new Set(calendarIds));
      } catch (err) {
        console.error('Failed to load static data:', err);
      } finally {
        setIsLoadingStaticData(false);
      }
    };
    loadStaticData();
  }, []);

  useEffect(() => {
    if (calendars.length > 0) {
      fetchEventsForCurrentView();
    }
  }, [selectedDate, view, calendars.length, fetchEventsForCurrentView]);

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      const cal = calendars.find((c) => c.id === ev.calendarId);
      if (!cal) return false;
      if (!visibleCalendarIds.has(ev.calendarId)) return false;
      if (selectedSiteIds.length && !selectedSiteIds.includes(cal.siteId)) return false;
      if (selectedHpIds.length && !selectedHpIds.includes(cal.hpId)) return false;

      if (selectedPatientIds.length) {
        const match = selectedPatientIds.some(
          (id) =>
            ev.patientExId === id ||
            patients.find((p) => p.id === id)?.externalId === ev.patientExId,
        );
        if (!match) return false;
      }

      if (selectedStatus.length && !selectedStatus.includes(ev.status)) return false;
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

  const toggleCalendarVisibility = (calendarId: string) => {
    setVisibleCalendarIds((prev) => {
      const next = new Set(prev);
      if (next.has(calendarId)) next.delete(calendarId);
      else next.add(calendarId);
      return next;
    });
  };

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

  const handleEventClick = (ev: CalendarEventType) => {
    setSelectedEvent(ev);
  };

  const handleSavedEvent = async () => {
    setShowEventModal(false);
    setEditingEventId(null);
    await fetchEventsForCurrentView();
  };

  return (
    <div className="d-flex flex-column flex-lg-row gap-3 p-1 w-100">
      <div className="d-flex flex-column gap-3" style={{ width: '100%', maxWidth: 340 }}>
        <Button
          variant="primary"
          className="w-100"
          onClick={() => {
            setEventMode('create');
            setEditingEventId(null);
            setShowEventModal(true);
          }}
        >
          + Créer un événement
        </Button>

        <MiniCalendar selectedDate={selectedDate} onChange={setSelectedDate} />

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

      <div className="d-flex flex-column flex-grow-1">
        <CalendarHeader
          selectedDate={selectedDate}
          view={view}
          onPrev={onPrev}
          onNext={onNext}
          onToday={onToday}
          onViewChange={(v) => setView(v)}
        />

        {isLoadingStaticData && calendars.length === 0 ? (
          <div className="d-flex flex-column justify-content-center align-items-center p-5 text-muted h-100">
            <Spinner animation="border" variant="primary" role="status" style={{ width: '3rem', height: '3rem' }} />
            <div className="mt-3">Chargement des données initiales…</div>
          </div>
        ) : (
          <div className="position-relative flex-grow-1">
            {isEventsRefreshing && (
              <div
                className="position-absolute w-100 h-100 d-flex justify-content-center align-items-center"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', zIndex: 10, top: 0, left: 0 }}
              >
                <Spinner animation="grow" variant="secondary" role="status" className="me-2" size="sm" />
                Actualisation des événements…
              </div>
            )}

            <MainCalendar
              events={filteredEvents}
              calendars={calendars}
              view={view}
              selectedDate={selectedDate}
              visibleCalendarIds={visibleCalendarIds}
              onRangeChange={(range) => handleRangeChange(range as any)}
              onEventClick={handleEventClick}
            />
          </div>
        )}
      </div>

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

      <EventFormModal
        show={showEventModal}
        mode={eventMode}
        eventId={editingEventId || undefined}
        onClose={() => {
          setShowEventModal(false);
          setEditingEventId(null);
        }}
        onSaved={handleSavedEvent}
      />
    </div>
  );
};

export default CalendarDashboard;
