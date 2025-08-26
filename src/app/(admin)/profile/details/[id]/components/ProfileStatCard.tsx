'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Row, Col, ProgressBar, Card } from 'react-bootstrap';
import type { PatientType } from '@/types/data';

type Props = { patient: PatientType };

const PatientStatCard = ({ patient }: Props) => {
  const stats = [
    { title: 'Visits', count: patient.visits || 0, variant: 'primary', icon: 'mdi:doctor' },
    {
      title: 'Prescriptions',
      count: patient.prescriptions || 0,
      variant: 'success',
      icon: 'mdi:pill',
    },
    { title: 'Pending Bills', count: patient.bills || 0, variant: 'warning', icon: 'mdi:cash' },
  ];

  return (
    <div className="mt-4">
      <Row className="g-3">
        {stats.map((stat, idx) => (
          <Col lg={4} key={idx}>
            <Card className="p-2 shadow-none border">
              <div className="d-flex gap-3 align-items-center">
                <div className={`avatar bg-${stat.variant} bg-opacity-10 rounded flex-centered`}>
                  <IconifyIcon
                    icon={stat.icon}
                    width={28}
                    height={28}
                    className={`fs-28 text-${stat.variant}`}
                  />
                </div>
                <div>
                  <p className="text-dark fw-semibold fs-16 mb-0">{stat.title}</p>
                  <p className="mb-0">{stat.count}</p>
                  <ProgressBar
                    style={{ height: 10 }}
                    striped
                    animated
                    variant={stat.variant}
                    className="mt-2"
                    now={stat.count}
                  />
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default PatientStatCard;
