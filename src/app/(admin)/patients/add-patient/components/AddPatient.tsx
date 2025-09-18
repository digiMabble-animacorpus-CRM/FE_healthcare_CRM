'use client';

import { yupResolver } from '@hookform/resolvers/yup';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Form,
  Row,
  Spinner,
} from 'react-bootstrap';
import { Controller, useForm } from 'react-hook-form';
import * as yup from 'yup';

import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import TextFormInput from '@/components/from/TextFormInput';
import { getAllBranch } from '@/helpers/branch';
import { getAllLanguages } from '@/helpers/languages';
import { createPatient, getPatientById, updatePatient } from '@/helpers/patient';
import type { BranchType, LanguageType, PatientType } from '@/types/data';

interface Props {
  params?: { id?: string };
  onSubmitHandler?: (data: PatientType) => void;
}

export const schema: yup.ObjectSchema<Partial<any>> = yup
  .object({
    id: yup.string(),
    _id: yup.string(),
    visits: yup.number(),
    prescriptions: yup.number(),
    bills: yup.number(),
    createdAt: yup.string(),
    primarypatientrecordid: yup.string(),

    // required fields
    firstname: yup.string().required('Veuillez saisir votre prénom'),
    lastname: yup.string().required('Veuillez entrer votre nom de famille'),
    middlename: yup.string(),
    emails: yup.string().email('E-mail invalide').required('Veuillez saisir votre adresse e-mail'),
    phones: yup.array().of(yup.string().optional()),

    birthdate: yup.string().required('Veuillez saisir votre date de naissance'),
    street: yup.string().optional(),
    note: yup.string().optional(),
    zipcode: yup.string().optional(),
    legalgender: yup.string().optional(),
    language: yup.string().optional(),
    city: yup.string().optional(),
    country: yup.string().optional(),
    ssin: yup.string(),
    status: yup.string().optional(),
    mutualitynumber: yup.string().optional(),
    mutualityregistrationnumber: yup.string().optional(),
    branch: yup.string(),
    tags: yup.array().of(yup.string().optional()),
  })
  .required()
  .noUnknown(true);

