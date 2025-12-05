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
  SummaryCardsSkeleton,
  TherapistsSection,
  TherapistsSectionSkeleton,
} from './components';

// ======================================================
// DASHBOARD CONTAINER (CORE DATA LOADER)
// ======================================================
export default function DashboardContainer() {
  // ---------------------------
  // STATE
  // ---------------------------

  const [loading, setLoading] = useState(true);

  const [sites, setSites] = useState<Site[]>([]);
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hps, setHps] = useState<Hp[]>([]);

  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [appointmentsFilter, setAppointmentsFilter] = useState<TimeFilterType>('all');
  const [patientsFilter, setPatientsFilter] = useState<TimeFilterType>('all');
  const [therapistsFilter, setTherapistsFilter] = useState<TimeFilterType>('all');

  // ======================================================
  // INITIAL LOAD (UPDATED FOR CONCURRENCY)
  // ======================================================
  useEffect(() => {
    async function loadAll() {
      try {
        setLoading(true);

        // ⭐ IMPROVEMENT: Use Promise.all() to run all API calls concurrently.
        // This ensures the total load time is governed by the single slowest
        // aggregated call, drastically reducing the 90+ second wait.
        const [sitesData, calendarsData, hpsData, patientsData, eventsData] = await Promise.all([
          getAllSites(),
          getAllCalendars(),
          getAllHps(),
          getAllPatients(),
          // Load events WITHOUT date filter initially, as full data is needed for analytics
          getAllEvents(),
        ]);

        setSites(sitesData);
        setCalendars(calendarsData);
        setHps(hpsData);
        setPatients(patientsData);
        setEvents(eventsData);

        setLoading(false);
      } catch (error) {
        console.error('Dashboard Load Error:', error);
        setLoading(false);
      }
    }

    loadAll();
  }, []);

  // ======================================================
  // FILTERED VALUES (FOR EACH SECTION)
  // (No change needed here as the filtering logic is sound)
  // ======================================================

  // ---------- APPOINTMENTS ----------
  const appointmentFilteredEvents = (() => {
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
    if (patientsFilter === 'all') return patients;

    const { from, to } = getDateRange(patientsFilter);

    // NOTE:
    // Patients API does not provide createdAt
    // So we simply use ALL patients for now
    return patients;
  })();

  const patientInsights = getPatientInsights(patientFiltered);

  // ---------- THERAPISTS ----------
  const therapistFilteredEvents = (() => {
    let filtered = events;

    const { from, to } = getDateRange(therapistsFilter);
    if (from && to) {
      filtered = filtered.filter((ev) => ev.startAt >= from && ev.startAt <= to);
    }

    return filterEventsByBranch(filtered, calendars, selectedBranch);
  })();

  const therapistPerformance = getTherapistPerformance(therapistFilteredEvents, hps, calendars);

  // ======================================================
  // LOADING STATE HANDLING
  // ======================================================
  if (loading) {
    return (
      <Container className="py-4">
        <BranchFilter branches={sites} loading />
        <SummaryCardsSkeleton />
        <AppointmentsSectionSkeleton />
        <PatientsSectionSkeleton />
        <TherapistsSectionSkeleton />
      </Container>
    );
  }

  // ======================================================
  // RENDER UI
  // ======================================================
  return (
    <Container className="py-4">
     <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        {/* PAGE HEADER */}
        <div>
          <h2 className="fw-bold">Dashboard</h2>
        </div>
        {/* BRANCH FILTER */}
        <BranchFilter branches={sites} value={selectedBranch} onChange={setSelectedBranch} />
      </div>
      {/* SUMMARY CARDS */}
      <SummaryCards
        totalAppointments={appointmentFilteredEvents.length}
        totalPatients={patients.length}
        totalTherapists={hps.length}
      />

      {/* APPOINTMENTS SECTION */}
      <AppointmentsSection
        data={appointmentBreakdown}
        timeFilter={appointmentsFilter}
        onTimeFilterChange={setAppointmentsFilter}
      />

      {/* PATIENTS SECTION */}
      <PatientsSection
        data={patientInsights}
        timeFilter={patientsFilter}
        onTimeFilterChange={setPatientsFilter}
      />

      {/* THERAPISTS SECTION */}
      <TherapistsSection
        data={therapistPerformance}
        timeFilter={therapistsFilter}
        onTimeFilterChange={setTherapistsFilter}
      />
    </Container>
  );
}
