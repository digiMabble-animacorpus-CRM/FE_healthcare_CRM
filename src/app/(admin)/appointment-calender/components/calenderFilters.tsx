"use client";

import React, { useMemo, useState } from "react";
import type { Calendar as CalendarType } from "../calendars/types";
import type { Site } from "../sites/types";
import type { HealthProfessional } from "../hps/types";
import type { Patient } from "../patients/types";

interface CalendarFiltersProps {
  sites: Site[];
  hps: HealthProfessional[];
  patients: Patient[];
  calendars: CalendarType[]; // all calendars (hp × site)
  selectedSiteId?: string;
  selectedHpId?: string;
  selectedPatientId?: string;
  onSiteChange: (siteId: string) => void;
  onHpChange: (hpId: string) => void;
  onPatientChange: (patientId: string) => void;
  visibleCalendarIds: Set<string>;
  onToggleCalendarVisibility: (calendarId: string) => void;
}

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  sites,
  hps,
  patients,
  calendars,
  selectedSiteId,
  selectedHpId,
  selectedPatientId,
  onSiteChange,
  onHpChange,
  onPatientChange,
  visibleCalendarIds,
  onToggleCalendarVisibility,
}) => {
  const [patientSearch, setPatientSearch] = useState("");

  // Group calendars by site for display
  const calendarsBySite = useMemo(() => {
    const map = new Map<string, CalendarType[]>();
    calendars.forEach((c) => {
      const arr = map.get(c.siteId) || [];
      arr.push(c);
      map.set(c.siteId, arr);
    });
    return map;
  }, [calendars]);

  const filteredPatients = patients.filter((p) =>
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(patientSearch.toLowerCase())
  );

  return (
    <aside style={{ width: 300, padding: 12 }}>
      {/* Sites & HP filters */}
      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Site</label>
        <select
          value={selectedSiteId || ""}
          onChange={(e) => onSiteChange(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 6 }}
        >
          <option value="">All sites</option>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Therapist</label>
        <select
          value={selectedHpId || ""}
          onChange={(e) => onHpChange(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 6 }}
        >
          <option value="">All therapists</option>
          {hps.map((hp) => (
            <option key={hp.id} value={hp.id}>
              {hp.firstName} {hp.lastName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: 12 }}>
        <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Patient</label>
        <input
          placeholder="Search patient..."
          value={patientSearch}
          onChange={(e) => setPatientSearch(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 6, marginBottom: 8 }}
        />
        <select
          value={selectedPatientId || ""}
          onChange={(e) => onPatientChange(e.target.value)}
          style={{ width: "100%", padding: 8, borderRadius: 6 }}
        >
          <option value="">All patients</option>
          {filteredPatients.map((p) => (
            <option key={p.id} value={p.id}>
              {p.firstName} {p.lastName}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>My calendars</label>
        <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 6 }}>
          {[...calendars].map((cal) => {
            const hp = hps.find((h) => h.id === cal.hpId);
            return (
              <div key={cal.id} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <input
                  type="checkbox"
                  checked={visibleCalendarIds.has(cal.id)}
                  onChange={() => onToggleCalendarVisibility(cal.id)}
                />
                <div style={{ width: 10, height: 10, background: cal.color || "#999", borderRadius: 3 }} />
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 600 }}>{cal.label}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>{hp ? `${hp.firstName} ${hp.lastName}` : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default CalendarFilters;
