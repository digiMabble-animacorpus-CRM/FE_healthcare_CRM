'use client';

import { Card, CardBody, Badge } from 'react-bootstrap';

const DoctorProfile = ({
  name,
  specialization,
  branch,
  todayStatus,
}: {
  name: string;
  specialization: string;
  branch: string;
  todayStatus: 'Available' | 'On-Leave' | string;
}) => {
  const statusVariant = todayStatus === 'Available' ? 'success' : 'secondary';
  return (
    <Card className="mb-3">
      <CardBody>
        <h5 className="mb-1">{name}</h5>
        <div className="text-muted">{specialization}</div>
        <div className="mt-2">
          Branch: <strong>{branch}</strong>
        </div>
        <div className="mt-2">
          Status today: <Badge bg={statusVariant}>{todayStatus}</Badge>
        </div>
      </CardBody>
    </Card>
  );
};

export default DoctorProfile;
