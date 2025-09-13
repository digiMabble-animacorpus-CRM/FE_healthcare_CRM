'use client';

import React, { useEffect, useState } from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Card, CardBody, Col, Row } from 'react-bootstrap';
import { getBranchSummary } from '@/helpers/dashboard';

export type BranchSummaryItem = {
  branchId: number | string;
  branchName: string;
  doctors: number;
  patients: number;
  appointmentsMonth: number;
  revenueMonth: number; // currency handling left to consumer
};

const num = (n: number) => new Intl.NumberFormat().format(n);

const BranchSummary = () => {
  const [summaries, setSummaries] = useState<BranchSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await getBranchSummary();
        if (response && response.summaries) {
          const mappedData: BranchSummaryItem[] = response.summaries.map((item: any) => ({
            branchId: item.branch_id,
            branchName: item.branch_name,
            doctors: Number(item.therapists_count)?? 0,
            patients: item.patients_count,
            appointmentsMonth: item.appointments_count,
            revenueMonth: 0,
          }));
        setSummaries(mappedData);
}
 else {
          setSummaries([]);
        }
      } catch (err) {
        setError('Failed to load branch summaries.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading branch summaries...</div>;
  if (error) return <div>{error}</div>;
  if (summaries.length === 0) return <div>No branch summaries available.</div>;

  return (
    <Row className="g-3">
      {summaries.map((b) => (
        <Col xl={4} key={b.branchId}>
          <Card className="h-100" style={{ cursor: 'pointer' }}>
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
  );
};

export default BranchSummary;
