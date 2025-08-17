'use client';

import React, { useState } from 'react';
import ReactApexChart from 'react-apexcharts';
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Table,
  Button,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  Badge,
  OverlayTrigger,
  Tooltip,
} from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { currency } from '@/context/constants';

type MetricsBox = {
  label: string;
  value: string | number;
  change?: string;
  isPositive?: boolean;
};

type PerformanceItem = {
  name: string;
  value: number;
  change?: string;
  isPositive?: boolean;
};

interface ReportsTrendsProps {
  appointmentsSeries?: any[];
  patientGrowthSeries?: any[];
  revenueSeries?: any[];
  xLabels?: string[];
  topMetrics?: MetricsBox[];
  branchPerformance?: PerformanceItem[];
  doctorPerformance?: PerformanceItem[];
}

const ReportsTrends = ({
  appointmentsSeries,
  patientGrowthSeries,
  revenueSeries,
  xLabels,
  topMetrics = [
    { label: 'Today', value: `${currency}8,839` },
    { label: 'This Month', value: `${currency}52,356`, change: '0.2%', isPositive: true },
    { label: 'This Year', value: `${currency}78M`, change: '0.1%', isPositive: true },
  ],
  branchPerformance = [],
  doctorPerformance = [],
}: ReportsTrendsProps) => {
  const [branchPeriod, setBranchPeriod] = useState('Week');
  const [doctorPeriod, setDoctorPeriod] = useState('Week');

  const renderPerformanceTable = (
    title: string,
    description: string,
    data: PerformanceItem[],
    period: string,
    setPeriod: (p: string) => void,
  ) => (
    <Col lg={6}>
      <Card className="h-100">
        <CardHeader className="d-flex justify-content-between align-items-center border-0">
          <div>
            <CardTitle as="h5">{title}</CardTitle>
            <p className="mb-0 text-muted">{description}</p>
          </div>
          <div className="d-flex gap-2">
            <Dropdown>
              <DropdownToggle size="sm" variant="outline-secondary">
                {period} <IconifyIcon icon="ri:arrow-down-s-line" className="ms-1" />
              </DropdownToggle>
              <DropdownMenu>
                {['Week', 'Month', 'Quarter'].map((p) => (
                  <DropdownItem key={p} onClick={() => setPeriod(p)}>
                    {p}
                  </DropdownItem>
                ))}
              </DropdownMenu>
            </Dropdown>
            <Button size="sm" variant="primary">
              Download Report
            </Button>
          </div>
        </CardHeader>
        <CardBody className="p-2">
          <Table striped hover responsive className="mb-0">
            <thead>
              <tr>
                <th>Name</th>
                <th className="text-end">Appointments</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.name}</td>
                  <td className="text-end">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-${idx}`}>
                          {item.change
                            ? `${item.change} ${item.isPositive ? 'increase' : 'decrease'}`
                            : ''}
                        </Tooltip>
                      }
                    >
                      <Badge
                        bg={
                          item.isPositive === undefined
                            ? 'primary'
                            : item.isPositive
                              ? 'success'
                              : 'danger'
                        }
                        className="fs-6 px-3 py-2 d-inline-flex align-items-center gap-1"
                      >
                        {item.value}
                        {item.change && (
                          <IconifyIcon
                            icon={`mdi:arrow-${item.isPositive ? 'up' : 'down'}`}
                            className="ms-1"
                          />
                        )}
                      </Badge>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Col>
  );

  return (
    <Col xs={12}>
      <Card>
        <CardHeader className="border-0">
          <CardTitle as="h4" className="mb-1">
            Reports & Trends
          </CardTitle>
          <p className="text-muted mb-0">Performance overview</p>
        </CardHeader>
        <CardBody>
          {/* Top Metrics Boxes */}
          <Row className="g-2 text-center mb-4">
            {topMetrics.map((metric, idx) => (
              <Col lg={3} md={6} key={idx}>
                <div className="border bg-light-subtle p-2 rounded">
                  <p className="text-muted mb-1">{metric.label}</p>
                  <h5 className="text-dark mb-1">
                    {metric.value}{' '}
                    {metric.change && (
                      <span
                        className={`text-${metric.isPositive ? 'success' : 'danger'} font-size-13`}
                      >
                        {metric.change}{' '}
                        <IconifyIcon
                          icon={`mdi:arrow-${metric.isPositive ? 'up' : 'down'}`}
                          className="ms-1"
                        />
                      </span>
                    )}
                  </h5>
                </div>
              </Col>
            ))}
          </Row>

          {/* Overall Trends Chart */}
          <ReactApexChart
            options={{
              chart: { id: 'trends', toolbar: { show: true } },
              xaxis: { categories: xLabels },
              stroke: { curve: 'smooth' },
              legend: { position: 'top' },
              tooltip: { shared: true, intersect: false },
            }}
            series={[
              ...(appointmentsSeries || []),
              ...(patientGrowthSeries || []),
              ...(revenueSeries || []),
            ]}
            type="line"
            height={350}
            className="apex-charts mb-4"
          />

          {/* Branch & Doctor Performance Tables */}
          <Row className="g-4 mt-4">
            {renderPerformanceTable(
              'Branch Performance',
              'Appointments per branch',
              branchPerformance,
              branchPeriod,
              setBranchPeriod,
            )}
            {renderPerformanceTable(
              'Doctor Performance',
              'Appointments per doctor',
              doctorPerformance,
              doctorPeriod,
              setDoctorPeriod,
            )}
          </Row>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ReportsTrends;
