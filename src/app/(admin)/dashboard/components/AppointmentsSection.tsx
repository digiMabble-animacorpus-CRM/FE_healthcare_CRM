"use client";

import { Card, Row, Col } from "react-bootstrap";
import TimeFilter from "./TimeFilter";
import { AppointmentBreakdown, TimeFilterType } from "../dashboard.types";

// =====================================================
// SKELETON
// =====================================================
export function AppointmentsSectionSkeleton() {
  return (
    <Card className="p-3 mb-4 shadow-sm">
      <div className="placeholder-wave mb-3">
        <div className="placeholder col-4" style={{ height: 30 }}></div>
      </div>

      <Row className="g-3">
        {[1, 2, 3].map((i) => (
          <Col md={4} key={i}>
            <Card className="p-3 shadow-sm h-100">
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
  return (
    <Card className="p-3 mb-4 shadow-sm border-0 bg-light">
      {/* SECTION HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0">Appointments Overview</h5>
        <TimeFilter value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      {/* ANALYTICS GRID */}
      <Row className="g-3">

        {/* ===========================
            STATUS BREAKDOWN
        ============================ */}
        <Col md={4}>
          <Card className="p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Status Breakdown</h6>
            {Object.entries(data.statusCounts).map(([status, count]) => (
              <div key={status} className="d-flex justify-content-between mb-1">
                <span className="text-muted">{status}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </Card>
        </Col>

        {/* ===========================
            TYPE BREAKDOWN
        ============================ */}
        <Col md={4}>
          <Card className="p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Type Breakdown</h6>
            {Object.entries(data.typeCounts).map(([type, count]) => (
              <div key={type} className="d-flex justify-content-between mb-1">
                <span className="text-muted">{type}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </Card>
        </Col>

        {/* ===========================
            TIME OF DAY BREAKDOWN
        ============================ */}
        <Col md={4}>
          <Card className="p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Time of Day</h6>
            {Object.entries(data.timeOfDayCounts).map(([period, count]) => (
              <div key={period} className="d-flex justify-content-between mb-1">
                <span className="text-muted">{period}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </Card>
        </Col>

      </Row>
    </Card>
  );
}
