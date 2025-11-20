"use client";

import React from "react";
import type { CalendarEvent } from "../events/types";
import type { Calendar } from "../calendars/types";
import type { HealthProfessional } from "../hps/types";
import type { Patient } from "../patients/types";
import type { Site } from "../sites/types";

interface EventDetailsModalProps {
  event: CalendarEvent | null;
  calendars: Calendar[];
  hps: HealthProfessional[];
  patients: Patient[];
  sites: Site[];
  onClose: () => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  calendars,
  hps,
  patients,
  sites,
  onClose,
}) => {
  if (!event) return null;

  const calendar = calendars.find((c) => c.id === event.calendarId);
  const hp = hps.find((h) => h.id === calendar?.hpId);
  const site = sites.find((s) => s.id === calendar?.siteId);
  const patient = patients.find(
    (p) => p.externalId === event.patientExId || p.id === event.patientExId
  );

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "#fff",
          borderRadius: 10,
          padding: "1.5rem",
          width: "420px",
          boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
          animation: "fadeIn 0.2s ease",
        }}
      >
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>
          {event.title || "Untitled Event"}
        </h2>

        <p style={{ fontSize: 14, color: "#555", marginBottom: 10 }}>
          {new Date(event.startAt).toLocaleString()} —{" "}
          {new Date(event.endAt).toLocaleString()}
        </p>

        <div style={{ borderTop: "1px solid #eee", paddingTop: 10 }}>
          <p>
            <strong>👩‍⚕️ Therapist:</strong>{" "}
            {hp ? `${hp.firstName} ${hp.lastName}` : "—"}
          </p>
          <p>
            <strong>🏥 Site:</strong> {site?.name || "—"}
          </p>
          <p>
            <strong>🧍 Patient:</strong>{" "}
            {patient
              ? `${patient.firstName} ${patient.lastName}`
              : "No linked patient"}
          </p>
          <p>
            <strong>📘 Type:</strong> {event.type || "—"}
          </p>
          <p>
            <strong>Status:</strong> {event.status || "—"}
          </p>
          {event.description && (
            <p>
              <strong>📝 Description:</strong> {event.description}
            </p>
          )}
          {event.patientNote && (
            <p>
              <strong>💬 Patient Note:</strong> {event.patientNote}
            </p>
          )}
          {event.hpNote && (
            <p>
              <strong>👨‍⚕️ HP Note:</strong> {event.hpNote}
            </p>
          )}
        </div>

        <div style={{ marginTop: 16, textAlign: "right" }}>
          <button
            onClick={onClose}
            style={{
              background: "#c00",
              color: "#fff",
              border: "none",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsModal;
