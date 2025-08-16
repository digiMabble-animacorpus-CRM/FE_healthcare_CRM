'use client';

import avatar2 from '@/assets/images/users/avatar-2.jpg';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import Image from 'next/image';
import { Button, Card, CardBody, Col, Row } from 'react-bootstrap';
import type { PatientType } from '@/types/data';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const PatientDetails = () => {
  const [patient, setPatient] = useState<PatientType | null>(null);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('selectedPatient');
    if (data) {
      // Backend wraps data inside "data" field
      const parsed = JSON.parse(data);
      setPatient(parsed.data || parsed); // fallback if not wrapped
    } else {
      router.push('/patients/patient-list');
    }
  }, []);

  const handleEditClick = (id: string) => {
    router.push(`/patients/edit-enquiry/${id}`);
  };

  if (!patient) return null;

  return (
    <Card>
      <CardBody>
        <div className="d-flex flex-wrap align-items-start justify-content-between gap-3 mt-3">
          <div className="d-flex align-items-center gap-3">
            <Image
              src={avatar2}
              alt="avatar"
              priority
              className="rounded-circle avatar-xl img-thumbnail"
            />
            <div>
              <h3 className="fw-semibold mb-1">
                {patient.firstname} {patient.lastname}
              </h3>
              <p className="link-primary fw-medium fs-14">
                {patient.birthdate} {patient.legalgender ? `| ${patient.legalgender}` : ''}
              </p>
            </div>
          </div>

          <div className="d-flex gap-1">
            <Button
              variant="dark"
              className="avatar-sm d-flex align-items-center justify-content-center fs-20"
              onClick={() => handleEditClick(patient?.id)}
            >
              <span>
                {' '}
                <IconifyIcon icon="ri:edit-fill" />
              </span>
            </Button>
          </div>
        </div>

        <Row className="my-4">
          <Col lg={4}>
            <p className="text-dark fw-semibold fs-16 mb-1">Email Address :</p>
            <p className="mb-0">{patient.emails || '-'}</p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Phone Number :</p>
            <p className="mb-0">
              {Array.isArray(patient.phones) ? patient.phones.join(', ') : patient.phones || '-'}
            </p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">City :</p>
            <p className="mb-0">{patient.city || '-'}</p>
          </Col>
          <Col lg={2}>
            <p className="text-dark fw-semibold fs-16 mb-1">Status :</p>
            <span
              className={`badge bg-${patient.status === 'ACTIVE' ? 'success' : 'danger'} text-white fs-12 px-2 py-1`}
            >
              {patient.status || '-'}
            </span>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={9}>
            <p className="text-dark fw-semibold fs-16 mb-1">Address :</p>
            <p className="mb-0">
              {[patient.street, patient.city, patient.country].filter(Boolean).join(' ') || '-'}
            </p>
          </Col>
          <Col lg={3}>
            <p className="text-dark fw-semibold fs-16 mb-1">Mode of Register :</p>
            <p className="mb-0">Online</p>
          </Col>
        </Row>

        <Row className="my-4">
          <Col lg={12}>
            <p className="text-dark fw-semibold fs-16 mb-1">Description :</p>
            <p className="mb-0">{patient.note || '-'}</p>
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

export default PatientDetails;
