// components/EventFormModal.tsx
'use client';

import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import Select from 'react-select';
import AsyncSelect from 'react-select/async';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { addMinutes } from 'date-fns';
import {
  CalendarDto,
  getAllCalendars,
  getAllHps,
  getAllMotives,
  MotiveDto,
} from '../../motive/helpers/motive';
import { createEventBulk, getEventById, updateEventBulk } from '../helpers/eventApi';
import { getAllPatients } from '../../appointment-calender/patients/api';

type Mode = 'create' | 'edit';

type Props = {
  show: boolean;
  mode: Mode;
  eventId?: string | null;
  onClose: () => void;
  onSaved?: (result?: any) => void;
};

// -------------------------
// Standard OptionType for react-select
// -------------------------
type OptionType = {
  value: string;
  label: string;
};

type FormValues = {
  title: string;
  status: string;
  calendarId: string | null;
  type: 'APPOINTMENT' | 'PERSONAL' | 'LEAVE' | 'EXTERNAL_EVENT' | 'BUSY';
  motiveId: string | null;
  startAt: string;
  endAt: string;
  description?: string | null;
  hpNote?: string | null;
  patientNote?: string | null;
  attendeePatient?: OptionType | null;
  attendeesHp: OptionType[];
};

const DEFAULT_VALUES: FormValues = {
  title: '',
  status: 'ACTIVE',
  calendarId: null,
  type: 'APPOINTMENT',
  motiveId: null,
  startAt: '',
  endAt: '',
  description: null,
  hpNote: null,
  patientNote: null,
  attendeePatient: null,
  attendeesHp: [],
};

// -------------------------
// Validation schema
// -------------------------
const validationSchema = yup.object({
  title: yup.string().trim().required('Title is required'),
  calendarId: yup.string().nullable(),
  type: yup
    .string()
    .oneOf(['APPOINTMENT', 'PERSONAL', 'LEAVE', 'EXTERNAL_EVENT', 'BUSY'])
    .required(),
  startAt: yup
    .string()
    .required('Start date/time is required')
    .test('valid-date', 'Start date is invalid', (v) =>
      v ? !isNaN(new Date(v).getTime()) : false,
    ),

  endAt: yup
    .string()
    .required('End date/time is required')
    .test('valid-date', 'End date is invalid', (v) => (v ? !isNaN(new Date(v).getTime()) : false))
    .test('after-start', 'End must be after start', function (value) {
      const { startAt } = this.parent;
      if (!startAt || !value) return true;
      // Note: Date comparison relies on both being valid Date objects
      return new Date(value) > new Date(startAt);
    }),

  motiveId: yup
    .string()
    .nullable()
    .when('type', (type: any, schema: any) => {
      if (type === 'APPOINTMENT') {
        return schema.required('Motive is required for appointments');
      }
      return schema.nullable();
    }),
});

/**
 * 💡 FIX: Helper function to convert the 'datetime-local' string
 * into a UTC ISO string that represents the exact local time entered.
 * This prevents the time zone offset (e.g., -5 hours) on submission.
 */
const convertLocalToUTCISO = (localTime: string): string => {
  if (!localTime) return '';
  // Append ':00.000Z' to force JavaScript to interpret the date string
  // as an instant in UTC time.
  const utcDate = new Date(`${localTime}:00.000Z`);
  return utcDate.toISOString();
};


