'use client';

import { Card, Row, Col, ProgressBar } from 'react-bootstrap';
import TimeFilter from './TimeFilter';
import { TherapistPerformance, TimeFilterType } from '../dashboard.types';

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
  const totalAppointments = data.totalInDemand || 1;
  const totalCancellations = data.totalCancellations || 1;
  const totalProfit = data.totalProfit || 1;

  const cards = [
    {
      title: 'Most In-Demand',
      label: 'Appointments',
      therapist: data.mostInDemand
        ? `${data.mostInDemand.firstName} ${data.mostInDemand.lastName}`
        : 'No data',
      value: data.mostInDemand?.count ?? 0,
      percent: ((data.mostInDemand?.count ?? 0) / totalAppointments) * 100,
      total: totalAppointments,
      color: '#9035e3',
      iconBg: 'rgba(144,53,227,0.15)',
      icon: '🔥',
    },
    {
      title: 'Most Cancellations',
      label: 'Cancellations',
      therapist: data.mostCancellations
        ? `${data.mostCancellations.firstName} ${data.mostCancellations.lastName}`
        : 'No data',
      value: data.mostCancellations?.count ?? 0,
      percent: ((data.mostCancellations?.count ?? 0) / totalCancellations) * 100,
      total: totalCancellations,
      color: '#ff5f5f',
      iconBg: 'rgba(255,95,95,0.15)',
      icon: '⚠️',
    },
    {
      title: 'Most Profitable',
      label: 'Revenue',
      therapist: data.mostProfitable
        ? `${data.mostProfitable.firstName} ${data.mostProfitable.lastName}`
        : 'No data',
      value: data.mostProfitable?.value ?? 0,
      percent: ((data.mostProfitable?.value ?? 0) / totalProfit) * 100,
      total: totalProfit,
      color: '#28c76f',
      iconBg: 'rgba(40,199,111,0.15)',
      icon: '💰',
    },
  ];

  return (
    <Card
      className="p-4 mb-4 shadow-sm border-0 rounded-4"
      style={{
        background: '#EEF3FB',
      }}
    >
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 mb-4">
        <h4 className="fw-bold m-0">Therapist Performance</h4>
        <TimeFilter value={timeFilter} onChange={onTimeFilterChange} />
      </div>

      <Row className="g-4">
        {cards.map((card, index) => (
          <Col md={4} key={index}>
            <Card className="p-4 shadow-sm border-0 rounded-4 h-100">
              <div
                style={{
                  width: 55,
                  height: 55,
                  borderRadius: '50%',
                  background: card.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 26,
                }}
              >
                {card.icon}
              </div>

              <h6 className="fw-semibold mt-3">{card.title}</h6>

              <div className="fw-bold" style={{ fontSize: 20 }}>
                {card.therapist}
              </div>

              <small className="text-muted">{card.label}</small>

              <div className="fw-bold mb-1" style={{ fontSize: 22, color: card.color }}>
                {card.value}
              </div>

              <ProgressBar
                now={card.percent}
                style={{ height: 8, borderRadius: 4 }}
                variant={
                  card.color === '#9035e3'
                    ? 'primary'
                    : card.color === '#ff5f5f'
                      ? 'danger'
                      : 'success'
                }
              />

              <small className="text-muted mt-1 d-block">Total: {card.total}</small>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
}
