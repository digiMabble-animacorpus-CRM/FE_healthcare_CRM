'use client';

import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Calendar from 'react-calendar'; // 👈 install react-calendar
import 'react-calendar/dist/Calendar.css';
import dayjs from 'dayjs';
import { API_BASE_PATH } from '@/context/constants';

interface Branch {
    branch_id: number;
    name: string;
}

interface Department {
    id: number;
    name: string;
}

interface Specialization {
    specialization_id: number;
    specialization_type: string;
}

interface Therapist {
    therapistId: number;
    firstName: string;
    lastName: string;
    fullName: string;
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
    console.log(selectedTherapist,"sel")
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const branchId = watch('branchId');
    const departmentId = watch('departmentId');
    const specializationId = watch('specializationId');

    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    // helper to normalize API response
    const safeArray = (res: any): any[] => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
    };

    // load branches initially
    useEffect(() => {
        async function loadBranches() {
            try {
                const res = await fetch(`${API_BASE_PATH}/branches`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                setBranches(safeArray(data));
            } catch (err) {
                console.error('Failed to load branches', err);
                setBranches([]);
            }
        }
        if (token) loadBranches();
    }, [token]);

    // fetch departments when branch is selected
    useEffect(() => {
        if (!branchId) {
            setDepartments([]);
            setValue('departmentId', '');
            return;
        }

        async function loadDepartments() {
            try {
                const res = await fetch(
                    `${API_BASE_PATH}/departments?branchId=${branchId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setDepartments(safeArray(data));
            } catch (err) {
                console.error('Failed to fetch departments', err);
                setDepartments([]);
            }
        }

        loadDepartments();
    }, [branchId]);

    // fetch specializations when department is selected
    useEffect(() => {
        if (!branchId || !departmentId) {
            setSpecializations([]);
            setValue('specializationId', '');
            return;
        }

        async function loadSpecializations() {
            try {
                console.log(departmentId, "department")
                const res = await fetch(
                    `${API_BASE_PATH}/specializations`,
                    // `${API_BASE_PATH}/specializations?branchId=${branchId}&departmentId=${departmentId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const data = await res.json();
                setSpecializations(safeArray(data));
            } catch (err) {
                console.error('Failed to fetch specializations', err);
                setSpecializations([]);
            }
        }

        loadSpecializations();
    }, [branchId, departmentId]);

    // fetch therapists when all three selected
    useEffect(() => {
        if (!branchId || !departmentId || !specializationId) {
            setTherapists([]);
            setValue('therapistId', '');
            return;
        }

        async function loadTherapists() {
            try {
                const res = await fetch(
                    `${API_BASE_PATH}/therapists`,
                    // `${API_BASE_PATH}/therapists?branchId=${branchId}&departmentId=${departmentId}&specializationId=${specializationId}`,
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

    // therapist change → generate slots
    const handleTherapistChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const therapistId = Number(e.target.value);
        const therapist =
            therapists.find((t) => t.therapistId === therapistId) || null;
        setSelectedTherapist(therapist);
        setValue('therapistId', therapistId);

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
                            <option key={b.branch_id} value={b.branch_id}>
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
                            <option key={s.specialization_id} value={s.specialization_id}>
                                {s.specialization_type}
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
                        {...register('therapistId')}
                        onChange={handleTherapistChange}
                    >
                        <option value="">Select Therapist</option>
                        {therapists.map((t) => (
                            <option key={t.therapistId} value={t.therapistId}>
                                {t.fullName}
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
