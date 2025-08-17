'use client';

import { Card, CardBody, ProgressBar, Table } from 'react-bootstrap';

const DoctorPerformance = ({
  activeCount,
  onLeaveCount,
  appointmentsPerDoctor,
  availabilityUtilizationPct,
}: {
  activeCount: number;
  onLeaveCount: number;
  appointmentsPerDoctor: { doctor: string; count: number }[];
  availabilityUtilizationPct: number;
}) => {
  return (
    <Card className="h-100">
      <CardBody>
        <h5 className="mb-3">Doctor Performance</h5>
        <div className="d-flex justify-content-between mb-3">
          <div>
            <span className="text-muted">Active:</span> <strong>{activeCount}</strong>
          </div>
          <div>
            <span className="text-muted">On leave:</span> <strong>{onLeaveCount}</strong>
          </div>
        </div>

        <div className="mb-2">Availability Utilization</div>
        <ProgressBar
          now={availabilityUtilizationPct}
          label={`${availabilityUtilizationPct}%`}
          className="mb-3"
        />

        <Table size="sm" hover responsive className="mb-0">
          <thead>
            <tr>
              <th>Doctor</th>
              <th>Appointments</th>
            </tr>
          </thead>
          <tbody>
            {appointmentsPerDoctor.map((r, i) => (
              <tr key={i}>
                <td>{r.doctor}</td>
                <td>{r.count}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default DoctorPerformance;
