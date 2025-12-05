"use client";

import { Card, Row, Col } from "react-bootstrap";
import TimeFilter from "./TimeFilter";
import { TherapistPerformance, TimeFilterType } from "../dashboard.types";

// =====================================================
// SKELETON
// =====================================================
export function TherapistsSectionSkeleton() {
  return (
    <Card className="p-3 mb-4 shadow-sm">
      <div className="placeholder-wave mb-3">
        <div className="placeholder col-5" style={{ height: 30 }}></div>
      </div>

      <Row className="g-3">
        {[1, 2, 3].map((i) => (
          <Col md={4} key={i}>
            <Card className="p-3 shadow-sm h-100">
              <div className="placeholder-wave">
                <div className="placeholder col-8 mb-3" style={{ height: 22 }}></div>
                <div className="placeholder col-6 mb-2" style={{ height: 16 }}></div>
                <div className="placeholder col-4 mb-2" style={{ height: 16 }}></div>
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
interface TherapistsSectionProps {
  data: TherapistPerformance;
  timeFilter: TimeFilterType;
  onTimeFilterChange: (value: TimeFilterType) => void;
}

export default function TherapistsSection({
  data,
  timeFilter,
  onTimeFilterChange,
}: TherapistsSectionProps) {
  const cards = [
    {
      title: "Most In-Demand",
      therapist: data.mostInDemand
        ? `${data.mostInDemand.firstName} ${data.mostInDemand.lastName}`
        : "No data",
      value: data.mostInDemand?.count ?? 0,
      icon: "🔥",
    },
    {
      title: "Most Cancellations",
      therapist: data.mostCancellations
        ? `${data.mostCancellations.firstName} ${data.mostCancellations.lastName}`
        : "No data",
      value: data.mostCancellations?.count ?? 0,
      icon: "⚠️",
    },
    {
      title: "Most Profitable",
      therapist: data.mostProfitable
        ? `${data.mostProfitable.firstName} ${data.mostProfitable.lastName}`
        : "No data",
      value: data.mostProfitable?.value ?? 0,
      icon: "💰",
    },
  ];

  return (
    <Card className="p-3 mb-4 shadow-sm border-0 bg-light">
      {/* SECTION HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0">Therapist Performance</h5>
        <TimeFilter value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <Row className="g-3">
        {cards.map((card, index) => (
          <Col md={4} key={index}>
            <Card className="p-3 shadow-sm h-100 text-center border-0">
              <div style={{ fontSize: 40 }}>{card.icon}</div>

              <h6 className="fw-semibold mt-2">{card.title}</h6>

              <div className="fw-bold mt-1" style={{ fontSize: 22 }}>
                {card.therapist}
              </div>

              <div className="text-muted mt-1" style={{ fontSize: 14 }}>
                Score: <strong>{card.value}</strong>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
