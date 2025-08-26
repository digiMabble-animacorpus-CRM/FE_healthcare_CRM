import { Card, CardBody, CardTitle } from 'react-bootstrap';

type Props = { notes?: string };

const PatientNotes = ({ notes }: Props) => {
  return (
    <div className="mt-4">
      <CardTitle as={'h4'} className="mb-3">
        Notes:
      </CardTitle>
      <Card className="bg-light-subtle mb-0">
        <CardBody>
          <p className="mb-0">{notes || 'No notes available'}</p>
        </CardBody>
      </Card>
    </div>
  );
};

export default PatientNotes;
