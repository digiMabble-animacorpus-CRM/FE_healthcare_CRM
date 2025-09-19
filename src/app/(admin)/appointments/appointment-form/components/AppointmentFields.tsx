// /appointments/components/AppointmentFields/index.tsx
'use client';

import { API_BASE_PATH } from '@/context/constants';
import type { BranchType, DepartmentType, SpecializationType, TherapistType, AvailabilityType } from '../types/appointment';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Controller, useFormContext } from 'react-hook-form';

interface AppointmentFieldsProps {
  mode?: 'create' | 'edit';
}

const AppointmentFields = ({ mode = 'create' }: AppointmentFieldsProps) => {
  const {
    register,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useFormContext();

  const [branches, setBranches] = useState<BranchType[]>([]);
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [specializations, setSpecializations] = useState<SpecializationType[]>([]);
  const [therapists, setTherapists] = useState<TherapistType[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<TherapistType | null>(null);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const branchId = watch('branchId');
  const departmentId = watch('departmentId');
  const specializationId = watch('specializationId');
  const selectedDate = watch('date');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const safeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  useEffect(() => {
    async function loadBranches() {
      try {
        const res = await fetch(`${API_BASE_PATH}/branches`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setBranches(safeArray(data));
      } catch {
        setBranches([]);
      }
    }
    if (token) loadBranches();
  }, [token]);

  useEffect(() => {
    if (!branchId) {
      setDepartments([]);
      setSpecializations([]);
      setTherapists([]);
      setSelectedTherapist(null);
      setValue('departmentId', '');
      setValue('specializationId', '');
      setValue('therapistId', '');
      setValue('date', '');
      setValue('time', '');
      return;
    }
    async function loadDepartments() {
      try {
        const res = await fetch(`${API_BASE_PATH}/departments?branchId=${branchId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setDepartments(safeArray(data));
      } catch {
        setDepartments([]);
      }
    }
    loadDepartments();
  }, [branchId]);

  useEffect(() => {
    if (!branchId || !departmentId) {
      setSpecializations([]);
      setTherapists([]);
      setSelectedTherapist(null);
      setValue('specializationId', '');
      setValue('therapistId', '');
      setValue('date', '');
      setValue('time', '');
      return;
    }
    async function loadSpecializations() {
      try {
        const res = await fetch(`${API_BASE_PATH}/specializations`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setSpecializations(safeArray(data));
      } catch {
        setSpecializations([]);
      }
    }
    loadSpecializations();
  }, [branchId, departmentId]);

  useEffect(() => {
    if (!branchId || !departmentId || !specializationId) {
      setTherapists([]);
      setSelectedTherapist(null);
      setValue('therapistId', '');
      setValue('date', '');
      setValue('time', '');
      return;
    }
    async function loadTherapists() {
      try {
        const res = await fetch(`${API_BASE_PATH}/therapists`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setTherapists(safeArray(data));
      } catch {
        setTherapists([]);
      }
    }
    loadTherapists();
  }, [branchId, departmentId, specializationId]);

  useEffect(() => {
    if (mode === 'edit' && watch('therapistId')) {
      const therapistId = watch('therapistId');
      const therapist = therapists.find((t) => t.therapistId === therapistId) || null;
      setSelectedTherapist(therapist);
    }
  }, [mode, therapists, watch]);

  const handleTherapistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const therapistId = Number(e.target.value);
    const therapist = therapists.find((t) => t.therapistId === therapistId) || null;
    setSelectedTherapist(therapist);
    setValue('therapistId', therapistId);
    setValue('date', '');
    setValue('time', '');
    setTimeSlots([]);
  };

  useEffect(() => {
    if (!selectedTherapist || !selectedDate) return;
    const dayName = dayjs(selectedDate).format('dddd');
    const dayAvailability = selectedTherapist.availability?.find((a) => a.day === dayName);
    if (!dayAvailability) {
      setTimeSlots([]);
      return;
    }

    const baseDate = dayjs(selectedDate);
    let current = baseDate
      .hour(Number(dayAvailability.startTime.split(':')[0]))
      .minute(Number(dayAvailability.startTime.split(':')[1]))
      .second(0);

    const end = baseDate
      .hour(Number(dayAvailability.endTime.split(':')[0]))
      .minute(Number(dayAvailability.endTime.split(':')[1]))
      .second(0);

    const now = dayjs();
    const slots: string[] = [];
    while (current.isBefore(end)) {
      const slotStart = current.format('HH:mm');
      const slotEnd = current.add(30, 'minute').format('HH:mm');
      if (baseDate.isAfter(now, 'day') || current.isAfter(now)) {
        slots.push(`${slotStart} - ${slotEnd}`);
      }
      current = current.add(30, 'minute');
    }
    setTimeSlots(slots);
  }, [selectedDate, selectedTherapist]);

  const tileDisabled = ({ date }: { date: Date }) => {
    if (!selectedTherapist?.availability) return false;
    const dayName = dayjs(date).format('dddd');
    return !selectedTherapist.availability.some((a) => a.day === dayName);
  };

  return (
    <Row>
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Branch</Form.Label>
          <Form.Select {...register('branchId')}>
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b.branch_id} value={b.branch_id}>
                {b.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Département</Form.Label>
          <Form.Select {...register('departmentId')}>
            <option value="">Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Specialization</Form.Label>
          <Form.Select {...register('specializationId')}>
            <option value="">Select Specialization</option>
            {specializations.map((s) => (
              <option key={s.specialization_id} value={s.specialization_id}>
                {s.specialization_type}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Therapist</Form.Label>
          <Form.Select {...register('therapistId')} onChange={handleTherapistChange}>
            <option value="">Select Therapist</option>
            {therapists.map((t) => (
              <option key={t.therapistId} value={t.therapistId}>
                {t.fullName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Appointment Date</Form.Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <Calendar
                {...field}
                value={field.value ? new Date(field.value) : new Date()}
                minDate={new Date()}
                tileDisabled={tileDisabled}
                onChange={(date) => {
                  const formattedDate =
                    date instanceof Date && !isNaN(date.getTime())
                      ? dayjs(date).format('YYYY-MM-DD')
                      : '';
                  field.onChange(formattedDate);
                  setValue('date', formattedDate);
                  trigger('date');
                }}
              />
            )}
          />
          {errors.date && (
            <Form.Text className="text-danger">{String(errors.date?.message)}</Form.Text>
          )}
        </div>
      </Col>

      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Select Time</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {timeSlots.map((slot) => {
              const [start] = slot.split(' - ');
              return (
                <Button
                  key={slot}
                  variant={selectedTime === start ? 'primary' : 'outline-primary'}
                  size="sm"
                  onClick={() => {
                    setSelectedTime(start);
                    setValue('time', start);
                    trigger('time');
                  }}
                >
                  {slot}
                </Button>
              );
            })}
          </div>
          {errors.time && (
            <Form.Text className="text-danger">{String(errors.time?.message)}</Form.Text>
          )}
        </div>
      </Col>

      <Col md={12}>
        <Form.Group className="mb-3">
          <Form.Label>Purpose of Visit</Form.Label>
          <Form.Control type="text" {...register('purposeOfVisit')} />
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control as="textarea" rows={3} {...register('description')} />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default AppointmentFields;