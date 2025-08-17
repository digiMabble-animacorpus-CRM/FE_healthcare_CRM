'use client';

import { Card, CardBody, Row, Col, Table } from 'react-bootstrap';

const PatientRecords = ({
  recent,
  assigned,
}: {
  recent: { id: string; name: string; lastSeen: string }[];
  assigned: { id: string; name: string; since: string }[];
}) => {
  return (
    <Card className="mb-3">
      <CardBody>
        <Row>
          <Col md={6} className="mb-3">
            <h5 className="mb-2">Recently Seen</h5>
            <Table size="sm" bordered responsive className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Last Seen</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.lastSeen}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
          <Col md={6} className="mb-3">
            <h5 className="mb-2">Assigned Patients</h5>
            <Table size="sm" bordered responsive className="mb-0">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Since</th>
                </tr>
              </thead>
              <tbody>
                {assigned.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.since}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default PatientRecords;
