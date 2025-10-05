// PatientDetailsPage.tsx
'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import type { PatientType } from '@/types/data';
import { getPatientById } from '@/helpers/patient';
import PatientDetails from './components/PatientDetails';

// 👉 Age calculation helper
const calculateAge = (birthdate: string): number => {
  if (!birthdate) return 0;
  const today = new Date();
  const dob = new Date(birthdate);
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<PatientType | null>(null);
  const [loading, setLoading] = useState(true);

  // Default mock data
  const defaultWeeklyInquiry = [
    { week: 'Week 1', inquiries: 5 },
    { week: 'Week 2', inquiries: 8 },
    { week: 'Week 3', inquiries: 3 },
  ];

  const defaultTransactionStats = [
    {
      title: 'Total Appointments',
      count: 12,
      progress: 75,
      icon: 'ri:calendar-line',
      variant: 'primary',
    },
    {
      title: 'Completed Visits',
      count: 9,
      progress: 60,
      icon: 'ri:check-line',
      variant: 'success',
    },
    { title: 'Pending Visits', count: 3, progress: 25, icon: 'ri:time-line', variant: 'warning' },
  ];

  const defaultTransactionHistory = [
    { date: '2025-08-01', type: 'Consultation', amount: 120, status: 'Completed' },
    { date: '2025-08-05', type: 'Lab Test', amount: 80, status: 'Pending' },
    { date: '2025-08-07', type: 'Prescription', amount: 50, status: 'Completed' },
  ];

  const defaultFeedbacks = [
    {
      name: 'John Doe',
      userName: 'jdoe',
      country: 'USA',
      day: 2,
      description: 'Very satisfied with the service.',
      rating: 5,
    },
    {
      name: 'Jane Smith',
      userName: 'jsmith',
      country: 'UK',
      day: 5,
      description: 'Helpful and attentive.',
      rating: 4,
    },
  ];

  const defaultFiles = [
    { name: 'Lab Report.pdf', size: 2, icon: 'ri:file-pdf-line', variant: 'danger' },
    { name: 'Prescription.docx', size: 1.2, icon: 'ri:file-word-line', variant: 'primary' },
    { name: 'X-Ray.png', size: 3.5, icon: 'ri:file-image-line', variant: 'success' },
  ];

  useEffect(() => {
    if (!id) return;
    const transformPatientPayload = (data: any) => ({
      ...data,
      phones: data.phones.filter((p: string) => p.trim() !== ''),
      therapistId: data.therapistId ? Number(data.therapistId) : null,
    });

    const fetchPatient = async () => {
      setLoading(true);
      try {
        const rawPatient = await getPatientById(id);
        if (!rawPatient) throw new Error('Failed to fetch patient');

        // 🔥 Transform raw API response → PatientType
        const transformedPatient: PatientType = {
          id: rawPatient.id ?? null,
          firstname: rawPatient.firstname || '',
          lastname: rawPatient.lastname || '',
          middlename: rawPatient.middlename || '',
          ssin: rawPatient.ssin || '',
          legalgender: rawPatient.legalgender || '',
          language: rawPatient.language || '',
          birthdate: rawPatient.birthdate || null,
          primarypatientrecordid: rawPatient.primarypatientrecordid || '',
          note: rawPatient.note || '',
          status: rawPatient.status || 'INACTIVE',
          mutualitynumber: rawPatient.mutualitynumber || '',
          mutualityregistrationnumber: rawPatient.mutualityregistrationnumber || '',
          emails: rawPatient.emails || '',
          country: rawPatient.country || '',
          city: rawPatient.city || '',
          street: rawPatient.street || '',
          zipcode: rawPatient.zipcode || '',
          number: rawPatient.number || '',
          phones: Array.isArray(rawPatient.phones) ? rawPatient.phones : [],
          // created_at: rawPatient.created_at || null,
          // is_delete: rawPatient.is_delete || false,
          // deleted_at: rawPatient.deleted_at || null,

          // 🔥 Therapist mapping
          therapistId: rawPatient.therapistId ?? null,
          therapist: rawPatient.therapist
            ? {
                therapistId: rawPatient.therapist.therapistId ?? null,
                firstName: rawPatient.therapist.firstName || '',
                lastName: rawPatient.therapist.lastName || '',
                fullName: `${rawPatient.therapist.firstName || ''} ${
                  rawPatient.therapist.lastName || ''
                }`.trim(),
                photo: rawPatient.therapist.photo || null,
                imageUrl: rawPatient.therapist.imageUrl || rawPatient.therapist.photo || null,
                contactEmail: rawPatient.therapist.contactEmail || '',
                contactPhone: rawPatient.therapist.contactPhone || '',
                aboutMe: rawPatient.therapist.aboutMe || null,
                degreesTraining:
                  rawPatient.therapist.degreesTraining || rawPatient.therapist.degreesAndTraining,
                inamiNumber: rawPatient.therapist.inamiNumber || '',
                paymentMethods: rawPatient.therapist.paymentMethods || null,
                faq: rawPatient.therapist.faq || null,
                departmentId: rawPatient.therapist.departmentId || null,

                availability: Array.isArray(rawPatient.therapist.availability)
                  ? rawPatient.therapist.availability
                  : [],
                isDelete: rawPatient.therapist.isDelete || false,
                deletedAt: rawPatient.therapist.deletedAt || null,
              }
            : null,
        };

        setData(transformedPatient);
      } catch (error) {
        console.error(error);
        alert('Failed to load patient details');
        router.push('/patients/patient-list');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, router]);

  if (loading) return <p>Loading...</p>;
  if (!data) return <p>No patient found.</p>;

  return (
    <>
      <PageTitle subName="Patient" title="Aperçu des patients" />
      <PatientDetails
        id={data.id}
        name={`${data.firstname} ${data.lastname}`}
        // 👇 Now showing Age along with DOB + Gender
        birthdate={
          data.birthdate
            ? `${data.birthdate || 'N\A'} | ${data.legalgender || 'N\A'} | ${calculateAge(data.birthdate || 'N\A')} yrs`
            : ''
        }
        email={data.emails}
        phones={
          Array.isArray(data.phones)
            ? (data.phones.filter(Boolean) as string[])
            : data.phones
              ? [data.phones]
              : []
        }
        address={data.street}
        city={data.city}
        country={data.country}
        zipcode={data.zipcode} // ✅ new
        language={data.language} // ✅ new
        ssin={data.ssin} // ✅ new
        mutualitynumber={data.mutualitynumber} // ✅ new
        mutualityregistrationnumber={data.mutualityregistrationnumber} // ✅ new
        status={data.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
        note={data.note}
        weeklyInquiry={defaultWeeklyInquiry}
        transactionStats={defaultTransactionStats}
        transactionHistory={defaultTransactionHistory}
        feedbacks={defaultFeedbacks}
        files={defaultFiles}
        therapist={data.therapist || null}
      />
    </>
  );
};

export default PatientDetailsPage;
