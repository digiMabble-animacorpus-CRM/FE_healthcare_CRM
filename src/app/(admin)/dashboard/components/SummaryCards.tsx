"use client";

import { Card, Col, Row } from "react-bootstrap";

// =====================================================
// SKELETON
// =====================================================
export function SummaryCardsSkeleton() {
  return (
    <Row className="g-3 mb-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Col md={4} key={i}>
          <Card className="p-3 shadow-sm">
            <div className="placeholder-wave">
              <div className="placeholder col-6 mb-3" style={{ height: 20 }}></div>
              <div className="placeholder col-8 mb-2" style={{ height: 28 }}></div>
              <div className="placeholder col-4" style={{ height: 18 }}></div>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

// =====================================================
// COMPONENT
// =====================================================
interface SummaryCardProps {
  totalAppointments: number;
  totalPatients: number;
  totalTherapists: number;
}

export default function SummaryCards({
  totalAppointments,
  totalPatients,
  totalTherapists,
}: SummaryCardProps) {
  const cards = [
    {
      label: "Total Appointments",
      value: totalAppointments,
    },
    {
      label: "Total Patients",
      value: totalPatients,
    },
    {
      label: "Total Therapists",
      value: totalTherapists,
    },
  ];

  return (
    <Row className="g-3 mb-4">
      {cards.map((card, index) => (
        <Col md={4} key={index}>
          <Card className="p-3 shadow-sm h-100 border-0 bg-light">
            <div className="text-muted mb-1" style={{ fontSize: 14 }}>
              {card.label}
            </div>

            <div className="fw-bold" style={{ fontSize: 32 }}>
              {card.value}
            </div>

            <div className="mt-1 text-secondary" style={{ fontSize: 12 }}>
              Updated just now
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  );
}
