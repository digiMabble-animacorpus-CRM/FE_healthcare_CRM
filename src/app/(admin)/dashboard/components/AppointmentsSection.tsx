"use client";

import { Card, Row, Col, ProgressBar } from "react-bootstrap";
import TimeFilter from "./TimeFilter";
import { AppointmentBreakdown, TimeFilterType } from "../dashboard.types";

// =====================================================
// SKELETON
// =====================================================
export function AppointmentsSectionSkeleton() {
  return (
    <Card className="p-4 mb-4 shadow-sm border-0 rounded-4">
      <div className="placeholder-wave mb-3">
        <div className="placeholder col-4" style={{ height: 30 }}></div>
      </div>

      <Row className="g-3">
        {[1, 2, 3].map((i) => (
          <Col md={4} key={i}>
            <Card className="p-3 shadow-sm h-100 rounded-4">
              <div className="placeholder-wave">
                <div className="placeholder col-6 mb-2" style={{ height: 20 }}></div>
                <div className="placeholder col-8 mb-2" style={{ height: 16 }}></div>
                <div className="placeholder col-4 mb-2" style={{ height: 16 }}></div>
                <div className="placeholder col-5" style={{ height: 16 }}></div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}

// =====================================================
// COMPONENT
// =====================================================
interface AppointmentsSectionProps {
  data: AppointmentBreakdown;
  timeFilter: TimeFilterType;
  onTimeFilterChange: (value: TimeFilterType) => void;
}

export default function AppointmentsSection({
  data,
  timeFilter,
  onTimeFilterChange,
}: AppointmentsSectionProps) {
  const makeBars = (obj: Record<string, number>) => {
    const total = Object.values(obj).reduce((a, b) => a + b, 0);

    return Object.entries(obj).map(([label, value]) => ({
      label,
      value,
      percent: total > 0 ? Math.round((value / total) * 100) : 0,
    }));
  };

  const statusBars = makeBars(data.statusCounts);
  const typeBars = makeBars(data.typeCounts);
  const timeBars = makeBars(data.timeOfDayCounts);

  return (
    <Card
      className="p-4 mb-4 shadow-sm border-0 rounded-4"
      style={{ background: "#EEF3FB" }} // matches Patients section
    >
      {/* HEADER */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        <h4 className="fw-bold m-0">Appointment Insights</h4>
        <TimeFilter value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <Row className="g-4">
        {/* ========================
            STATUS BREAKDOWN
        ======================== */}
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 rounded-4 border-0">
            <h6 className="fw-semibold mb-3">Status Breakdown</h6>

            {statusBars.map((item, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-capitalize">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <ProgressBar
                  now={item.percent}
                  style={{ height: 7, borderRadius: 4 }}
                  variant={["success", "danger", "warning", "primary"][i % 4]}
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* ========================
            TYPE BREAKDOWN
        ======================== */}
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 rounded-4 border-0">
            <h6 className="fw-semibold mb-3">Type Breakdown</h6>

            {typeBars.map((item, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-capitalize">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <ProgressBar
                  now={item.percent}
                  style={{ height: 7, borderRadius: 4 }}
                  variant={["info", "secondary", "primary", "dark"][i % 4]}
                />
              </div>
            ))}
          </Card>
        </Col>

        {/* ========================
            TIME OF DAY BREAKDOWN
        ======================== */}
        <Col md={4}>
          <Card className="p-4 shadow-sm h-100 rounded-4 border-0">
            <h6 className="fw-semibold mb-3">Time of Day</h6>

            {timeBars.map((item, i) => (
              <div key={i} className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <span className="text-capitalize">{item.label}</span>
                  <strong>{item.value}</strong>
                </div>
                <ProgressBar
                  now={item.percent}
                  style={{ height: 7, borderRadius: 4 }}
                  variant={["warning", "primary", "success"][i % 3]}
                />
              </div>
            ))}
          </Card>
        </Col>
      </Row>
    </Card>
  );
}
