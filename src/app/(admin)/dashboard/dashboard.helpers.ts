'use client';

import {
  Event,
  Patient,
  Hp,
  Calendar,
  AppointmentBreakdown,
  PatientInsights,
  TherapistPerformance,
  TimeFilterType,
} from './dashboard.types';

// =============================================
// 1️⃣ DATE RANGE HELPERS (Today, Week, Month, All)
// =============================================
export function getDateRange(filter: TimeFilterType) {
  const now = new Date();

  if (filter === 'today') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (filter === 'week') {
    const start = new Date(now);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1);
    start.setDate(diff);
    start.setHours(0, 0, 0, 0);

    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    return { from: start.toISOString(), to: end.toISOString() };
  }

  if (filter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    return { from: start.toISOString(), to: end.toISOString() };
  }

  // ALL — no filter
  return { from: undefined, to: undefined };
}

// =============================================
// 2️⃣ BRANCH → CALENDAR MAPPING
// =============================================
export function getCalendarsForBranch(calendars: Calendar[], branchId: string): Calendar[] {
  if (branchId === 'all') return calendars;
  return calendars.filter((c) => c.siteId === branchId);
}

export function getHpIdsForCalendars(calendars: Calendar[]): string[] {
  return calendars.map((c) => c.hpId);
}

// =============================================
// 3️⃣ FILTER EVENTS BY CALENDAR / BRANCH
// =============================================
export function filterEventsByBranch(
  events: Event[],
  calendars: Calendar[],
  branchId: string,
): Event[] {
  if (branchId === 'all') return events;

  const allowedCalendarIds = calendars.filter((c) => c.siteId === branchId).map((c) => c.id);

  return events.filter((ev) => allowedCalendarIds.includes(ev.calendarId));
}

// =============================================
// 4️⃣ APPOINTMENT BREAKDOWN (Status, Type, Time of Day)
// =============================================
export function getStatusBreakdown(events: Event[]): Record<string, number> {
  const map: Record<string, number> = {};

  events.forEach((ev) => {
    map[ev.status] = (map[ev.status] || 0) + 1;
  });

  return map;
}

export function getTypeBreakdown(events: Event[]): Record<string, number> {
  const map: Record<string, number> = {};

  events.forEach((ev) => {
    map[ev.type] = (map[ev.type] || 0) + 1;
  });

  return map;
}

export function getTimeOfDayBreakdown(events: Event[]): AppointmentBreakdown['timeOfDayCounts'] {
  const buckets = {
    morning: 0, // 5 AM – 11:59 AM
    afternoon: 0, // 12 PM – 4:59 PM
    evening: 0, // 5 PM – 8:59 PM
    night: 0, // 9 PM – 4:59 AM
  };

  events.forEach((event) => {
    const hour = new Date(event.startAt).getHours();

    if (hour >= 5 && hour < 12) buckets.morning++;
    else if (hour >= 12 && hour < 17) buckets.afternoon++;
    else if (hour >= 17 && hour < 21) buckets.evening++;
    else buckets.night++;
  });

  return buckets;
}

// Combined breakdown
export function getAppointmentBreakdown(events: Event[]): AppointmentBreakdown {
  return {
    statusCounts: getStatusBreakdown(events),
    typeCounts: getTypeBreakdown(events),
    timeOfDayCounts: getTimeOfDayBreakdown(events),
  };
}

// =============================================
// 5️⃣ PATIENT INSIGHTS (Gender, Age, Status)
// =============================================
export function calculateAge(birthdate: Patient['birthdate']): number | null {
  if (!birthdate || !birthdate.year) return null;

  const today = new Date();
  const year = birthdate.year;
  const month = birthdate.month > 0 ? birthdate.month - 1 : 0; // if unknown, assume January
  const day = birthdate.day > 0 ? birthdate.day : 1; // if unknown, assume 1st

  const birth = new Date(year, month, day);
  const age = today.getFullYear() - birth.getFullYear();

  return age;
}

export function getPatientInsights(patients: Patient[]): PatientInsights {
  const genderCounts = { male: 0, female: 0 };
  const ageBuckets: Record<string, number> = {
    '0-18': 0,
    '18-30': 0,
    '30-45': 0,
    '45-60': 0,
    '60+': 0,
  };
  const statusCounts = { active: 0, inactive: 0 };

  patients.forEach((p) => {
    // Gender
    if (p.legalGender === 'M') genderCounts.male++;
    else genderCounts.female++;

    // Status
    if (p.status === 'ACTIVE') statusCounts.active++;
    else statusCounts.inactive++;

    // Age
    const age = calculateAge(p.birthdate);
    if (age === null) return;
    if (age <= 18) ageBuckets['0-18']++;
    else if (age <= 30) ageBuckets['18-30']++;
    else if (age <= 45) ageBuckets['30-45']++;
    else if (age <= 60) ageBuckets['45-60']++;
    else ageBuckets['60+']++;
  });

  return { genderCounts, ageBuckets, statusCounts };
}

// =============================================
// 6️⃣ THERAPIST PERFORMANCE (Demand, Cancels, Profit)
// =============================================
export function getTherapistPerformance(
  events: Event[],
  hps: Hp[],
  calendars: Calendar[],
): TherapistPerformance {
  const hpCalendarMap: Record<string, string[]> = {};
  calendars.forEach((c) => {
    if (!hpCalendarMap[c.hpId]) hpCalendarMap[c.hpId] = [];
    hpCalendarMap[c.hpId].push(c.id);
  });

  const demandMap: Record<string, number> = {};
  const cancelMap: Record<string, number> = {};
  const profitMap: Record<string, number> = {};

  events.forEach((ev) => {
    const hpId = Object.keys(hpCalendarMap).find((id) => hpCalendarMap[id].includes(ev.calendarId));
    if (!hpId) return;

    if (ev.type === 'APPOINTMENT') {
      demandMap[hpId] = (demandMap[hpId] || 0) + 1;
    }

    if (ev.status === 'CANCELED') {
      cancelMap[hpId] = (cancelMap[hpId] || 0) + 1;
    }

    if (['SEEN', 'ACTIVE', 'IN_CONSULTATION'].includes(ev.status)) {
      profitMap[hpId] = (profitMap[hpId] || 0) + 1;
    }
  });

  const getTop = (map: Record<string, number>) => {
    const id = Object.keys(map).sort((a, b) => map[b] - map[a])[0];
    if (!id) return undefined;
    const hp = hps.find((x) => x.id === id);
    return hp ? { ...hp, count: map[id], value: map[id] } : undefined;
  };

  // NEW — totals
  const totalInDemand = Object.values(demandMap).reduce((a, b) => a + b, 0);
  const totalCancellations = Object.values(cancelMap).reduce((a, b) => a + b, 0);
  const totalProfit = Object.values(profitMap).reduce((a, b) => a + b, 0);

  return {
    mostInDemand: getTop(demandMap),
    mostCancellations: getTop(cancelMap),
    mostProfitable: getTop(profitMap),

    totalInDemand,
    totalCancellations,
    totalProfit,
  };
}
