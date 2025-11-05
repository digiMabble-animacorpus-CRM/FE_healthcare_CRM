'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getPatientById } from '@/helpers/patient';
import type { PatientType } from '@/types/data';
import { Button, Card, Spinner } from 'react-bootstrap';
import dayjs from 'dayjs';

// ✅ Helper for age calculation
const calculateAge = (birthdate: { year: number; month: number; day: number }) => {
  if (!birthdate || !birthdate.year) return null;
  const now = dayjs();
  const birth = dayjs(`${birthdate.year}-${birthdate.month}-${birthdate.day > 0 ? birthdate.day : 1}`);
  return now.diff(birth, 'year');
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<PatientType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      setLoading(true);
      try {
        const data = await getPatientById(id);
        if (!data) throw new Error('Failed to fetch patient');
        setPatient(data);
      } catch (err) {
        console.error('❌ Error fetching patient:', err);
        router.push('/patients/patient-list');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, router]);

  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading patient details...</p>
      </div>
    );

  if (!patient)
    return (
      <div className="text-center py-5 text-muted">
        <p>No patient data found.</p>
      </div>
    );

  // ✅ Extract info safely
  const email = patient.contactInfos?.find((c) => c.type === 'EMAIL')?.value || 'N/A';
  const phone = patient.contactInfos?.find((c) => c.type === 'PHONE')?.value || 'N/A';
  const address = patient.address || {};

  return (
    <>
      <Button className='mb-3' variant="text" size="sm" onClick={() => router.push('/patients/patient-list')}>
        ← Back to List
      </Button>

      <PageTitle subName="Patient" title="Détails du patient" />

      <Card className="shadow-sm border-0 mt-3">
        <Card.Body>
          <h4 className="mb-3">
            {patient.firstName} {patient.lastName}
          </h4>

          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>External ID:</strong> <br />
              <span>{patient.externalId || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>SSIN:</strong> <br />
              <span>{patient.ssin || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Gender:</strong> <br />
              <span>{patient.legalGender || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Language:</strong> <br />
              <span>{patient.language || 'N/A'}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Birthdate:</strong> <br />
              <span>
                {patient.birthdate
                  ? `${patient.birthdate.day}/${patient.birthdate.month}/${patient.birthdate.year}`
                  : 'N/A'}
                {patient.birthdate && (
                  <> ({calculateAge(patient.birthdate)} yrs)</>
                )}
              </span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Status:</strong> <br />
              <span
                className={`badge bg-${patient.status === 'ACTIVE' ? 'success' : 'secondary'
                  } text-white`}
              >
                {patient.status || 'N/A'}
              </span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Email:</strong> <br />
              <span>{email}</span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Phone:</strong> <br />
              <span>{phone}</span>
            </div>

            <div className="col-md-12 mb-3">
              <strong>Address:</strong> <br />
              {address.street ? (
                <span>
                  {address.street} {address.number && `, ${address.number}`}
                  <br />
                  {address.zipCode && `${address.zipCode} `}
                  {address.city && `${address.city}, `}
                  {address.country || ''}
                </span>
              ) : (
                <span>N/A</span>
              )}
            </div>

            <div className="col-md-12 mb-3">
              <strong>Note:</strong> <br />
              <span>{patient.note || 'N/A'}</span>
            </div>

            <div className="col-md-12 mb-3">
              <strong>Permissions:</strong>
              <ul className="mt-2">
                {patient.permissions?.organizationPermissions?.length ? (
                  patient.permissions.organizationPermissions.map((perm, i) => (
                    <li key={i}>{perm}</li>
                  ))
                ) : (
                  <li>No organization permissions</li>
                )}
              </ul>
            </div>

            {patient.permissions?.individualPermissions?.length ? (
              <div className="col-md-12 mb-3">
                <strong>Individual Permissions:</strong>
                <ul className="mt-2">
                  {patient.permissions.individualPermissions.map((perm, i) => (
                    <li key={i}>
                      {perm.hpId}: {perm.permissions?.join(', ')}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {patient.mergedFromIds?.length ? (
              <div className="col-md-6 mb-3">
                <strong>Merged From IDs:</strong> <br />
                <span>{patient.mergedFromIds.join(', ')}</span>
              </div>
            ) : null}

            {patient.mergedToId && (
              <div className="col-md-6 mb-3">
                <strong>Merged To ID:</strong> <br />
                <span>{patient.mergedToId}</span>
              </div>
            )}
          </div>
        </Card.Body>
      </Card>
    </>
  );
};

export default PatientDetailsPage;
