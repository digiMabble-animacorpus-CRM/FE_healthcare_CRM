'use client';

import { Card, CardBody, Table } from 'react-bootstrap';

const TodayAppointments = ({
  items,
}: {
  items: { id: string; time: string; patient: string; reason: string; room?: string }[];
}) => {
  return (
    <Card className="mb-3">
      <CardBody>
        <h5 className="mb-3">Today’s Appointments</h5>
        <Table hover size="sm" responsive className="mb-0">
          <thead>
            <tr>
              <th>Time</th>
              <th>Patient</th>
              <th>Reason</th>
              <th>Room</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>{a.time}</td>
                <td>{a.patient}</td>
                <td>{a.reason}</td>
                <td>{a.room ?? '-'}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default TodayAppointments;
