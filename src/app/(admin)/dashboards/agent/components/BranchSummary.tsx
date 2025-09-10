'use client';

import { Card, CardBody, Row, Col, Button } from 'react-bootstrap';
import IconifyIcon from '@/components/wrappers/IconifyIcon';

export type BranchSummaryItem = {
  branchId: number | string;
  branchName: string;
  doctors: number;
  patients: number;
  appointmentsMonth: number;
  revenueMonth: number; // currency handling left to consumer
};

const num = (n: number) => new Intl.NumberFormat().format(n);

const BranchSummary = ({
  summaries,
  onBranchClick,
}: {
  summaries: BranchSummaryItem[];
  onBranchClick?: (branch: BranchSummaryItem) => void;
}) => {
  return (
    <Row className="g-3">
      {summaries.map((b) => (
        <Col xl={4} key={b.branchId}>
          <Card className="h-100">
            <CardBody>
              <h5 className="mb-3">{b.branchName}</h5>
              <Row className="text-center g-3">
                <Col>
                  <div className="avatar-md bg-primary bg-opacity-10 rounded flex-centered mb-2">
                    <IconifyIcon
                      icon="mdi:doctor"
                      width={24}
                      height={24}
                      className="text-primary"
                    />
                  </div>
                  <div className="fw-semibold fs-4">{num(b.doctors)}</div>
                  <div className="text-muted">Doctors</div>
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
                  <div className="text-muted">Appts (mo)</div>
                </Col>
              </Row>
            </CardBody>
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default BranchSummary;
