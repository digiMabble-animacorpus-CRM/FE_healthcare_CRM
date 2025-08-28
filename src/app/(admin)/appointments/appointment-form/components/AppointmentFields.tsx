'use client';

import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Calendar from 'react-calendar'; // 👈 install react-calendar
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { API_BASE_PATH } from '@/context/constants';

interface Branch {
  id: number;
  name: string;
}

interface Department {
  id: number;
  name: string;
}

interface Specialization {
  id: number;
  name: string;
}

interface Therapist {
  therapistKey: number;
  firstName: string;
  lastName: string;
  availability?: {
    dayOfWeek: string[];
    startTime: string;
    endTime: string;
  };
}

const AppointmentFields = () => {
  const {
    register,
    setValue,
    watch,
    control,
    trigger,
    formState: { errors },
  } = useFormContext();

  const [branches, setBranches] = useState<Branch[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [therapists, setTherapists] = useState<Therapist[]>([]);
  const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(
    null
  );
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);

  const branchId = watch('branchId');
  const departmentId = watch('departmentId');
  const specializationId = watch('specializationId');

  // helper to normalize API response
  const safeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  // load initial dropdowns
  useEffect(() => {
    const token = localStorage.getItem('access_token');

    async function loadInitialData() {
      try {
        const [branchesRes, departmentsRes, specsRes] = await Promise.all([
          fetch(`${API_BASE_PATH}/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_PATH}/departments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_PATH}/specializations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const [branchesJson, departmentsJson, specsJson] = await Promise.all([
          branchesRes.json(),
          departmentsRes.json(),
          specsRes.json(),
        ]);

        setBranches(safeArray(branchesJson));
        setDepartments(safeArray(departmentsJson));
        setSpecializations(safeArray(specsJson));
      } catch (err) {
        console.error('Failed to load dropdown data', err);
        setBranches([]);
        setDepartments([]);
        setSpecializations([]);
      }
    }

    loadInitialData();
  }, []);

  // fetch therapists
  useEffect(() => {
    if (!branchId || !departmentId || !specializationId) return;
    const token = localStorage.getItem('access_token');

    async function loadTherapists() {
      try {
        const res = await fetch(
          `${API_BASE_PATH}/therapists?branchId=${branchId}&departmentId=${departmentId}&specializationId=${specializationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const data = await res.json();
        setTherapists(safeArray(data));
      } catch (err) {
        console.error('Failed to fetch therapists', err);
        setTherapists([]);
      }
    }

    loadTherapists();
  }, [branchId, departmentId, specializationId]);

  // therapist change
  const handleTherapistChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const therapistKey = Number(e.target.value);
    const therapist =
      therapists.find((t) => t.therapistKey === therapistKey) || null;
    setSelectedTherapist(therapist);
    setValue('therapistKey', therapistKey);

    if (therapist?.availability) {
      const slots: string[] = [];
      const start = dayjs(therapist.availability.startTime, 'HH:mm');
      const end = dayjs(therapist.availability.endTime, 'HH:mm');

      let current = start;
      while (current.isBefore(end)) {
        const slotStart = current.format('HH:mm');
        const slotEnd = current.add(30, 'minute').format('HH:mm');
        slots.push(`${slotStart} - ${slotEnd}`);
        current = current.add(30, 'minute');
      }
      setTimeSlots(slots);
    } else {
      setTimeSlots([]);
    }
  };

  return (
    <Row>
      {/* Branch */}
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Branch</Form.Label>
          <Form.Select {...register('branchId')}>
            <option value="">Select Branch</option>
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Department */}
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Department</Form.Label>
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

      {/* Specialization */}
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Specialization</Form.Label>
          <Form.Select {...register('specializationId')}>
            <option value="">Select Specialization</option>
            {specializations.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Therapist */}
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Therapist</Form.Label>
          <Form.Select
            {...register('therapistKey')}
            onChange={handleTherapistChange}
          >
            <option value="">Select Therapist</option>
            {therapists.map((t) => (
              <option key={t.therapistKey} value={t.therapistKey}>
                {t.firstName} {t.lastName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>
      </Col>

      {/* Calendar Date Picker */}
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
                onChange={(date) => {
                  const formattedDate =
                    date instanceof Date && !isNaN(date.getTime())
                      ? `${date.getFullYear()}-${String(
                          date.getMonth() + 1
                        ).padStart(2, '0')}-${String(date.getDate()).padStart(
                          2,
                          '0'
                        )}`
                      : '';
                  field.onChange(formattedDate);
                  setValue('date', formattedDate);
                  trigger('date');
                }}
              />
            )}
          />
          {errors.date && (
            <Form.Text className="text-danger">
              {String(errors.date?.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      {/* Time Slots */}
      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Select Time</Form.Label>
          <div className="d-flex flex-wrap gap-2">
            {timeSlots.map((slot) => (
              <Button
                key={slot}
                variant={selectedTime === slot ? 'primary' : 'outline-primary'}
                size="sm"
                onClick={() => {
                  setSelectedTime(slot);
                  setValue('time', slot);
                  trigger('time');
                }}
              >
                {slot}
              </Button>
            ))}
          </div>
          {errors.time && (
            <Form.Text className="text-danger">
              {String(errors.time?.message)}
            </Form.Text>
          )}
        </div>
      </Col>

      {/* Purpose */}
      <Col md={12}>
        <Form.Group className="mb-3">
          <Form.Label>Purpose of Visit</Form.Label>
          <Form.Control type="text" {...register('purposeOfVisit')} />
        </Form.Group>
      </Col>

      {/* Description */}
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
