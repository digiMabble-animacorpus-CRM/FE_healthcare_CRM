// ==============================
// DASHBOARD TYPE DEFINITIONS
// ==============================

// ----- SITE / BRANCH -----
export interface Site {
  id: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    country?: string;
    number?: string;
    zipCode?: string;
    coords?: {
      lat: number;
      lng: number;
    };
  };
}

// ----- CALENDAR -----
export interface Calendar {
  id: string;
  siteId: string;
  hpId: string;
  label: string;
  color: string;
  timezone: string;
}

// ----- HP (Therapist) -----
export interface Hp {
  id: string;
  nihii?: string;
  firstName: string;
  lastName: string;
}

// ----- PATIENT -----
export interface Patient {
  id: string;
  externalId?: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  ssin?: string;
  legalGender: "M" | "F";
  birthdate: {
    year: number;
    month: number; // -1 if unknown
    day: number;   // -1 if unknown
  };
  language: "en" | "fr" | "nl" | "de";
  status: "ACTIVE" | "INACTIVE";
  contactInfos?: Array<{
    value: string;
    type: "EMAIL" | "PHONE";
    isPrimary: boolean;
    isEmergency: boolean;
    isVerified: boolean;
  }>;
}

// ----- EVENT (Appointment) -----
export interface Event {
  id: string;
  title?: string;
  status:
    | "ACTIVE"
    | "PENDING"
    | "CANCELED"
    | "DELETED"
    | "NO_SHOW"
    | "IN_WAITING_ROOM"
    | "IN_CONSULTATION"
    | "OVERDUE"
    | "SEEN";

  calendarId: string;
  motiveId?: string;

  attendees?: Array<{
    entityId: string;
    entityType: "Hp" | "PatientRecord" | "Event" | "BookableResource";
    status: "NO_RESPONSE" | "REFUSED" | "ACCEPTED";
  }>;

  startAt: string;
  endAt?: string;

  type: "APPOINTMENT" | "PERSONAL" | "LEAVE" | "EXTERNAL_EVENT" | "BUSY";
  groupId?: string;
  patientExId?: string;
}

// ----- DASHBOARD METRICS -----
export interface SummaryMetrics {
  totalAppointments: number;
  totalPatients: number;
  totalTherapists: number;
}

export type TimeFilterType = "today" | "week" | "month" | "all";

// ----- APPOINTMENT ANALYTICS -----
export interface AppointmentBreakdown {
  statusCounts: Record<string, number>;
  typeCounts: Record<string, number>;
  timeOfDayCounts: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
}

// ----- PATIENT ANALYTICS -----
export interface PatientInsights {
  genderCounts: {
    male: number;
    female: number;
  };
  ageBuckets: Record<string, number>;
  statusCounts: {
    active: number;
    inactive: number;
  };
}

// ----- THERAPIST ANALYTICS -----
export interface TherapistPerformance {
  mostInDemand?: Hp & { count: number };
  mostCancellations?: Hp & { count: number };
  mostProfitable?: Hp & { value: number };

  totalInDemand: number;
  totalCancellations: number;
  totalProfit: number;
}

