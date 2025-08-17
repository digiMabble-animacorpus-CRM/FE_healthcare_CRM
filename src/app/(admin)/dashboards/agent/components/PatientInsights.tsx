'use client';

import IconifyIcon from '@/components/wrappers/IconifyIcon';
import ReactApexChart from 'react-apexcharts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  ProgressBar,
  Row,
} from 'react-bootstrap';

type Demographics = {
  gender: { male: number; female: number; other: number };
  ageBuckets: { label: string; value: number }[];
  topCities: { city: string; count: number }[];
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
  // Age chart setup
  const ageChartOptions = {
    chart: {
      type: 'bar' as const,
      toolbar: { show: false },
    },
    plotOptions: {
      bar: { horizontal: true, borderRadius: 4 },
    },
    dataLabels: { enabled: false },
    xaxis: {
      categories: demographics.ageBuckets.map((a) => a.label),
    },
    colors: ['#0d6efd'],
  };

  const ageChartSeries = [
    {
      name: 'Patients',
      data: demographics.ageBuckets.map((a) => a.value),
    },
  ];

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
                <h6>Top Cities</h6>
                {demographics.topCities.map((c, idx) => (
                  <div className="mb-2" key={idx}>
                    <div className="d-flex justify-content-between mb-1">
                      <span>{c.city}</span>
                      <span>{c.count}</span>
                    </div>
                    <ProgressBar
                      now={
                        (c.count / Math.max(...demographics.topCities.map((t) => t.count))) * 100
                      }
                      variant="success"
                      className="progress-sm rounded"
                    />
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          {/* Age Distribution Chart */}
          <div className="p-2 border rounded bg-light-subtle">
            <h6>Age Distribution</h6>
            <ReactApexChart
              options={ageChartOptions}
              series={ageChartSeries}
              type="bar"
              height={180}
            />
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default PatientInsights;
