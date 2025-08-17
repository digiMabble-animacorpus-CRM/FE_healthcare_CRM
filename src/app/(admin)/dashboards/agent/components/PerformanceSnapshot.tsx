'use client';

import { Card, CardBody, Row, Col } from 'react-bootstrap';

const PerformanceSnapshot = ({
  weekAppointments,
  noShows,
  cancellations,
  satisfactionScore,
}: {
  weekAppointments: number;
  noShows: number;
  cancellations: number;
  satisfactionScore?: number; // optional if you don't have ratings yet
}) => {
  return (
    <Card className="mb-3">
      <CardBody>
        <h5 className="mb-3">Performance Snapshot</h5>
        <Row className="text-center">
          <Col>
            <div className="fw-semibold fs-4">{weekAppointments}</div>
            <div className="text-muted">Appts (week)</div>
          </Col>
          <Col>
            <div className="fw-semibold fs-4">{noShows}</div>
            <div className="text-muted">No-shows</div>
          </Col>
          <Col>
            <div className="fw-semibold fs-4">{cancellations}</div>
            <div className="text-muted">Cancelled</div>
          </Col>
        </Row>
        {typeof satisfactionScore === 'number' && (
          <div className="mt-3">
            Patient Satisfaction: <strong>{satisfactionScore.toFixed(1)}</strong> / 5
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default PerformanceSnapshot;
