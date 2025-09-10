'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, CardBody, CardHeader, CardTitle, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, ProgressBar, Row } from 'react-bootstrap';
import { FaChild, FaFemale, FaMale } from 'react-icons/fa';

type Demographics = {
  gender: { male: number; female: number; other: number };
  ageBuckets: { label: string; value: number }[];
  topCities: { city: string; count: number }[];
};

// New AgeDistributionWidget component
const AgeDistributionWidget = ({ ageBuckets }: { ageBuckets: { label: string; value: number }[] }) => {
  const total = ageBuckets.reduce((sum, a) => sum + a.value, 0);

  const getIcon = (label: string) => {
    if (label.toLowerCase().includes('kid')) return FaChild;
    if (label.toLowerCase().includes('men')) return FaMale;
    if (label.toLowerCase().includes('woman') || label.toLowerCase().includes('female')) return FaFemale;
    return FaChild; // fallback
  };

  return (
    <Row className="g-3">
      {ageBuckets.map((bucket, idx) => {
        const percent = Math.round((bucket.value / total) * 100);
        const Icon = getIcon(bucket.label);
        return (
          <Col lg={4} key={bucket.label}>
            <div className="border rounded p-3 d-flex align-items-center gap-3">
              <div className="avatar-md flex-centered bg-light rounded-circle">
                <Icon size={30} className="text-primary" />
              </div>
              <div className="flex-grow-1">
                <p className="mb-1 text-muted">{bucket.label}</p>
                <p className="fs-18 text-dark fw-medium">
                  {bucket.value} <span className="text-muted fs-14">({percent}%)</span>
                </p>
                <div className="progress" style={{ height: 10 }}>
                  <div className="progress-bar bg-warning" style={{ width: `${percent}%` }} />
                </div>
              </div>
            </div>
          </Col>
        );
      })}
    </Row>
  );
};

const PatientInsights = ({
  newPatientsWeek,
  newPatientsMonth,
  demographics,
}: {
  newPatientsWeek: number;
  newPatientsMonth: number;
  demographics: Demographics;
}) => {
  return (
    <Col xl={12} lg={12}>
      <Card>
        {/* Card Header */}
        <CardHeader className="d-flex justify-content-between align-items-center border-0 pb-1">
          <CardTitle>Patient Insights</CardTitle>
          <Dropdown>
            <DropdownToggle
              as={'a'}
              className="btn btn-sm btn-outline-light rounded icons-center content-none"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Week{' '}
              <IconifyIcon className="ms-1" width={16} height={16} icon="ri:arrow-down-s-line" />
            </DropdownToggle>
            <DropdownMenu className="dropdown-menu-end">
              <DropdownItem>Week</DropdownItem>
              <DropdownItem>Month</DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </CardHeader>

        <CardBody>
          {/* Top metrics */}
          <Row className="mb-3 text-center">
            <Col>
              <div className="fw-semibold fs-4">{newPatientsWeek}</div>
              <div className="text-muted">New Patients (week)</div>
            </Col>
            <Col>
              <div className="fw-semibold fs-4">{newPatientsMonth}</div>
              <div className="text-muted">New Patients (month)</div>
            </Col>
          </Row>

          {/* Gender & Top Cities */}
          <Row className="g-3 mb-3">
            <Col md={6}>
              <div className="p-2 border rounded bg-light-subtle">
                <h6>Gender</h6>
                {Object.entries(demographics.gender).map(([key, value]) => (
                  <div className="mb-2" key={key}>
                    <div className="d-flex justify-content-between mb-1">
                      <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                      <span>{value}%</span>
                    </div>
                    <ProgressBar now={value} variant="primary" className="progress-sm rounded" />
                  </div>
                ))}
              </div>
            </Col>

            <Col md={6}>
              <div className="p-2 border rounded bg-light-subtle">
                <h6>Branch</h6>
                {demographics.topCities.map((c, idx) => (
                  <div className="mb-2" key={idx}>
                    <div className="d-flex justify-content-between mb-1">
                      <span>{c.city}</span>
                      <span>{c.count}</span>
                    </div>
                    <ProgressBar
                      now={(c.count / Math.max(...demographics.topCities.map((t) => t.count))) * 100}
                      variant="success"
                      className="progress-sm rounded"
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          {/* Age Distribution Widget */}
          <div className="p-2 border rounded bg-light-subtle">
            <h6>Age Distribution</h6>
            <AgeDistributionWidget ageBuckets={demographics.ageBuckets} />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PatientInsights;
