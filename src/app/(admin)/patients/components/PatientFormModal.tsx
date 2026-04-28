'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Spinner, Alert, Row, Col } from 'react-bootstrap';
import { useForm, Controller, SubmitHandler } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import patientApi, { getPatientById } from '../helpers/patientApi';

type Mode = 'create' | 'edit';

type PatientFormModalProps = {
  show: boolean;
  mode: Mode;
  patientId?: string;
  onClose: () => void;
  onSaved?: () => void;
};

type FormValues = {
  firstName: string;
  lastName: string;
  birthdate: string | null;
  ssin: string | null;
  legalGender: '' | 'M' | 'F' | null;
  language: '' | 'fr' | 'nl' | 'en' | 'de' | null;
  email: string | null;
  phone: string | null;
  addressStreet: string | null;
  addressNumber: string | null;
  addressZip: string | null;
  addressCity: string | null;
  addressCountry: string | null;
  note: string | null;
  status: 'ACTIVE' | 'INACTIVE';
};

const ssinRegex = /^[0-9]{11}$/;
const phoneRegex = /^[0-9+\s-]{6,20}$/;
const zipRegex = /^[0-9A-Za-z\s-]{3,10}$/;

const schema = yup.object().shape({
  firstName: yup.string().trim().required('Le prénom est requis'),
  lastName: yup.string().trim().required('Le nom est requis'),

  birthdate: yup
    .string()
    .nullable()
    .test('valid-date', 'Date invalide', (v) => {
      if (!v) return true;
      return !isNaN(new Date(v).getTime());
    })
    .test('not-in-future', 'La date de naissance ne peut pas être dans le futur', (v) => {
      if (!v) return true;
      return new Date(v) <= new Date();
    }),

  ssin: yup
    .string()
    .nullable()
    .test('valid-ssin', 'Le SSIN doit comporter 11 chiffres', (v) => (v ? ssinRegex.test(v) : true)),

  legalGender: yup.string().nullable().oneOf(['', 'M', 'F', null]),
  language: yup.string().nullable().oneOf(['', 'fr', 'nl', 'en', 'de', null]),

  email: yup.string().nullable().email('E-mail invalide'),
  phone: yup
    .string()
    .nullable()
    .test('valid-phone', 'Numéro de téléphone invalide', (v) => (v ? phoneRegex.test(v) : true)),

  addressZip: yup
    .string()
    .nullable()
    .test('zip', 'Code postal invalide', (v) => (v ? zipRegex.test(v) : true)),
});

