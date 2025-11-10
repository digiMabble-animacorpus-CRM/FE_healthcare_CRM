"use client";

import React, { useMemo, useState, useRef, useEffect } from "react";
import type { Calendar as CalendarType } from "../calendars/types";
import type { Site } from "../sites/types";
import type { HealthProfessional } from "../hps/types";
import type { Patient } from "../patients/types";

interface CalendarFiltersProps {
  sites: Site[];
  hps: HealthProfessional[];
  patients: Patient[];
  calendars: CalendarType[];
  selectedSiteIds: string[];
  selectedHpIds: string[];
  selectedPatientIds: string[];
  selectedStatus: string[];
  selectedType: string[];
  onSiteChange: (siteIds: string[]) => void;
  onHpChange: (hpIds: string[]) => void;
  onPatientChange: (patientIds: string[]) => void;
  onStatusChange: (statuses: string[]) => void;
  onTypeChange: (types: string[]) => void;
  visibleCalendarIds: Set<string>;
  onToggleCalendarVisibility: (calendarId: string) => void;
}

/* 🔹 Reusable Multi-Select with Search */
const MultiSelectDropdown: React.FC<{
  label: string;
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (values: string[]) => void;
}> = ({ label, options, selected, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  const allSelected = selected.length === options.length;
  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  // Close on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleAll = () => {
    if (allSelected) onChange([]);
    else onChange(options.map((opt) => opt.value));
  };

  const toggleOption = (value: string) => {
    if (selected.includes(value))
      onChange(selected.filter((v) => v !== value));
    else onChange([...selected, value]);
  };

  return (
    <div ref={ref} style={{ position: "relative", marginBottom: 12 }}>
      <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
        {label}
      </label>

      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: "1px solid #ccc",
          padding: 8,
          borderRadius: 6,
          background: "#fff",
          cursor: "pointer",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span style={{ color: selected.length ? "#000" : "#888" }}>
          {selected.length === 0
            ? "Select..."
            : selected.length === options.length
            ? "All selected"
            : `${selected.length} selected`}
        </span>
        <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▼</span>
      </div>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #ccc",
            borderRadius: 6,
            marginTop: 4,
            maxHeight: 240,
            overflowY: "auto",
            zIndex: 100,
          }}
        >
          <input
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              borderBottom: "1px solid #eee",
              outline: "none",
              boxSizing: "border-box",
            }}
          />

          {/* Select All */}
          <div
            style={{
              padding: "8px 10px",
              borderBottom: "1px solid #eee",
              background: allSelected ? "rgba(0, 128, 255, 0.1)" : "transparent",
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
            }}
            onClick={toggleAll}
          >
            <input type="checkbox" checked={allSelected} readOnly />
            <span>Select All</span>
          </div>

          {/* Options */}
          {filtered.length ? (
            filtered.map((opt) => (
              <div
                key={opt.value}
                onClick={() => toggleOption(opt.value)}
                style={{
                  padding: "8px 10px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: selected.includes(opt.value)
                    ? "rgba(0, 128, 255, 0.08)"
                    : "transparent",
                }}
              >
                <input
                  type="checkbox"
                  checked={selected.includes(opt.value)}
                  readOnly
                />
                <span>{opt.label}</span>
              </div>
            ))
          ) : (
            <div style={{ padding: 10, color: "#777" }}>No results</div>
          )}
        </div>
      )}
    </div>
  );
};

const CalendarFilters: React.FC<CalendarFiltersProps> = ({
  sites,
  hps,
  patients,
  calendars,
  selectedSiteIds,
  selectedHpIds,
  selectedPatientIds,
  selectedStatus,
  selectedType,
  onSiteChange,
  onHpChange,
  onPatientChange,
  onStatusChange,
  onTypeChange,
  visibleCalendarIds,
  onToggleCalendarVisibility,
}) => {
  const calendarsBySite = useMemo(() => {
    const map = new Map<string, CalendarType[]>();
    calendars.forEach((c) => {
      const arr = map.get(c.siteId) || [];
      arr.push(c);
      map.set(c.siteId, arr);
    });
    return map;
  }, [calendars]);

  return (
    <aside style={{ width: 300, padding: 12 }}>
      <MultiSelectDropdown
        label="Site"
        options={sites.map((s) => ({ value: s.id, label: s.name }))}
        selected={selectedSiteIds}
        onChange={onSiteChange}
      />

      <MultiSelectDropdown
        label="Therapist"
        options={hps.map((hp) => ({
          value: hp.id,
          label: `${hp.firstName} ${hp.lastName}`,
        }))}
        selected={selectedHpIds}
        onChange={onHpChange}
      />

      <MultiSelectDropdown
        label="Patient"
        options={patients.map((p) => ({
          value: p.id,
          label: `${p.firstName} ${p.lastName}`,
        }))}
        selected={selectedPatientIds}
        onChange={onPatientChange}
      />

      <MultiSelectDropdown
        label="Status"
        options={[
          { value: "ACTIVE", label: "Active" },
          { value: "CONFIRMED", label: "Confirmed" },
          { value: "CANCELED", label: "Canceled" },
          { value: "ARCHIVED", label: "Archived" },
          { value: "DELETED", label: "Deleted" },
        ]}
        selected={selectedStatus}
        onChange={onStatusChange}
      />

      <MultiSelectDropdown
        label="Type"
        options={[
          { value: "APPOINTMENT", label: "Appointment" },
          { value: "LEAVE", label: "Leave" },
          { value: "PERSONAL", label: "Personal" },
          { value: "EXTERNAL_EVENT", label: "External Event" },
        ]}
        selected={selectedType}
        onChange={onTypeChange}
      />

      {/* Calendars */}
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontWeight: 700, marginBottom: 8 }}>
          My calendars
        </label>
        <div style={{ maxHeight: 240, overflowY: "auto", paddingRight: 6 }}>
          {calendars.map((cal) => {
            const hp = hps.find((h) => h.id === cal.hpId);
            return (
              <div
                key={cal.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <input
                  type="checkbox"
                  checked={visibleCalendarIds.has(cal.id)}
                  onChange={() => onToggleCalendarVisibility(cal.id)}
                />
                <div
                  style={{
                    width: 10,
                    height: 10,
                    background: cal.color || "#999",
                    borderRadius: 3,
                  }}
                />
                <div style={{ fontSize: 14 }}>
                  <div style={{ fontWeight: 600 }}>{cal.label}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    {hp ? `${hp.firstName} ${hp.lastName}` : ""}
                  </div>
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
