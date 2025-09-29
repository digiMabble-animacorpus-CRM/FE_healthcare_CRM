'use client';

import React, { useMemo, useState } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import {
  Card,
  CardBody,
  Col,
  Row,
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
} from 'react-bootstrap';

export type BranchSummaryItem = {
  branchId: number | string;
  branchName: string;
  doctors: number;
  patients: number;
  appointmentsMonth: number;
  revenueMonth: number; // currency handling left to consumer
  date?: string; // ISO date string if you need filtering by created_at
};

type BranchSummaryProps = {
  summaries: BranchSummaryItem[];
};

const num = (n: number) => new Intl.NumberFormat().format(n);

const BranchSummary: React.FC<BranchSummaryProps> = ({ summaries }) => {
  const [dateFilter, setDateFilter] = useState<'all' | string>('all');

  if (!summaries || summaries.length === 0) {
    return <div>No branch summaries available.</div>;
  }

  // ✅ Apply date filtering (if summaries include "date")
  const filteredSummaries = useMemo(() => {
    if (dateFilter === 'all') return summaries;

    const now = new Date();
    return summaries.filter((b) => {
      if (!b.date) return true;
      const d = new Date(b.date);

      switch (dateFilter) {
        case 'today':
          return d.toDateString() === now.toDateString();

        case 'this_week': {
          const startOfWeek = new Date(now);
          startOfWeek.setDate(now.getDate() - now.getDay());
          startOfWeek.setHours(0, 0, 0, 0);
          return d >= startOfWeek;
        }

        case '15_days': {
          const start = new Date(now);
          start.setDate(now.getDate() - 15);
          return d >= start;
        }

        case 'this_month':
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();

        case 'this_year':
          return d.getFullYear() === now.getFullYear();

        default:
          return true;
      }
    });
  }, [summaries, dateFilter]);

  // ✅ Calculate totals
  const totals = filteredSummaries.reduce(
    (acc, b) => {
      acc.doctors += b.doctors;
      acc.patients += b.patients;
      acc.appointmentsMonth += b.appointmentsMonth;
      return acc;
    },
    { doctors: 0, patients: 0, appointmentsMonth: 0 }
  );

  return (
    <>
      {/* ✅ Date Filter Dropdown */}
      <div className="d-flex justify-content-end mb-3">
        <Dropdown>
          <DropdownToggle
            className="btn btn-sm btn-outline-white d-flex align-items-center"
            id="dateFilter"
          >
            <IconifyIcon icon="mdi:calendar-clock" width={18} className="me-1" />
            {dateFilter === 'all'
              ? 'Filter by Date'
              : dateFilter.replace('_', ' ').toUpperCase()}
          </DropdownToggle>
          <DropdownMenu>
            {[
              { label: 'Today', value: 'today' },
              { label: 'This Week', value: 'this_week' },
              { label: 'Last 15 Days', value: '15_days' },
              { label: 'This Month', value: 'this_month' },
              { label: 'This Year', value: 'this_year' },
            ].map((f) => (
              <DropdownItem
                key={f.value}
                onClick={() => setDateFilter(f.value)}
                active={dateFilter === f.value}
              >
                {f.label}
              </DropdownItem>
            ))}
            {dateFilter !== 'all' && (
              <DropdownItem
                className="text-danger"
                onClick={() => setDateFilter('all')}
              >
                Clear Date Filter
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      </div>

      <Row className="g-3">
        {/* ✅ Totals Card */}
        <Col xl={4}>
          <Card className="h-100" style={{ cursor: 'pointer' }}>
            <CardBody>
              <h5 className="mb-3">Total (Toutes les branches)</h5>
              <Row className="text-center g-3">
                <Col>
                  <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered mb-2">
                    <IconifyIcon icon="mdi:doctor" width={24} height={24} className="text-primary" />
                  </div>
                  <div className="fw-semibold fs-4">{num(totals.doctors)}</div>
                  <div className="text-muted">Thérapeutes</div>
                </Col>
                <Col>
                  <div className="avatar-md bg-success bg-opacity-10 rounded flex-centered mb-2">
                    <IconifyIcon
                      icon="mdi:account-multiple"
                      width={24}
                      height={24}
                      className="text-success"
                    />
                  </div>
                  <div className="fw-semibold fs-4">{num(totals.patients)}</div>
                  <div className="text-muted">Patients</div>
                </Col>
                <Col>
                  <div className="avatar-md bg-warning bg-opacity-10 rounded flex-centered mb-2">
                    <IconifyIcon
                      icon="mdi:calendar-check"
                      width={24}
                      height={24}
                      className="text-warning"
                    />
                  </div>
                  <div className="fw-semibold fs-4">{num(totals.appointmentsMonth)}</div>
                  <div className="text-muted">Rendez-vous (mois)</div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>

        {/* ✅ Branch Cards */}
        {filteredSummaries.map((b) => (
          <Col xl={4} key={b.branchId}>
            <Card className="h-100" style={{ cursor: 'pointer' }}>
              <CardBody>
                <h5 className="mb-3">{b.branchName}</h5>
                <Row className="text-center g-3">
                  <Col>
                    <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered mb-2">
                      <IconifyIcon icon="mdi:doctor" width={24} height={24} className="text-primary" />
                    </div>
                    <div className="fw-semibold fs-4">{num(b.doctors)}</div>
                    <div className="text-muted">Thérapeutes</div>
                  </Col>
                  <Col>
                    <div className="avatar-md bg-success bg-opacity-10 rounded flex-centered mb-2">
                      <IconifyIcon
                        icon="mdi:account-multiple"
                        width={24}
                        height={24}
                        className="text-success"
                      />
                    </div>
                    <div className="fw-semibold fs-4">{num(b.patients)}</div>
                    <div className="text-muted">Patients</div>
                  </Col>
                  <Col>
                    <div className="avatar-md bg-warning bg-opacity-10 rounded flex-centered mb-2">
                      <IconifyIcon
                        icon="mdi:calendar-check"
                        width={24}
                        height={24}
                        className="text-warning"
                      />
                    </div>
                    <div className="fw-semibold fs-4">{num(b.appointmentsMonth)}</div>
                    <div className="text-muted">Rendez-vous (mois)</div>
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </Col>
        ))}
      </Row>
    </>
  );
};

export default BranchSummary;
