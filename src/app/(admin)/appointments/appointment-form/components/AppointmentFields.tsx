// /appointments/components/AppointmentFields/index.tsx
'use client';

import { API_BASE_PATH } from '@/context/constants';
import type { BranchType, DepartmentType, SpecializationType, TherapistType, AvailabilityType, AppointmentType } from '../types/appointment';
import dayjs from 'dayjs';
import { useEffect, useState, useMemo } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { Controller, useFormContext } from 'react-hook-form';

interface AppointmentFieldsProps {
  mode?: 'create' | 'edit';
  appointmentData?: AppointmentType;
}

const AppointmentFields = ({ mode = 'create', appointmentData }: AppointmentFieldsProps) => {
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
  const [isLoading, setIsLoading] = useState(true);

  const branchId = watch('branchId');
  const departmentId = watch('departmentId');
  const specializationId = watch('specializationId');
  const therapistId = watch('therapistId');
  const selectedDate = watch('date');
  const timeValue = watch('time');

  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

  const safeArray = (res: any): any[] => {
    if (Array.isArray(res)) return res;
    if (res && Array.isArray(res.data)) return res.data;
    return [];
  };

  // Filter therapists based on selected branch and department
  const filteredTherapists = useMemo(() => {
    if (!branchId || !departmentId || therapists.length === 0) {
      return [];
    }

    return therapists.filter(therapist => {
      // Check if therapist works in the selected branch
      const worksInBranch = therapist.branches?.some((branch: { branch_id: any; }) => branch.branch_id === branchId);

      // Check if therapist works in the selected department
      const worksInDepartment = therapist.department?.id === departmentId;

      return worksInBranch && worksInDepartment;
    });
  }, [therapists, branchId, departmentId]);

  // Load initial data
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);

        // Load all data in parallel
        const [branchesRes, specializationsRes, therapistsRes] = await Promise.all([
          fetch(`${API_BASE_PATH}/branches`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_PATH}/specializations`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${API_BASE_PATH}/therapists`, {
            headers: { Authorization: `Bearer ${token}` },
          })
        ]);

        const [branchesData, specializationsData, therapistsData] = await Promise.all([
          branchesRes.json(),
          specializationsRes.json(),
          therapistsRes.json()
        ]);

        setBranches(safeArray(branchesData));
        setSpecializations(safeArray(specializationsData));
        setTherapists(safeArray(therapistsData));

        // For edit mode, pre-select values from appointmentData
        if (mode === 'edit' && appointmentData) {
          // Set initial therapist if available
          if (appointmentData.therapist) {
            const therapist = safeArray(therapistsData).find((t: any) =>
              t.therapistId === appointmentData.therapist?.therapistId
            );
            if (therapist) {
              setSelectedTherapist(therapist);
            }
          }

          // Load departments for the specific branch
          if (appointmentData.branch?.branch_id) {
            const departmentsRes = await fetch(`${API_BASE_PATH}/departments?branchId=${appointmentData.branch.branch_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            const departmentsData = await departmentsRes.json();
            setDepartments(safeArray(departmentsData));
          }
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    if (token) {
      loadInitialData();
    }
  }, [token, mode, appointmentData]);

  // Load departments when branch changes
  useEffect(() => {
    if (!branchId) {
      setDepartments([]);
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
  }, [branchId, token]);

  // Reset therapist selection when branch or department changes
  useEffect(() => {
    if (branchId && departmentId) {
      // Reset therapist selection if current therapist is not in filtered list
      if (selectedTherapist && filteredTherapists.length > 0) {
        const isCurrentTherapistValid = filteredTherapists.some(t => t.therapistId === selectedTherapist.therapistId);
        if (!isCurrentTherapistValid) {
          setSelectedTherapist(null);
          setValue('therapistId', 0);
          setValue('date', '');
          setValue('time', '');
          setTimeSlots([]);
          setSelectedTime(null);
        }
      }
    }
  }, [branchId, departmentId, filteredTherapists, selectedTherapist, setValue]);

  // Set initial values for edit mode after data is loaded
  useEffect(() => {
    if (mode === 'edit' && appointmentData && branches.length > 0 && !isLoading) {
      // Set form values from appointment data
      if (appointmentData.branch?.branch_id) {
        setValue('branchId', appointmentData.branch.branch_id);
      }
      if (appointmentData.department?.id) {
        setValue('departmentId', appointmentData.department.id);
      }
      if (appointmentData.specialization?.specialization_id) {
        setValue('specializationId', appointmentData.specialization.specialization_id);
      }
      if (appointmentData.therapist?.therapistId) {
        setValue('therapistId', appointmentData.therapist.therapistId);

        // Set selected therapist
        const therapist = therapists.find(t => t.therapistId === appointmentData.therapist?.therapistId);
        if (therapist) {
          setSelectedTherapist(therapist);
        }
      }
      if (appointmentData.startTime) {
        const date = new Date(appointmentData.startTime).toISOString().split('T')[0];
        setValue('date', date);

        const time = new Date(appointmentData.startTime).toTimeString().slice(0, 5);
        setValue('time', time);
        setSelectedTime(time);
      }
      if (appointmentData.purposeOfVisit) {
        setValue('purposeOfVisit', appointmentData.purposeOfVisit);
      }
      if (appointmentData.description) {
        setValue('description', appointmentData.description);
      }
    }
  }, [mode, appointmentData, setValue, branches, therapists, isLoading]);

  // Handle therapist change
  const handleTherapistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const therapistId = Number(e.target.value);
    const therapist = filteredTherapists.find((t) => t.therapistId === therapistId) || null;
    setSelectedTherapist(therapist);
    setValue('therapistId', therapistId);
    setValue('date', '');
    setValue('time', '');
    setTimeSlots([]);
    setSelectedTime(null);
  };

  // Generate time slots when date or therapist changes
  useEffect(() => {
    if (!selectedTherapist || !selectedDate) {
      setTimeSlots([]);
      return;
    }

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

    // If we're in edit mode and have a time value, try to select it
    if (mode === 'edit' && timeValue && !selectedTime) {
      const matchingSlot = slots.find(slot => slot.startsWith(timeValue));
      if (matchingSlot) {
        setSelectedTime(timeValue);
      }
    }
  }, [selectedDate, selectedTherapist, mode, timeValue, selectedTime]);

  // Disable unavailable days in calendar
  const tileDisabled = ({ date }: { date: Date }) => {
    if (!selectedTherapist?.availability) return false;
    const dayName = dayjs(date).format('dddd');
    return !selectedTherapist.availability.some((a) => a.day === dayName);
  };

  if (isLoading) {
    return (
      <div className="text-center p-4">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="mt-2">Loading appointment data...</p>
      </div>
    );
  }

  return (
    <Row>
      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Branch <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('branchId', {
              valueAsNumber: true,
              onChange: (e) => {
                setValue('departmentId', 0);
                setValue('specializationId', 0);
                setValue('therapistId', 0);
                setSelectedTherapist(null);
                setValue('date', '');
                setValue('time', '');
                setTimeSlots([]);
                setSelectedTime(null);
              }
            })}
          >
            <option value={0}>Select Branch</option>
            {branches.map((b) => (
              <option key={b.branch_id} value={b.branch_id}>
                {b.name}
              </option>
            ))}
          </Form.Select>
          {errors.branchId && (
            <Form.Text className="text-danger">{String(errors.branchId?.message)}</Form.Text>
          )}
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Département <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('departmentId', {
              valueAsNumber: true,
              onChange: () => {
                setValue('specializationId', 0);
                setValue('therapistId', 0);
                setSelectedTherapist(null);
                setValue('date', '');
                setValue('time', '');
                setTimeSlots([]);
                setSelectedTime(null);
              }
            })}
          >
            <option value={0}>Select Department</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Form.Select>
          {errors.departmentId && (
            <Form.Text className="text-danger">{String(errors.departmentId?.message)}</Form.Text>
          )}
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Specialization <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('specializationId', {
              valueAsNumber: true,
              onChange: () => {
                setValue('therapistId', 0);
                setSelectedTherapist(null);
                setValue('date', '');
                setValue('time', '');
                setTimeSlots([]);
                setSelectedTime(null);
              }
            })}
          >
            <option value={0}>Select Specialization</option>
            {specializations.map((s) => (
              <option key={s.specialization_id} value={s.specialization_id}>
                {s.specialization_type}
              </option>
            ))}
          </Form.Select>
          {errors.specializationId && (
            <Form.Text className="text-danger">{String(errors.specializationId?.message)}</Form.Text>
          )}
        </Form.Group>
      </Col>

      <Col md={6}>
        <Form.Group className="mb-3">
          <Form.Label>Therapist <span className="text-danger">*</span></Form.Label>
          <Form.Select
            {...register('therapistId', {
              valueAsNumber: true,
              onChange: handleTherapistChange
            })}
            disabled={!branchId || !departmentId}
          >
            <option value={0}>
              {!branchId || !departmentId ? 'Select Branch and Department first' : 'Select Therapist'}
            </option>
            {filteredTherapists.map((t) => (
              <option key={t.therapistId} value={t.therapistId}>
                {t.fullName}
              </option>
            ))}
          </Form.Select>
          {errors.therapistId && (
            <Form.Text className="text-danger">{String(errors.therapistId?.message)}</Form.Text>
          )}

        </Form.Group>
      </Col>

      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Appointment Date <span className="text-danger">*</span></Form.Label>
          <Controller
            name="date"
            control={control}
            render={({ field }) => (
              <div>
                <Calendar
                  value={field.value ? new Date(field.value) : null}
                  minDate={new Date()}
                  tileDisabled={tileDisabled}
                  onChange={(date) => {
                    const formattedDate =
                      date instanceof Date && !isNaN(date.getTime())
                        ? dayjs(date).format('YYYY-MM-DD')
                        : '';
                    field.onChange(formattedDate);
                    setValue('date', formattedDate);
                    setValue('time', '');
                    setTimeSlots([]);
                    setSelectedTime(null);
                    trigger('date');
                  }}
                />
                {field.value && (
                  <div className="mt-2 text-center">
                    <strong>Selected: {field.value}</strong>
                  </div>
                )}
              </div>
            )}
          />
          {errors.date && (
            <Form.Text className="text-danger">{String(errors.date?.message)}</Form.Text>
          )}
        </div>
      </Col>

      <Col lg={6}>
        <div className="mb-3">
          <Form.Label>Select Time <span className="text-danger">*</span></Form.Label>
          {timeSlots.length > 0 ? (
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
          ) : selectedDate ? (
            <div className="alert alert-info">
              {selectedTherapist
                ? "No available time slots for this therapist on the selected date"
                : "Please select a therapist first"}
            </div>
          ) : (
            <div className="alert alert-info">Please select a date first</div>
          )}
          {errors.time && (
            <Form.Text className="text-danger">{String(errors.time?.message)}</Form.Text>
          )}
          {selectedTime && (
            <div className="mt-2">
              <strong>Selected time: {selectedTime}</strong>
            </div>
          )}
        </div>
      </Col>

      <Col md={12}>
        <Form.Group className="mb-3">
          <Form.Label>Purpose of Visit <span className="text-danger">*</span></Form.Label>
          <Form.Control
            type="text"
            {...register('purposeOfVisit')}
            placeholder="Enter the purpose of the visit"
          />
          {errors.purposeOfVisit && (
            <Form.Text className="text-danger">{String(errors.purposeOfVisit?.message)}</Form.Text>
          )}
        </Form.Group>
      </Col>

      <Col md={12}>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            {...register('description')}
            placeholder="Additional details about the appointment"
          />
        </Form.Group>
      </Col>
    </Row>
  );
};

export default AppointmentFields;