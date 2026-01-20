'use client';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';

import {
  getAllSites,
  getAllCalendars,
  getAllEvents,
  getAllPatients,
  getAllHps,
} from './dashboard.api';

import {
  getDateRange,
  filterEventsByBranch,
  getAppointmentBreakdown,
  getPatientInsights,
  getTherapistPerformance,
} from './dashboard.helpers';

import { Site, Event, Patient, Hp, Calendar, TimeFilterType } from './dashboard.types';
import {
  AppointmentsSection,
  AppointmentsSectionSkeleton,
  BranchFilter,
  PatientsSection,
  PatientsSectionSkeleton,
  SummaryCards,
  TherapistsSection,
  TherapistsSectionSkeleton,
} from './components';

// ======================================================
// DASHBOARD CONTAINER (Optimized Parallel Loading)
// ======================================================
export default function DashboardContainer() {
  // ---------------------------
  // STATE
  // ---------------------------
  const [sites, setSites] = useState<Site[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hps, setHps] = useState<Hp[]>([]);

  // Loading states
  const [sitesLoaded, setSitesLoaded] = useState(false);
  const [calendarsLoaded, setCalendarsLoaded] = useState(false);
  const [eventsLoaded, setEventsLoaded] = useState(false);
  const [patientsLoaded, setPatientsLoaded] = useState(false);
  const [hpsLoaded, setHpsLoaded] = useState(false);

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [appointmentsFilter, setAppointmentsFilter] = useState<TimeFilterType>('all');
  const [patientsFilter, setPatientsFilter] = useState<TimeFilterType>('all');
  const [therapistsFilter, setTherapistsFilter] = useState<TimeFilterType>('all');

  // ======================================================
  // LOAD ALL DATA IN PARALLEL
  // ======================================================
  useEffect(() => {
    async function loadAllData() {
      try {
        // Load all independent APIs in parallel
        const [sitesData, calendarsData, patientsData, hpsData] = await Promise.allSettled([
          getAllSites(),
          getAllCalendars(),
          getAllPatients(),
          getAllHps(),
        ]);

        // Handle sites
        if (sitesData.status === 'fulfilled') {
          setSites(sitesData.value);
        }
        setSitesLoaded(true);

        // Handle calendars
        if (calendarsData.status === 'fulfilled') {
          setCalendars(calendarsData.value);
        }
        setCalendarsLoaded(true);

        // Handle patients
        if (patientsData.status === 'fulfilled') {
          setPatients(patientsData.value);
        }
        setPatientsLoaded(true);

        // Handle HPs
        if (hpsData.status === 'fulfilled') {
          setHps(hpsData.value);
        }
        setHpsLoaded(true);
      } catch (error) {
        console.error('Dashboard initial load error:', error);
        // Set all as loaded even if failed
        setSitesLoaded(true);
        setCalendarsLoaded(true);
        setPatientsLoaded(true);
        setHpsLoaded(true);
      }
    }

    loadAllData();
  }, []);

  // ======================================================
  // LOAD EVENTS AFTER CALENDARS ARE LOADED
  // ======================================================
  useEffect(() => {
    async function loadEvents() {
      if (!calendarsLoaded) return; // Wait for calendars

      try {
        const eventsData = await getAllEvents();
        setEvents(eventsData);
      } catch (error) {
        console.error('Events Load Error:', error);
      } finally {
        setEventsLoaded(true);
      }
    }

    if (calendarsLoaded && !eventsLoaded) {
      loadEvents();
    }
  }, [calendarsLoaded, eventsLoaded]);

  // ======================================================
  // CALCULATED VALUES WITH LOADING CHECKS
  // ======================================================

  // ---------- APPOINTMENTS ----------
  const appointmentFilteredEvents = (() => {
    if (!eventsLoaded || !calendarsLoaded) return [];

    let filtered = events;

    const { from, to } = getDateRange(appointmentsFilter);
    if (from && to) {
      filtered = filtered.filter((ev) => ev.startAt >= from && ev.startAt <= to);
    }

    return filterEventsByBranch(filtered, calendars, selectedBranch);
  })();

  const appointmentBreakdown = getAppointmentBreakdown(appointmentFilteredEvents);

  // ---------- PATIENTS ----------
  const patientFiltered = (() => {
    if (!patientsLoaded) return [];

    if (patientsFilter === 'all') return patients;

    const { from, to } = getDateRange(patientsFilter);
    // Patients API does not provide createdAt
    return patients;
  })();

  const patientInsights = getPatientInsights(patientFiltered);

  // ---------- THERAPISTS ----------
  const therapistFilteredEvents = (() => {
    if (!eventsLoaded || !calendarsLoaded) return [];

    let filtered = events;

    const { from, to } = getDateRange(therapistsFilter);
    if (from && to) {
      filtered = filtered.filter((ev) => ev.startAt >= from && ev.startAt <= to);
    }

    return filterEventsByBranch(filtered, calendars, selectedBranch);
  })();

  const therapistPerformance = (() => {
    if (!eventsLoaded || !calendarsLoaded || !hpsLoaded) {
      return { totalInDemand: 0, totalCancellations: 0, totalProfit: 0 };
    }
    return getTherapistPerformance(therapistFilteredEvents, hps, calendars);
  })();

  // ======================================================
  // RENDER UI
  // ======================================================
  return (
    <Container className="py-4">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        {/* PAGE HEADER */}
        <div>
          <h2 className="fw-bold">Tableau de bord</h2>
        </div>
        {/* BRANCH FILTER */}
        {!sitesLoaded || !eventsLoaded ? (
          <BranchFilter branches={[]} loading />
        ) : (
          <BranchFilter branches={sites} value={selectedBranch} onChange={setSelectedBranch} />
        )}
      </div>
      {/* SUMMARY CARDS */}
      <div className="mb-4">
        <SummaryCards
          totalAppointments={eventsLoaded ? appointmentFilteredEvents.length : undefined}
          totalPatients={patientsLoaded ? patients.length : undefined}
          totalTherapists={hpsLoaded ? hps.length : undefined}
          loadingAppointments={!eventsLoaded || !calendarsLoaded}
          loadingPatients={!patientsLoaded}
          loadingTherapists={!hpsLoaded}
        />
      </div>
      {/* APPOINTMENTS SECTION */}
      {!eventsLoaded || !calendarsLoaded ? (
        <AppointmentsSectionSkeleton />
      ) : (
        <div className="mb-4">
          <AppointmentsSection
            data={appointmentBreakdown}
            timeFilter={appointmentsFilter}
            onTimeFilterChange={setAppointmentsFilter}
          />
        </div>
      )}
      {/* PATIENTS SECTION */}
      {!patientsLoaded ? (
        <PatientsSectionSkeleton />
      ) : (
        <div className="mb-4">
          <PatientsSection
            data={patientInsights}
            timeFilter={patientsFilter}
            onTimeFilterChange={setPatientsFilter}
          />
        </div>
      )}
      {/* THERAPISTS SECTION */}
      {!eventsLoaded || !calendarsLoaded || !hpsLoaded ? (
        <TherapistsSectionSkeleton />
      ) : (
        <div className="mb-4">
          <TherapistsSection
            data={therapistPerformance}
            timeFilter={therapistsFilter}
            onTimeFilterChange={setTherapistsFilter}
          />
        </div>
      )}
    </Container>
  );
}