const AddPatient = ({ params, onSubmitHandler }: Props) => {
  const router = useRouter();
  const isEditMode = !!params?.id;

  const [loading, setLoading] = useState<boolean>(isEditMode);
  const [defaultValues, setDefaultValues] = useState<Partial<PatientType>>({
    createdAt: '',
    _id: '',
    birthdate: '',
    city: '',
    country: '',
    emails: '',
    firstname: '',
    id: '',
    language: '',
    lastname: '',
    legalgender: '',
    middlename: '',
    mutualitynumber: '',
    mutualityregistrationnumber: '',
    note: '',
    phones: [''],
    primarypatientrecordid: '',
    ssin: '',
    status: '',
    street: '',
    zipcode: '',
  });

  const allLanguages = useMemo<LanguageType[]>(() => getAllLanguages(), []);
  const allBranches = useMemo<BranchType[]>(() => getAllBranch(), []);
  const allTags = useMemo<string[]>(() => ['VIP', 'Regular', 'New', 'Follow-up'], []);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<Partial<PatientType>>({
    resolver: yupResolver(schema),
    defaultValues,
  });

  // Fetch patient for edit mode
  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getPatientById(params.id)
        .then((response) => {
          const patient: PatientType = response;
          if (patient) {
            const mappedPatient: Partial<PatientType> = {
              ...patient,
              phones: patient.phones?.length ? patient.phones : [''],
            };
            setDefaultValues(mappedPatient);
            reset(mappedPatient);
          }
        })
        .catch((error) => console.error('Failed to fetch patient:', error))
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const onSubmit = async (data: Partial<PatientType>) => {
    // only phones array, no number field
    const payload = {
      ...data,
      phones: data.phones?.filter((p) => p.trim() !== '') ?? [],
    };

    if (isEditMode && params?.id) {
      const success = await updatePatient(params.id, payload as any);
      if (success) {
        alert('Patient updated successfully');
        router.back();
      } else {
        alert('Failed to update patient');
      }
    } else {
      const success = await createPatient(payload as any);
      if (success) {
        alert('Patient created successfully');
        router.back();
      } else {
        alert('Failed to create patient');
      }
    }
  };

  if (loading)
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );

  return (
    <Form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">{isEditMode ? 'Modifier le patient' : 'Ajouter un patient'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name="firstname"
                label="Prénom"
                placeholder="Entre Prénom"
              />
            </Col>
            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name="lastname"
                label="Nom de famille"
                placeholder="Entrez Nom de famille"
              />
            </Col>
            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name="middlename"
                label="Deuxième prénom"
                placeholder="Entrez le deuxième prénom"
              />
            </Col>
            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name="emails"
                label="E-mail"
                placeholder="Entrez votre adresse e-mail"
              />
            </Col>

            {/* Phones */}
            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name={`phones.0`}
                label="Numéro de téléphone"
                placeholder="Entrez le numéro de téléphone"
                type="number"
              />
            </Col>

            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name="birthdate"
                label="Date de naissance"
                type="date"
              />
            </Col>

            {/* Gender */}
            <Col lg={6} className="mb-3">
              <label className="form-label">Genre</label>
              <Controller
                control={control}
                name="legalgender"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Sélectionnez le sexe
                    </option>
                    <option value="male">Mâle</option>
                    <option value="female">Femelle</option>
                    <option value="others">Others</option>
                  </ChoicesFormInput>
                )}
              />
            </Col>

            {/* Language */}
            <Col lg={6} className="mb-3">
              <label className="form-label">Language</label>
              <Controller
                control={control}
                name="language"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Sélectionnez la langue
                    </option>
                    {allLanguages.map((lang) => (
                      <option key={lang.key} value={lang.key}>
                        {lang.label}
                      </option>
                    ))}
                  </ChoicesFormInput>
                )}
              />
            </Col>

            <Col lg={6} className="mb-3">
              <TextAreaFormInput
                control={control}
                name="street"
                label="Adresse"
                placeholder="Entrez l'adresse"
                rows={3}
              />
            </Col>
            <Col lg={6} className="mb-3">
              <TextAreaFormInput
                control={control}
                name="note"
                label="Description"
                placeholder="Entrez la description"
                rows={3}
              />
            </Col>

            <Col lg={4}>
              <TextFormInput
                control={control}
                name="zipcode"
                label="Code Postal"
                placeholder="Entrez le code postal"
                type="number"
              />
            </Col>

            {/* City */}
            <Col lg={4}>
              <TextFormInput
                control={control}
                name="city"
                label="Ville"
                placeholder="Entrez la ville"
                type="text"
              />
            </Col>

            {/* Country */}
            <Col lg={4}>
              <TextFormInput
                control={control}
                name="country"
                label="Pays"
                placeholder="Entrez le pays"
                type="text"
              />
            </Col>

            <Col lg={6} className="mb-3">
              <TextFormInput control={control} name="ssin" label="SSIN" placeholder="Enter SSIN" />
            </Col>

            {/* Status */}
            <Col lg={6} className="mb-3">
              <label className="form-label">Statut</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" {...field}>
                    <option value="" disabled hidden>
                      Sélectionnez le statut
                    </option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </ChoicesFormInput>
                )}
              />
            </Col>

            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name="mutualitynumber"
                label="Numéro de Mutualité"
                placeholder="Entrez le numéro de mutualité"
              />
            </Col>
            <Col lg={6} className="mb-3">
              <TextFormInput
                control={control}
                name="mutualityregistrationnumber"
                label="Numéro de carte de résident"
                placeholder="Entrez le numéro de carte de résident"
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2 mt-2">
          <Col lg={2}>
            <Button variant="primary" type="submit" className="w-100">
              {isEditMode ? 'Mise à jour' : 'Créer'} Patient
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="danger" className="w-100" onClick={() => router.back()}>
              Annuler
            </Button>
          </Col>
        </Row>
      </div>
    </Form>
  );
};

export default AddPatient;
