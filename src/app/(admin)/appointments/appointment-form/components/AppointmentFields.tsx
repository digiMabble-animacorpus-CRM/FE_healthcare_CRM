'use client';

import { useEffect, useState } from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { Form, Row, Col, Button } from 'react-bootstrap';
import Calendar from 'react-calendar';
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

interface Availability {
    day: string;       // e.g. "Monday"
    startTime: string; // "09:00"
    endTime: string;   // "17:00"
}

interface Therapist {
    therapistId: number;
    firstName: string;
    lastName: string;
    fullName: string;
    photo: string;
    availability: Availability[];
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
    const [selectedTherapist, setSelectedTherapist] = useState<Therapist | null>(null);
    console.log(selectedTherapist, "sel")
    const [timeSlots, setTimeSlots] = useState<string[]>([]);
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const branchId = watch('branchId');
    const departmentId = watch('departmentId');
    const specializationId = watch('specializationId');
    const selectedDate = watch('date');
    console.log(selectedDate, "selected Time")

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

    // fetch therapists when specialization is selected
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

    // therapist change
    const handleTherapistChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const therapistId = Number(e.target.value);
        const therapist = therapists.find((t) => t.therapistId === therapistId) || null;
        setSelectedTherapist(therapist);
        setValue('therapistId', therapistId);
        setValue('date', '');
        setValue('time', '');
        setTimeSlots([]);
    };

    // generate slots when date is selected
    useEffect(() => {
        if (!selectedTherapist || !selectedDate) return;

        const dayName = dayjs(selectedDate).format('dddd'); // e.g. "Monday"
        console.log(dayName, "day")
        const dayAvailability = selectedTherapist.availability?.find(
            (a) => a.day === dayName
        );
        console.log(dayAvailability, "aval")

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

            // skip past slots if selected date is today
            if (baseDate.isAfter(now, 'day') || current.isAfter(now)) {
                slots.push(`${slotStart} - ${slotEnd}`);
            }

            current = current.add(30, 'minute');
        }

        setTimeSlots(slots);
    }, [selectedDate, selectedTherapist]);

    // disable calendar days not in therapist availability
    const tileDisabled = ({ date }: { date: Date }) => {
        if (!selectedTherapist?.availability) return false;
        const dayName = dayjs(date).format('dddd');
        return !selectedTherapist.availability.some((a) => a.day === dayName);
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
