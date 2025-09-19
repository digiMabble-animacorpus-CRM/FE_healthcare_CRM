// /appointments/components/BookAppointmentForm/index.tsx
'use client';

import { API_BASE_PATH } from '@/context/constants';
import type { PatientType, AppointmentType, AppointmentFormValues } from '../types/appointment';
import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, CardBody, CardHeader, CardTitle, Spinner } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import AppointmentFields from './AppointmentFields';

const schema = yup.object({
  branchId: yup.number().required('Select branch'),
  departmentId: yup.number().required('Select department'),
  specializationId: yup.number().required('Select specialization'),
  therapistId: yup.number().required('Select therapist'),
  date: yup.string().required('Select date'),
  time: yup.string().required('Select time'),
  purposeOfVisit: yup.string().required('Enter purpose of visit'),
  description: yup.string().optional(),
});

interface Props {
  onSubmitHandler?: (data: AppointmentFormValues) => void;
  mode: 'create' | 'edit';
  appointmentId?: number;
  patientId: string;
  createdById: string;
  modifiedById?: string;
  selectedCustomer?: PatientType;
  appointmentData?: AppointmentType;
}

const BookAppointmentForm = ({
  onSubmitHandler,
  mode,
  appointmentId,
  patientId,
  createdById,
  modifiedById,
  selectedCustomer,
  appointmentData,
}: Props) => {
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const getDefaultValues = () => {
    if (mode === 'edit' && appointmentData) {
      const startTime = appointmentData.startTime 
        ? new Date(appointmentData.startTime).toTimeString().slice(0, 5)
        : '';
      
      const date = appointmentData.startTime 
        ? new Date(appointmentData.startTime).toISOString().split('T')[0]
        : '';
      
      return {
        branchId: appointmentData.branch?.branch_id || 0,
        departmentId: appointmentData.department?.id || 0,
        specializationId: appointmentData.specialization?.specialization_id || 0,
        therapistId: appointmentData.therapist?.therapistId || 0,
        date: date,
        time: startTime,
        purposeOfVisit: appointmentData.purposeOfVisit || '',
        description: appointmentData.description || '',
      };
    }
    
    return {
      branchId: 0,
      departmentId: 0,
      specializationId: 0,
      therapistId: 0,
      date: '',
      time: '',
      purposeOfVisit: '',
      description: '',
    };
  };

  const methods = useForm<AppointmentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: getDefaultValues(),
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    reset(getDefaultValues());
  }, [appointmentData, reset]);

  const onSubmit = async (data: AppointmentFormValues) => {
    const payload = {
      patientId,
      branchId: data.branchId,
      departmentId: data.departmentId,
      specializationId: data.specializationId,
      therapistId: data.therapistId,
      date: data.date,
      startTime: toISODateTime(data.date, data.time),
      endTime: toISODateTime(data.date, getEndTime(data.time)),
      status: mode === 'create' ? 'pending' : undefined,
      purposeOfVisit: data.purposeOfVisit,
      description: data.description || '',
      ...(mode === 'edit' ? { modifiedById } : { createdById }),
    };

    try {
      setSaving(true);
      const url = `${API_BASE_PATH}/appointments${mode === 'edit' && appointmentId ? `/${appointmentId}` : ''}`;
      const method = mode === 'edit' ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save appointment');
      
      const responseData = await res.json();
      console.log(responseData, "response")
      reset();
      router.push('/appointments/appointment-list');
      onSubmitHandler?.(data);
    } catch (error) {
      console.error('❌ API Error:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-4">
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h6">{mode === 'edit' ? 'Edit Appointment' : 'Prendre rendez-vous'}</CardTitle>
            {selectedCustomer && (
              <small className="text-muted">
                {mode === 'edit' ? 'Editing appointment for: ' : 'Booking for: '}
                <strong>
                  {selectedCustomer.firstname} {selectedCustomer.lastname}
                </strong>
              </small>
            )}
          </CardHeader>
          <CardBody>
            <AppointmentFields mode={mode} />

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => router.push('/appointments/appointment-list')}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={saving}>
                {saving ? (
                  <Spinner animation="border" size="sm" />
                ) : mode === 'edit' ? (
                  'Update Appointment'
                ) : (
                  'Prendre rendez-vous'
                )}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

function getEndTime(startTime: string) {
  const [hour, minute] = startTime.split(':').map(Number);
  const date = new Date();
  date.setHours(hour, minute);
  date.setMinutes(date.getMinutes() + 30);
  return date.toTimeString().slice(0, 5);
}

function toISODateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

export default BookAppointmentForm;