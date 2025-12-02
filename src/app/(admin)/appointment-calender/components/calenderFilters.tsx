"use client";

import React, {
  useMemo,
  useState,
  useRef,
  useEffect,
} from "react";

import { Card, Button } from "react-bootstrap";

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
  onSiteChange: (ids: string[]) => void;
  onHpChange: (ids: string[]) => void;
  onPatientChange: (ids: string[]) => void;
  onStatusChange: (ids: string[]) => void;
  onTypeChange: (ids: string[]) => void;
  visibleCalendarIds: Set<string>;
  onToggleCalendarVisibility: (id: string) => void;
}

/* -----------------------------------------
   MULTI SELECT DROPDOWN
------------------------------------------ */
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

  const filtered = useMemo(
    () =>
      options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      ),
    [options, search]
  );

  // Close on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const toggleOption = (val: string) => {
    if (selected.includes(val)) {
      onChange(selected.filter((v) => v !== val));
    } else {
      onChange([...selected, val]);
    }
  };

  const toggleAll = () => {
    if (allSelected) onChange([]);
    else onChange(options.map((o) => o.value));
  };

  return (
    <div className="position-relative mb-3" ref={ref}>
      <label className="fw-semibold mb-1 d-block">{label}</label>

      {/* Trigger */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isOpen}
        className="border rounded px-3 py-2 bg-white d-flex justify-content-between align-items-center"
        onClick={() => setIsOpen((x) => !x)}
      >
        <span className={selected.length ? "text-dark" : "text-muted"}>
          {selected.length === 0
            ? "Select..."
            : selected.length === options.length
            ? "All selected"
            : `${selected.length} selected`}
        </span>
        <span style={{ fontSize: 12 }}>{isOpen ? "▲" : "▼"}</span>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <Card
          className="shadow-sm mt-1 position-absolute w-100"
          style={{
            zIndex: 2000,
            maxHeight: 250,
            overflowY: "auto",
          }}
        >
          {/* Search */}
          <div className="p-2 border-bottom">
            <input
              className="form-control"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Select All */}
          <div
            className="px-3 py-2 border-bottom d-flex gap-2"
            style={{ cursor: "pointer" }}
            onClick={toggleAll}
          >
            <input type="checkbox" checked={allSelected} readOnly />
            <span>Select All</span>
          </div>

          {filtered.length ? (
            filtered.map((opt) => (
              <div
                key={opt.value}
                className="px-3 py-2 d-flex gap-2"
                style={{
                  cursor: "pointer",
                  background: selected.includes(opt.value)
                    ? "rgba(0,123,255,0.08)"
                    : "transparent",
                }}
                onClick={() => toggleOption(opt.value)}
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
            <div className="p-3 text-center text-muted">No results</div>
          )}
        </Card>
      )}
    </div>
  );
};

/* -----------------------------------------
   MAIN FILTERS COMPONENT
------------------------------------------ */
const CalendarFilters: React.FC<CalendarFiltersProps> = (props) => {
  const {
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
  } = props;

  const [openMobile, setOpenMobile] = useState(false);

  return (
    <Card className="p-3 shadow-sm rounded-3 w-100">
      {/* MOBILE BUTTON */}
      <div className="d-lg-none mb-2">
        <Button
          variant="primary"
          className="w-100"
          onClick={() => setOpenMobile((x) => !x)}
        >
          {openMobile ? "Hide Filters ▲" : "Show Filters ▼"}
        </Button>
      </div>

      {/* MOBILE COLLAPSE */}
      <div className={`d-lg-block ${openMobile ? "" : "d-none"}`}>
        {/* SITE */}
        <MultiSelectDropdown
          label="Site"
          options={sites.map((s) => ({
            value: s.id,
            label: s.name,
          }))}
          selected={selectedSiteIds}
          onChange={onSiteChange}
        />

        {/* THERAPIST */}
        <MultiSelectDropdown
          label="Therapist"
          options={hps.map((hp) => ({
            value: hp.id,
            label: `${hp.firstName} ${hp.lastName}`,
          }))}
          selected={selectedHpIds}
          onChange={onHpChange}
        />

        {/* PATIENT */}
        <MultiSelectDropdown
          label="Patient"
          options={patients.map((p) => ({
            value: p.id,
            label: `${p.firstName} ${p.lastName}`,
          }))}
          selected={selectedPatientIds}
          onChange={onPatientChange}
        />

        {/* STATUS */}
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

        {/* TYPE */}
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

        {/* CALENDARS */}
        <div className="mt-3">
          <div className="fw-bold mb-2">My Calendars</div>

          <div style={{ maxHeight: 240, overflowY: "auto" }}>
            {calendars.map((cal) => (
              <div
                key={cal.id}
                className="d-flex align-items-center gap-2 mb-2"
                style={{ cursor: "pointer" }}
              >
                <input
                  type="checkbox"
                  checked={visibleCalendarIds.has(cal.id)}
                  onChange={() => onToggleCalendarVisibility(cal.id)}
                />

                <div
                  style={{
                    width: 14,
                    height: 14,
                    background: cal.color || "#ccc",
                    borderRadius: 3,
                  }}
                />

                <div className="fw-semibold">{cal.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default CalendarFilters;