export default function EventFormModal({ show, mode, eventId, onClose, onSaved }: Props) {
  const isEdit = mode === 'edit';

  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const [calendars, setCalendars] = useState<CalendarDto[]>([]);
  const [motives, setMotives] = useState<MotiveDto[]>([]);
  const [hps, setHps] = useState<Array<{ id: string; firstName?: string; lastName?: string }>>([]);
  const [allPatients, setAllPatients] = useState<any[]>([]);
  const [referenceDataLoaded, setReferenceDataLoaded] = useState(false); // Track if static data is loaded

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(validationSchema) as any,
    defaultValues: DEFAULT_VALUES,
  });

  const watchedCalendarId = watch('calendarId');
  const watchedMotiveId = watch('motiveId');
  const watchedType = watch('type');
  const watchedStartAt = watch('startAt');

  // -------------------------
  // 💡 FIX 1: Merge useEffects to prevent double load on edit
  // Loads all reference data, then loads event data if in edit mode.
  // -------------------------
  useEffect(() => {
    if (!show) {
      // Reset form and state when modal is closed
      reset(DEFAULT_VALUES);
      setReferenceDataLoaded(false); 
      return;
    }

    let mounted = true;
    setLoadingInitial(true);
    setAlert(null);

    const loadAllData = async () => {
      try {
        // 1. Load Reference Data
        const [calResp, motiveResp, hpResp, patientResp] = await Promise.all([
          getAllCalendars(1, 500),
          getAllMotives(1, 500),
          getAllHps(1, 500),
          getAllPatients(1, 500),
        ]);

        if (!mounted) return;

        const patients = patientResp.data || [];
        const healthProfessionals = hpResp.elements || [];

        setCalendars(calResp.elements || []);
        setMotives(motiveResp.data || []);
        setHps(healthProfessionals);
        setAllPatients(patients);
        setReferenceDataLoaded(true);

        // 2. Load Event Data (Only if in edit mode)
        if (isEdit && eventId) {
          const ev = await getEventById(eventId);
          if (!mounted) return;
          
          // Map attendees to OptionType
          const patientAttendee = (ev.attendees || [])
            .filter((a: any) => a.entityType === 'PatientRecord')
            .map((a: any) => {
              const p = patients.find((pp: any) => pp.id === a.entityId);
              return p
                ? { value: p.id, label: `${p.firstName} ${p.lastName}` }
                : { value: a.entityId, label: 'Patient' };
            })[0] || null;

          const hpAttendees = (ev.attendees || [])
            .filter((a: any) => a.entityType === 'Hp')
            .map((a: any) => {
              const hp = healthProfessionals.find((h: any) => h.id === a.entityId);
              return {
                value: a.entityId,
                label: hp ? `${hp.firstName} ${hp.lastName}` : a.entityId,
              };
            });

          // 💡 FIX 2: Correct Date Conversion on Load (to remove 'Z' and display in local time field)
          // The API sends an ISO string (e.g., '2025-12-01T15:00:00.000Z').
          // The datetime-local input expects 'YYYY-MM-DDThh:mm' in LOCAL time.
          // By creating a Date object, it automatically converts the UTC time to your local time.
          // Slicing it to the correct format removes the seconds and the 'Z' which is necessary.
          const localStartAt = ev.startAt ? new Date(ev.startAt).toISOString().slice(0, 16) : '';
          const localEndAt = ev.endAt ? new Date(ev.endAt).toISOString().slice(0, 16) : '';


          reset({
            title: ev.title ?? '',
            status: ev.status ?? 'ACTIVE',
            calendarId: ev.calendarId ?? null,
            type: ev.type ?? 'APPOINTMENT',
            motiveId: ev.motiveId ?? null,
            startAt: localStartAt, // <-- FIX applied here
            endAt: localEndAt,     // <-- FIX applied here
            description: ev.description ?? null,
            hpNote: ev.hpNote ?? null,
            patientNote: ev.patientNote ?? null,
            attendeePatient: patientAttendee,
            attendeesHp: hpAttendees,
          });
        }
      } catch (err) {
        console.error(err);
        setAlert({ type: 'danger', text: 'Failed to load data or event' });
      } finally {
        if (mounted) setLoadingInitial(false);
      }
    };

    loadAllData();

    return () => {
      mounted = false;
    };
  }, [show, isEdit, eventId, reset]); // Dependencies cleaned up

  // -------------------------
  // Motives filtered by calendar
  // -------------------------
  const motiveOptions = useMemo<OptionType[]>(
    () =>
      motives
        .filter((m) =>
          !watchedCalendarId ? true : (m.calendarIds ?? []).includes(watchedCalendarId),
        )
        .map((m) => ({ value: m.id, label: m.label ?? '' })),
    [motives, watchedCalendarId],
  );

  const selectedMotive = useMemo(
    () => motives.find((m) => m.id === watchedMotiveId),
    [motives, watchedMotiveId],
  );

  // -------------------------
  // Auto-set end time
  // -------------------------
  useEffect(() => {
    // Only run if the reference data is loaded, and it's a create
    if (!referenceDataLoaded || isEdit) return;
    if (!selectedMotive || !watchedStartAt) return;

    const minutes =
      selectedMotive.existingPatientDuration ?? selectedMotive.newPatientDuration ?? 15;

    const start = new Date(watchedStartAt);
    if (isNaN(start.getTime())) return;

    const end = addMinutes(start, minutes);
    setValue('endAt', end.toISOString().slice(0, 16));
  }, [selectedMotive, watchedStartAt, isEdit, setValue, referenceDataLoaded]);

  // -------------------------
  // Patient search (local filtering)
  // -------------------------
  const loadPatientOptions = useCallback(
    async (input: string) => {
      if (!input) return [];

      const q = input.toLowerCase();

      return allPatients
        .filter((p) => {
          const name = `${p.firstName} ${p.lastName}`.toLowerCase();
          return (
            name.includes(q) ||
            (p.externalId || '').toLowerCase().includes(q) ||
            (p.ssin || '').toLowerCase().includes(q)
          );
        })
        .map(
          (p): OptionType => ({
            value: p.id,
            label: `${p.firstName} ${p.lastName}${p.externalId ? ` (${p.externalId})` : ''}`,
          }),
        );
    },
    [allPatients],
  );

  // -------------------------
  // HP & Calendar option lists
  // -------------------------
  const hpOptions: OptionType[] = useMemo(
    () =>
      hps.map((h) => ({
        value: h.id,
        label: `${h.firstName || ''} ${h.lastName || ''}`.trim(),
      })),
    [hps],
  );

  const calendarOptions: OptionType[] = useMemo(
    () => calendars.map((c) => ({ value: c.id, label: c.label ?? '' })),
    [calendars],
  );

  // -------------------------
  // Submit - FIX DATE CONVERSION
  // -------------------------
  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setAlert(null);

    if (values.type === 'APPOINTMENT' && !values.attendeePatient) {
      setAlert({ type: 'danger', text: 'Please select a patient.' });
      return;
    }

    const attendees: any[] = [];

    if (values.attendeePatient) {
      attendees.push({
        entityId: values.attendeePatient.value,
        entityType: 'PatientRecord',
        status: 'NO_RESPONSE',
      });
    }

    values.attendeesHp.forEach((h) =>
      attendees.push({
        entityId: h.value,
        entityType: 'Hp',
        status: 'NO_RESPONSE',
      }),
    );

    const eventPayload: any = {
      title: values.title,
      status: values.status,
      calendarId: values.calendarId,
      motiveId: values.type === 'APPOINTMENT' ? values.motiveId : undefined,
      attendees,
      // 💡 FIX 3: Use the helper to convert 'datetime-local' string correctly to UTC ISO string
      startAt: convertLocalToUTCISO(values.startAt),
      endAt: convertLocalToUTCISO(values.endAt),
      type: values.type,
      description: values.description || undefined,
      hpNote: values.hpNote || undefined,
      patientNote: values.patientNote || undefined,
    };

    if (isEdit) eventPayload.id = eventId;

    setSubmitting(true);

    const res = isEdit
      ? await updateEventBulk([eventPayload])
      : await createEventBulk([eventPayload]);

    if (!res?.success) {
      setAlert({ type: 'danger', text: res?.message || 'Save failed' });
    } else {
      setAlert({ type: 'success', text: 'Saved successfully!' });
      onSaved?.(res);
      setTimeout(() => onClose(), 500);
    }

    setSubmitting(false);
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Edit Event' : 'Create Event'}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {loadingInitial ? (
            <div className="text-center my-3">
              <Spinner animation="border" />
            </div>
          ) : (
            <>
              {alert && <Alert variant={alert.type}>{alert.text}</Alert>}

              {/* ---- title + type ---- */}
              <Row className="g-3">
                <Col md={8}>
                  <Form.Group>
                    <Form.Label>Title *</Form.Label>
                    <Form.Control {...register('title')} isInvalid={!!errors.title} />
                  </Form.Group>
                </Col>

                <Col md={4}>
                  <Form.Group>
                    <Form.Label>Type</Form.Label>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Form.Select {...field}>
                          <option value="APPOINTMENT">Appointment</option>
                          <option value="PERSONAL">Personal</option>
                          <option value="LEAVE">Leave</option>
                          <option value="EXTERNAL_EVENT">External Event</option>
                          <option value="BUSY">Busy</option>
                        </Form.Select>
                      )}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* ---- calendar + motive ---- */}
              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Calendar *</Form.Label>
                    <Controller
                      control={control}
                      name="calendarId"
                      render={({ field }) => (
                        <Select<OptionType, false>
                          options={calendarOptions}
                          value={calendarOptions.find((o) => o.value === field.value) || null}
                          onChange={(opt) => field.onChange(opt ? opt.value : null)}
                          isClearable
                          placeholder="Select calendar..."
                        />
                      )}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Motive {watchedType === 'APPOINTMENT' ? '(required)' : '(optional)'}
                    </Form.Label>

                    <Controller
                      control={control}
                      name="motiveId"
                      render={({ field }) => (
                        <Select<OptionType, false>
                          options={motiveOptions}
                          value={motiveOptions.find((o) => o.value === field.value) || null}
                          onChange={(opt) => field.onChange(opt ? opt.value : null)}
                          isClearable
                          isDisabled={watchedType !== 'APPOINTMENT'}
                          placeholder={watchedType === 'APPOINTMENT' ? 'Select motive...' : 'N/A'}
                        />
                      )}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* ---- start + end ---- */}
              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Start *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      {...register('startAt')}
                      isInvalid={!!errors.startAt}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>End *</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      {...register('endAt')}
                      isInvalid={!!errors.endAt}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* ---- attendees ---- */}
              <Row className="g-3 mt-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>
                      Patient {watchedType === 'APPOINTMENT' ? '(required)' : '(optional)'}
                    </Form.Label>

                    <Controller
                      control={control}
                      name="attendeePatient"
                      render={({ field }) => (
                        <AsyncSelect<OptionType, false>
                          cacheOptions
                          defaultOptions
                          loadOptions={loadPatientOptions}
                          value={field.value}
                          onChange={(opt) => field.onChange(opt)}
                          placeholder="Search patient..."
                          isDisabled={watchedType !== 'APPOINTMENT'}
                        />
                      )}
                    />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Health Professionals</Form.Label>
                    <Controller
                      control={control}
                      name="attendeesHp"
                      render={({ field }) => (
                        <Select<OptionType, true>
                          isMulti
                          options={hpOptions}
                          value={field.value}
                          onChange={(opts) => field.onChange(opts as OptionType[])}
                          placeholder="Select HPs..."
                        />
                      )}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* ---- notes ---- */}
              <Row className="g-3 mt-3">
                <Col md={12}>
                  <Form.Group>
                    <Form.Label>Description</Form.Label>
                    <Form.Control as="textarea" rows={3} {...register('description')} />
                  </Form.Group>
                </Col>
              </Row>

              <Row className="g-3 mt-2">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label>HP Note</Form.Label>
                    <Form.Control as="textarea" rows={2} {...register('hpNote')} />
                  </Form.Group>
                </Col>

                <Col md={6}>
                  <Form.Group>
                    <Form.Label>Patient Note</Form.Label>
                    <Form.Control as="textarea" rows={2} {...register('patientNote')} />
                  </Form.Group>
                </Col>
              </Row>
            </>
          )}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="link" onClick={onClose}>
            Cancel
          </Button>

          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" />{' '}
                {isEdit ? 'Saving...' : 'Creating...'}
              </>
            ) : isEdit ? (
              'Save changes'
            ) : (
              'Create event'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}