"use client";

import { Card, Row, Col } from "react-bootstrap";
import TimeFilter from "./TimeFilter";
import { PatientInsights, TimeFilterType } from "../dashboard.types";

// =====================================================
// SKELETON
// =====================================================
export function PatientsSectionSkeleton() {
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
                <div className="placeholder col-5 mb-2" style={{ height: 16 }}></div>
                <div className="placeholder col-3" style={{ height: 16 }}></div>
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
interface PatientsSectionProps {
  data: PatientInsights;
  timeFilter: TimeFilterType;
  onTimeFilterChange: (value: TimeFilterType) => void;
}

export default function PatientsSection({
  data,
  timeFilter,
  onTimeFilterChange,
}: PatientsSectionProps) {
  return (
    <Card className="p-3 mb-4 shadow-sm border-0 bg-light">
      {/* SECTION HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0">Patient Insights</h5>
        <TimeFilter value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <Row className="g-3">

        {/* ===========================
            GENDER BREAKDOWN
        ============================ */}
        <Col md={4}>
          <Card className="p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Gender Distribution</h6>

            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Male</span>
              <strong>{data.genderCounts.male}</strong>
            </div>

            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Female</span>
              <strong>{data.genderCounts.female}</strong>
            </div>
          </Card>
        </Col>

        {/* ===========================
            AGE BUCKET BREAKDOWN
        ============================ */}
        <Col md={4}>
          <Card className="p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Age Groups</h6>

            {Object.entries(data.ageBuckets).map(([range, count]) => (
              <div key={range} className="d-flex justify-content-between mb-1">
                <span className="text-muted">{range}</span>
                <strong>{count}</strong>
              </div>
            ))}
          </Card>
        </Col>

        {/* ===========================
            PATIENT STATUS BREAKDOWN
        ============================ */}
        <Col md={4}>
          <Card className="p-3 shadow-sm h-100">
            <h6 className="fw-semibold mb-3">Patient Status</h6>

            <div className="d-flex justify-content-between mb-1">
              <span className="text-muted">Active</span>
              <strong>{data.statusCounts.active}</strong>
            </div>

            <div className="d-flex justify-content-between">
              <span className="text-muted">Inactive</span>
              <strong>{data.statusCounts.inactive}</strong>
            </div>
          </Card>
        </Col>

      </Row>
    </Card>
  );
}
