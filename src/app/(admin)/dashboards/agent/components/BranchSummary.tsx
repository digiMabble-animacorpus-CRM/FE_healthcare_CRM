'use client';

import React from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, CardBody, CardHeader, CardTitle, Col, Container, Row } from 'react-bootstrap';

export type BranchSummaryItem = {
  branchId: number | string;
  branchName: string;
  doctors: number;
  patients: number;
  appointmentsMonth: number;
  revenueMonth: number;
};

export type FilterOption = 'thisWeek' | 'lastWeek' | 'month';

type BranchSummaryProps = {
  summaries: BranchSummaryItem[];
  filters: Record<string | number, FilterOption>;
  onFilterChange: (branchId: string | number, filter: FilterOption) => void;
};

const num = (n: number) => new Intl.NumberFormat().format(n);

// Utility to chunk summary array into rows of 2 cards
function chunk<T>(arr: T[], size = 2): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

const BranchSummary: React.FC<BranchSummaryProps> = ({ summaries, filters, onFilterChange }) => {
  if (!summaries || summaries.length === 0) {
    return <div>No branch summaries available.</div>;
  }

  const getFilteredAppointments = (branch: BranchSummaryItem, filter: FilterOption) => {
    switch (filter) {
      case 'thisWeek':
      case 'lastWeek':
        return Math.floor(branch.appointmentsMonth / 4);
      case 'month':
      default:
        return branch.appointmentsMonth;
    }
  };

  // Chunk branch summaries into rows of 2
  const summaryRows = chunk(summaries, 2);

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle as="h4" className="mb-0">Points de vue des Branche</CardTitle>
      </CardHeader>
      <CardBody>
        {summaryRows.map((row, rowIdx) => (
          <Row className="g-3 mb-2" key={rowIdx}>
            {row.map((b) => {
              const currentFilter = filters[b.branchId] || 'month';
              const filteredAppointments = getFilteredAppointments(b, currentFilter);

              return (
                <Col md={6} key={b.branchId}>
                  <Card className="h-100" style={{ cursor: 'pointer' }}>
                    <CardBody>
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{b.branchName}</h5>
                        <div role="group" className="d-flex gap-2">
                          {(['thisWeek', 'lastWeek', 'month'] as FilterOption[]).map((option) => (
                            <button
                              key={option}
                              type="button"
                              className={`btn btn-sm ${currentFilter === option ? 'btn-primary' : 'btn-outline-primary'} rounded-pill`}
                              style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
                              onClick={() => onFilterChange(b.branchId, option)}
                            >
                              {option === 'thisWeek' && 'This Week'}
                              {option === 'lastWeek' && 'Last Week'}
                              {option === 'month' && 'Last Month'}
                            </button>
                          ))}
                        </div>
                      </div>
                      <Row className="text-center g-3">
                        <Col>
                          <div className="d-flex flex-column align-items-center">
                            <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered mb-2">
                              <IconifyIcon icon="mdi:doctor" width={24} height={24} className="text-primary" />
                            </div>
                            <div className="fw-semibold fs-4">{num(b.doctors)}</div>
                            <div className="text-muted">Thérapeutes</div>
                          </div>
                        </Col>
                        <Col>
                          <div className="d-flex flex-column align-items-center">
                            <div className="avatar-md bg-success bg-opacity-10 rounded flex-centered mb-2">
                              <IconifyIcon icon="mdi:account-multiple" width={24} height={24} className="text-success" />
                            </div>
                            <div className="fw-semibold fs-4">{num(b.patients)}</div>
                            <div className="text-muted">Patients</div>
                          </div>
                        </Col>
                        <Col>
                          <div className="d-flex flex-column align-items-center">
                            <div className="avatar-md bg-warning bg-opacity-10 rounded flex-centered mb-2">
                              <IconifyIcon icon="mdi:calendar-check" width={24} height={24} className="text-warning" />
                            </div>
                            <div className="fw-semibold fs-4">{num(filteredAppointments)}</div>
                            <div className="text-muted">Rendez-vous</div>
                          </div>
                        </Col>
                      </Row>
                    </CardBody>
                  </Card>
                </Col>
              );
            })}
          </Row>
        ))}
      </CardBody>
    </Card>
  );
};

export default BranchSummary;
