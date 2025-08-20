'use client';

import { Card, CardBody, Table } from 'react-bootstrap';

type Day = { time: string; patient: string }[];
type Week = {
  Mon: Day;
  Tue: Day;
  Wed: Day;
  Thu: Day;
  Fri: Day;
  Sat: Day;
  Sun: Day;
};

const WeeklySchedule = ({ week }: { week: Week }) => {
  const days = Object.keys(week) as (keyof Week)[];
  return (
    <Card className="mb-3">
      <CardBody>
        <h5 className="mb-3">Weekly Schedule</h5>
        <Table bordered size="sm" responsive>
          <thead>
            <tr>
              {days.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {days.map((d) => (
                <td key={d}>
                  {week[d].length === 0 ? (
                    <div className="text-muted">No appointments</div>
                  ) : (
                    week[d].map((slot, i) => (
                      <div key={i} className="mb-2">
                        <div className="fw-semibold">{slot.time}</div>
                        <div className="text-muted">{slot.patient}</div>
                      </div>
                    ))
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </Table>
      </CardBody>
    </Card>
  );
};

export default WeeklySchedule;