export default function PatientFormModal({
  show,
  mode,
  patientId,
  onClose,
  onSaved,
}: PatientFormModalProps) {
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  const defaultValues: FormValues = {
    firstName: '',
    lastName: '',
    birthdate: null,
    ssin: null,
    legalGender: '',
    language: 'fr',
    email: null,
    phone: null,
    addressStreet: null,
    addressNumber: null,
    addressZip: null,
    addressCity: null,
    addressCountry: null,
    note: null,
    status: 'ACTIVE',
  };

  const {
    register,
    handleSubmit,
    control,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  // load patient when editing
  useEffect(() => {
    if (!show) return;

    if (mode === 'create') {
      reset(defaultValues);
      return;
    }

    if (mode === 'edit' && patientId) {
      setLoadingPatient(true);
      setAlert(null);

      (async () => {
        const result = await getPatientById(patientId);

        if (!result) {
          setAlert({ type: 'danger', text: 'Impossible de charger les données du patient.' });
          setLoadingPatient(false);
          return;
        }

        setValue('firstName', result.firstName ?? '');
        setValue('lastName', result.lastName ?? '');

        if (result.birthdate?.year) {
          const { year, month, day } = result.birthdate;
          const d = new Date(year, Math.max((month ?? 1) - 1, 0), Math.max(day ?? 1, 1));
          setValue('birthdate', d.toISOString().slice(0, 10));
        }

        setValue('ssin', result.ssin ?? null);
        setValue('legalGender', result.legalGender ?? '');
        setValue('language', result.language ?? '');

        const contact = Array.isArray(result.contactInfos) ? result.contactInfos : [];
        setValue('email', contact.find((x: any) => x.type === 'EMAIL')?.value ?? null);
        setValue('phone', contact.find((x: any) => x.type === 'PHONE')?.value ?? null);

        const addr = result.address ?? {};
        setValue('addressStreet', addr.street ?? null);
        setValue('addressNumber', addr.number ?? null);
        setValue('addressZip', addr.zipCode ?? null);
        setValue('addressCity', addr.city ?? null);
        setValue('addressCountry', addr.country ?? null);

        setValue('note', result.note ?? null);
        setValue('status', result.status ?? 'ACTIVE');
        setLoadingPatient(false);
      })();
    }
  }, [show, mode, patientId, reset, setValue]);

  const buildPayload = (values: FormValues, existing?: any) => {
    const payload: any = {};

    if (existing?.id) payload.id = existing.id;

    payload.firstName = values.firstName.trim();
    payload.lastName = values.lastName.trim();

    if (values.birthdate) {
      const d = new Date(values.birthdate);
      payload.birthdate = {
        year: d.getFullYear(),
        month: d.getMonth() + 1,
        day: d.getDate(),
      };
    }

    if (values.ssin) payload.ssin = values.ssin;
    if (values.legalGender) payload.legalGender = values.legalGender;
    if (values.language) payload.language = values.language;

    const contactInfos: any[] = [];

    if (values.email) {
      contactInfos.push({
        type: 'EMAIL',
        value: values.email,
        isPrimary: true,
        isEmergency: false,
        isVerified: false,
      });
    }
    if (values.phone) {
      contactInfos.push({
        type: 'PHONE',
        value: values.phone,
        isPrimary: contactInfos.length === 0,
        isEmergency: false,
        isVerified: false,
      });
    }

    payload.contactInfos = contactInfos;

    const addr: any = {};
    if (values.addressStreet) addr.street = values.addressStreet;
    if (values.addressNumber) addr.number = values.addressNumber;
    if (values.addressZip) addr.zipCode = values.addressZip;
    if (values.addressCity) addr.city = values.addressCity;
    if (values.addressCountry) addr.country = values.addressCountry;
    if (Object.keys(addr).length > 0) payload.address = addr;

    if (values.note) payload.note = values.note;

    // if (mode === 'create') payload.status = 'ACTIVE';
    payload.status = values.status;

    return payload;
  };

  const onSubmit: SubmitHandler<FormValues> = async (values) => {
    setSubmitting(true);
    setAlert(null);

    try {
      if (mode === 'edit') {
        const existing = await getPatientById(patientId!);

        const payload = buildPayload(values, existing);
        if (existing?.externalId) payload.externalId = existing.externalId;

        const { success, message } = await patientApi.updatePatientBulk([payload]);

        if (!success) {
          setAlert({ type: 'danger', text: message });
          setSubmitting(false);
          return;
        }

        setAlert({ type: 'success', text: 'Patient mis à jour avec succès.' });
        onSaved?.();
        reset();
        setTimeout(onClose, 700);
      } else {
        const payload = buildPayload(values);

        const { success, message } = await patientApi.createPatientBulk([payload]);

        if (!success) {
          setAlert({ type: 'danger', text: message });
          setSubmitting(false);
          return;
        }

        setAlert({ type: 'success', text: 'Patient créé avec succès.' });
        onSaved?.();
        setTimeout(onClose, 700);
      }
    } catch {
      setAlert({ type: 'danger', text: "Une erreur inattendue s'est produite." });
    } finally {
      setSubmitting(false);
    }
  };

  const isDisabled = submitting || loadingPatient;

  const countryOptions = [
    '',
    'Belgique',
    'France',
    'Pays-Bas',
    'Allemagne',
    'Royaume-Uni',
    'Autre',
  ];
  if (loadingPatient) {
    return (
      <Modal
        show={show}
        onHide={onClose}
        centered
        size="lg"
        backdrop="static"
        keyboard={!submitting}
      >
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          <div className="text-center my-3">
            <Spinner animation="border" />
          </div>
        </Modal.Body>
      </Modal>
    );
  }
  return (
    <Modal show={show} onHide={onClose} centered size="lg" backdrop="static" keyboard={!submitting}>
      <Modal.Header closeButton>
        <Modal.Title>{mode === 'create' ? 'Créer un patient' : 'Modifier le patient'}</Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {alert && <Alert variant={alert.type}>{alert.text}</Alert>}

          {/* FORM CONTENT START */}
          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Prénom *</Form.Label>
                <Form.Control
                  disabled={isDisabled}
                  {...register('firstName')}
                  isInvalid={!!errors.firstName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.firstName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Nom *</Form.Label>
                <Form.Control
                  disabled={isDisabled}
                  {...register('lastName')}
                  isInvalid={!!errors.lastName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.lastName?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Date de naissance</Form.Label>
                <Controller
                  control={control}
                  name="birthdate"
                  render={({ field }) => (
                    <Form.Control
                      type="date"
                      disabled={isDisabled}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(e.target.value || null)}
                      isInvalid={!!errors.birthdate}
                    />
                  )}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.birthdate?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Numéro de Registre National (SSIN)</Form.Label>
                <Form.Control
                  disabled={isDisabled}
                  {...register('ssin')}
                  isInvalid={!!errors.ssin}
                />
                <Form.Control.Feedback type="invalid">{errors.ssin?.message}</Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Sexe légal</Form.Label>
                <Form.Select disabled={isDisabled} {...register('legalGender')}>
                  <option value="">Sélectionner</option>
                  <option value="M">Masculin</option>
                  <option value="F">Féminin</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label>Statut</Form.Label>
                <Form.Select disabled={isDisabled} {...register('status')}>
                  <option value="ACTIVE">Actif</option>
                  <option value="INACTIVE">Inactif</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Langue</Form.Label>
                <Form.Select disabled={isDisabled} {...register('language')}>
                  <option value="">Sélectionner</option>
                  <option value="fr">Français</option>
                  <option value="nl">Néerlandais</option>
                  <option value="en">Anglais</option>
                  <option value="de">Allemand</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  disabled={isDisabled}
                  type="email"
                  {...register('email')}
                  isInvalid={!!errors.email}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Téléphone</Form.Label>
                <Form.Control
                  disabled={isDisabled}
                  type="text"
                  {...register('phone')}
                  isInvalid={!!errors.phone}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Row className="g-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Rue</Form.Label>
                <Form.Control disabled={isDisabled} {...register('addressStreet')} />
              </Form.Group>
            </Col>

            <Col md={2}>
              <Form.Group>
                <Form.Label>Numéro</Form.Label>
                <Form.Control disabled={isDisabled} {...register('addressNumber')} />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label>Code postal</Form.Label>
                <Form.Control
                  disabled={isDisabled}
                  {...register('addressZip')}
                  isInvalid={!!errors.addressZip}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.addressZip?.message}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Ville</Form.Label>
                <Form.Control disabled={isDisabled} {...register('addressCity')} />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label>Pays</Form.Label>
                <Form.Select disabled={isDisabled} {...register('addressCountry')}>
                  {countryOptions.map((x) => (
                    <option key={x} value={x}>
                      {x === '' ? 'Sélectionner' : x}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <hr />

          <Form.Group className="mb-3">
            <Form.Label>Notes</Form.Label>
            <Form.Control disabled={isDisabled} as="textarea" rows={3} {...register('note')} />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="link" onClick={onClose} disabled={submitting}>
            Annuler
          </Button>

          <Button type="submit" variant="primary" disabled={isDisabled}>
            {submitting ? (
              <>
                <Spinner as="span" animation="border" size="sm" />{' '}
                {mode === 'create' ? 'Création...' : 'Enregistrement...'}
              </>
            ) : mode === 'create' ? (
              'Créer un patient'
            ) : (
              'Enregistrer les modifications'
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}
