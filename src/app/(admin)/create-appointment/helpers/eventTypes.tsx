// types/eventTypes.ts

/* -------------------------------------------
 * Attendees
 * ------------------------------------------- */
export type AttendeeEntityType = "Hp" | "PatientRecord" | "Event" | "BookableResource";

export type AttendeeStatus = "NO_RESPONSE" | "REFUSED" | "ACCEPTED";

export interface AttendeeDto {
  entityId: string;
  entityType: AttendeeEntityType;
  status: AttendeeStatus;
}

/* -------------------------------------------
 * Appointment Booking Information
 * ------------------------------------------- */
export interface AppointmentBookingInformation {
  declaredIsNewPatient: boolean;
  isNewPatientRecord: boolean;
}

/* -------------------------------------------
 * Event Types
 * ------------------------------------------- */
export type EventStatus =
  | "ACTIVE"
  | "PENDING"
  | "CANCELED"
  | "DELETED"
  | "NO_SHOW"
  | "IN_WAITING_ROOM"
  | "IN_CONSULTATION"
  | "OVERDUE"
  | "SEEN";

export type EventType =
  | "APPOINTMENT"
  | "PERSONAL"
  | "LEAVE"
  | "EXTERNAL_EVENT"
  | "BUSY";

/* -------------------------------------------
 * Event DTO (GET /events/:id)
 * ------------------------------------------- */
export interface EventDto {
  id: string;
  title?: string;
  status: EventStatus;
  calendarId: string;
  motiveId?: string;
  appointmentBookingInformation?: AppointmentBookingInformation;
  attendees?: AttendeeDto[];
  description?: string;
  patientNote?: string;
  hpNote?: string;
  startAt: string; // ISO datetime
  endAt?: string; // ISO datetime
  type: EventType;
  groupId?: string;
  patientExId?: string;
}

/* -------------------------------------------
 * Event Create Request
 * POST /events/bulk
 * ------------------------------------------- */
export interface EventCreateRequestDto {
  title: string;
  status: EventStatus;
  calendarId: string;
  motiveId?: string; // required ONLY if type = APPOINTMENT
  appointmentBookingInformation?: AppointmentBookingInformation;
  attendees?: AttendeeDto[];
  description?: string;
  patientNote?: string;
  hpNote?: string;
  startAt: string; // ISO datetime
  endAt: string; // ISO datetime
  type: EventType;
}

/* -------------------------------------------
 * Event Update Request
 * PATCH /events/bulk
 * ------------------------------------------- */
export interface EventUpdateRequestDto {
  id: string;
  title?: string;
  status?: EventStatus;
  calendarId?: string;
  motiveId?: string;
  attendees?: AttendeeDto[];
  description?: string;
  patientNote?: string;
  hpNote?: string;
  startAt?: string;
  endAt?: string;
}

/* -------------------------------------------
 * Calendars (used by calendar dropdown)
 * ------------------------------------------- */
export interface CalendarPermission {
  hpId: string;
  permissions: string[];
}

export interface CalendarDto {
  id: string;
  siteId: string;
  hpId: string;
  label: string;
  color: string;
  timezone: string;
  permissions?: {
    organizationPermissions: string[];
    individualPermissions: CalendarPermission[];
  };
}

/* -------------------------------------------
 * Motives (used when type = APPOINTMENT)
 * ------------------------------------------- */
export type MotiveStatus = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export interface MotiveDto {
  id: string;
  calendarIds: string[];
  label: string;
  newPatientDuration: number;
  existingPatientDuration: number;
  isBookableOnline?: boolean;
  color: string;
  status: MotiveStatus;
  isSendingNotificationsDisabled?: boolean;
}
