"use client";

import PageTitle from "@/components/PageTitle";
import { useEffect, useRef, useState } from "react";
import dayjs, { Dayjs } from "dayjs";
import {
  Button,
  Col,
  Row,
  Spinner,
  Form,
  Dropdown,
  ButtonGroup,
} from "react-bootstrap";
import Calendar from "@toast-ui/react-calendar";
import "@toast-ui/calendar/dist/toastui-calendar.min.css";
import { Icon } from "@iconify/react";

// MUI
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateCalendar } from "@mui/x-date-pickers/DateCalendar";

const BRANCHES = [
  "Gembloux - Orneau",
  "Gembloux - Tout Vent",
  "Anima Corpus Namur",
];
const CATEGORIES = [
  { id: "consultation", name: "Consultation", color: "#007bff" },
  { id: "followup", name: "Follow-up", color: "#28a745" },
  { id: "therapy", name: "Therapy", color: "#ffc107" },
  { id: "surgery", name: "Surgery", color: "#dc3545" },
];

const AppointmentCalendarPage = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<string[]>([
    ...BRANCHES,
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    CATEGORIES.map((c) => c.id)
  );
  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"month" | "week" | "day">("month");
  const [calendarViewMode, setCalendarViewMode] = useState<"calendar" | "list">(
    "calendar"
  );
  const [calendarHeight, setCalendarHeight] = useState("750px");

  const calendarRef = useRef<any>(null);

  const dummyAppointments = [
    {
      id: "1",
      calendarId: "consultation",
      title: "Consultation - Orneau",
      category: "time",
      branch: "Gembloux - Orneau",
      start: dayjs().toISOString(),
      end: dayjs().add(30, "minute").toISOString(),
    },
    {
      id: "2",
      calendarId: "followup",
      title: "Follow-up - Tout Vent",
      category: "time",
      branch: "Gembloux - Tout Vent",
      start: dayjs().add(1, "day").toISOString(),
      end: dayjs().add(1, "day").add(30, "minute").toISOString(),
    },
    {
      id: "3",
      calendarId: "therapy",
      title: "Therapy - Namur",
      category: "time",
      branch: "Anima Corpus Namur",
      start: dayjs().add(2, "day").toISOString(),
      end: dayjs().add(2, "day").add(1, "hour").toISOString(),
    },
    {
      id: "4",
      calendarId: "surgery",
      title: "Surgery - Orneau",
      category: "time",
      branch: "Gembloux - Orneau",
      start: dayjs().add(3, "day").toISOString(),
      end: dayjs().add(3, "day").add(2, "hour").toISOString(),
    },
  ];

  useEffect(() => {
    setLoading(true);
    const filtered = dummyAppointments.filter(
      (appt) =>
        selectedBranches.includes(appt.branch) &&
        selectedCategories.includes(appt.calendarId)
    );
    setAppointments(filtered);
    setLoading(false);
  }, [selectedBranches, selectedCategories, selectedDate, view]);

  useEffect(() => {
    const updateHeight = () => {
      const offset = 160; // header/tools space
      setCalendarHeight(window.innerHeight - offset + "px");
    };
    updateHeight();
    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  const calendars = CATEGORIES.map((cat) => ({
    id: cat.id,
    name: cat.name,
    color: "#fff",
    bgColor: cat.color,
    dragBgColor: cat.color,
    borderColor: cat.color,
  }));

  const handleBranchChange = (branch: string) => {
    setSelectedBranches((prev) =>
      prev.includes(branch) ? prev.filter((b) => b !== branch) : [...prev, branch]
    );
  };

  const handleCategoryChange = (catId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) ? prev.filter((c) => c !== catId) : [...prev, catId]
    );
  };

  return (
    <>
      <PageTitle subName="Appointments" title="Appointment Calendar" />

      <Row style={{ height: "100%" }}>
        {/* Sidebar */}
        <Col
          md={3}
          style={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minWidth: 0,
          }}
        >
          {/* Mini calendar (MUI) */}
          <div className="p-2 border rounded mb-3" style={{ background: "white" }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar
                value={selectedDate}
                onChange={(newValue) => setSelectedDate(newValue || dayjs())}
                // Make it truly fluid & compact without global CSS:
                sx={{
                  width: "100%",
                  maxWidth: "100%",
                  minWidth: 0,                // override MUI's default minWidth ~310px
                  overflow: "hidden",
                  // Header
                  "& .MuiPickersCalendarHeader-root": { px: 1, mb: 0.5 },
                  "& .MuiPickersCalendarHeader-label": { fontSize: "0.9rem" },
                  "& .MuiPickersArrowSwitcher-root .MuiIconButton-root": {
                    p: 0.5,
                  },
                  // Weekday row
                  "& .MuiDayCalendar-weekDayLabel": { fontSize: "0.75rem" },
                  // Day cells
                  "& .MuiPickersDay-root": {
                    fontSize: "0.75rem",
                  },
                  // Month grid spacing
                  "& .MuiDayCalendar-monthContainer": { mx: 0.5 },
                }}
              />
            </LocalizationProvider>
          </div>

          {/* Branch filter */}
          <div className="p-3 border rounded mb-3">
            <h6 className="mb-2">Branches</h6>
            {BRANCHES.map((branch) => (
              <Form.Check
                key={branch}
                type="checkbox"
                label={branch}
                checked={selectedBranches.includes(branch)}
                onChange={() => handleBranchChange(branch)}
              />
            ))}
          </div>

          {/* Category filter */}
          <div className="p-3 border rounded">
            <h6 className="mb-2">Categories</h6>
            {CATEGORIES.map((cat) => (
              <Form.Check
                key={cat.id}
                type="checkbox"
                label={
                  <span>
                    <span
                      style={{
                        display: "inline-block",
                        width: 12,
                        height: 12,
                        backgroundColor: cat.color,
                        marginRight: 8,
                      }}
                    />
                    {cat.name}
                  </span>
                }
                checked={selectedCategories.includes(cat.id)}
                onChange={() => handleCategoryChange(cat.id)}
              />
            ))}
          </div>
        </Col>

        {/* Main content */}
        <Col md={9} style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
          {/* Top bar */}
          <div className="d-flex justify-content-between align-items-center mb-3 p-2 border rounded bg-light">
            {/* Left: View Selector Dropdown */}
            <Dropdown as={ButtonGroup}>
              <Button variant="outline-primary" size="sm">
                {view.charAt(0).toUpperCase() + view.slice(1)}
              </Button>
              <Dropdown.Toggle split variant="outline-primary" size="sm" />
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => setView("day")}>Day</Dropdown.Item>
                <Dropdown.Item onClick={() => setView("week")}>Week</Dropdown.Item>
                <Dropdown.Item onClick={() => setView("month")}>Month</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

            {/* Center: Date */}
            <h5 className="mb-0">{selectedDate.format("MMMM D, YYYY")}</h5>

            {/* Right: View Toggle Icons */}
            <ButtonGroup size="sm">
              <Button
                variant={calendarViewMode === "calendar" ? "primary" : "outline-primary"}
                onClick={() => setCalendarViewMode("calendar")}
                title="Calendar view"
              >
                <Icon icon="mdi:calendar-month" width="18" />
              </Button>
              <Button
                variant={calendarViewMode === "list" ? "primary" : "outline-primary"}
                onClick={() => setCalendarViewMode("list")}
                title="List view"
              >
                <Icon icon="mdi:view-list" width="18" />
              </Button>
            </ButtonGroup>
          </div>

          {/* Calendar or List */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {loading ? (
              <div className="text-center py-5">
                <Spinner animation="border" />
              </div>
            ) : calendarViewMode === "calendar" ? (
              <Calendar
                ref={calendarRef}
                height={calendarHeight}
                view={view}
                month={{ startDayOfWeek: 1 }}
                week={{ showTimezoneCollapseButton: true }}
                events={appointments}
                calendars={calendars}
              />
            ) : (
              <div
                className="p-3 border rounded bg-white"
                style={{ height: calendarHeight, overflowY: "auto" }}
              >
                {appointments.length === 0 ? (
                  <p className="text-muted">No appointments found.</p>
                ) : (
                  appointments.map((appt) => (
                    <div key={appt.id} className="border-bottom py-2">
                      <strong>{appt.title}</strong>
                      <div>{dayjs(appt.start).format("MMM D, YYYY h:mm A")}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </Col>
      </Row>
    </>
  );
};

export default AppointmentCalendarPage;
