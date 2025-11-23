export interface AppointmentBookingInformation {
  declaredIsNewPatient: boolean;
  isNewPatientRecord: boolean;
}

export interface Attendee {
  entityId: string;
  entityType: "Hp" | "Patient";
  status: "ACCEPTED" | "DECLINED" | "NO_RESPONSE";
}

export type EventStatus = "ACTIVE" | "CONFIRMED" | "CANCELLED" | "ARCHIVED";
export type EventType = "APPOINTMENT" | "LEAVE" | "PERSONAL" | "EXTERNAL_EVENT";

export interface CalendarEvent  {
  id: string;
  title: string;
  status: EventStatus;
  calendarId: string;
  motiveId?: string;
  appointmentBookingInformation?: AppointmentBookingInformation;
  attendees?: Attendee[];
  description?: string;
  patientNote?: string;
  hpNote?: string;
  startAt: string; // ISO 8601 UTC
  endAt: string;
  type: EventType;
  groupId?: string;
  patientExId?: string;
  recurrenceId?: string;
  createdAt?: string;
  updatedAt?: string;
  externalMetadata?: Record<string, any>;
  isCancelled?: boolean;
}
