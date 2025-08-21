'use client';

import { useEffect, useState, useMemo } from 'react';
import { useForm, Controller, FormProvider, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';

import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import DropzoneFormInput from '@/components/from/DropzoneFormInput';
import {
  getTherapistById,
  createTherapist,
  updateTherapist,
} from '@/helpers/therapist';
import { getAllLanguages } from '@/helpers/languages';
import type { LanguageType } from '@/types/data';
import { TherapistUpdatePayload } from '@/helpers/therapist';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

type AvailabilitySlot = {
  day: string;
  from: string;
  to: string;
};

type TherapistFormValues = {
  firstName: string;
  lastName: string;
  fullName: string;
  photo?: string;
  jobTitle: string;
  targetAudience?: string | null;
  specialization1?: string | null;
  specialization2?: string | null;
  aboutMe: string;
  consultations: string;
  centerAddress: string;
  centerEmail: string;
  centerPhoneNumber: string;
  contactEmail: string;
  contactPhone: string;
  schedule: string;
  about?: string | null;
  spokenLanguages: string;
  paymentMethods?: string;
  degreesAndTraining: string;
  specializations: string;
  website: string;
  faq: string;
  agendaLinks?: string | null;
  rosaLink?: string | null;
  googleAgendaLink?: string | null;
  appointmentStart?: string | null;
  appointmentEnd?: string | null;
  appointmentAlert?: string | null;
  availability?: AvailabilitySlot[];
  tags?: string[];
  certificationFiles: File[];
};

const schema: yup.ObjectSchema<TherapistFormValues> = yup.object({
  firstName: yup.string().optional(),
  lastName: yup.string().optional(),
  fullName: yup.string().optional(),
  jobTitle: yup.string().optional(),
  aboutMe: yup.string().optional(),
  // consultations: yup.string().optional(),
  centerAddress: yup.string().optional(),
  centerEmail: yup.string().email('Invalid email').optional(),
  centerPhoneNumber: yup.string().optional(),
  contactEmail: yup.string().email('Invalid email').optional(),
  contactPhone: yup.string().optional(),
  // schedule: yup.string().optional(),
  spokenLanguages: yup.string().optional(),
  // degreesAndTraining: yup.string().optional(),
  // specializations: yup.string().optional(),
  // website: yup.string().optional(),
  faq: yup.string().optional(),
  availability: yup.array().of(
    yup.object({
      day: yup.string().optional(),
      from: yup.string().optional(),
      to: yup.string().optional(),
    })
  ).optional(),
  tags: yup.array().of(yup.string()).optional(),
  certificationFiles: yup.array().of(yup.mixed<File>().optional()).optional(),
});


interface Props {
  params?: { id?: string };
}

const AddTherapist = ({ params }: Props) => {
  const router = useRouter();
  const isEditMode = !!params?.id;
  const [loading, setLoading] = useState<boolean>(isEditMode);

  const allLanguages = useMemo<LanguageType[]>(() => getAllLanguages(), []);

  const methods = useForm<TherapistFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      firstName: '',
      lastName: '',
      fullName: '',
      photo: '',
      jobTitle: '',
      targetAudience: '',
      specialization1: '',
      specialization2: '',
      aboutMe: '',
      consultations: '',
      centerAddress: '',
      centerEmail: '',
      centerPhoneNumber: '',
      contactEmail: '',
      contactPhone: '',
      schedule: '',
      about: '',
      spokenLanguages: '',
      paymentMethods: '',
      degreesAndTraining: '',
      specializations: '',
      website: '',
      faq: '',
      agendaLinks: '',
      rosaLink: '',
      googleAgendaLink: '',
      appointmentStart: '',
      appointmentEnd: '',
      appointmentAlert: '',
      availability: [],
      tags: [],
      certificationFiles: [],
    },
  });

  const { control, handleSubmit, reset } = methods;
  const { fields: availabilityFields, append, remove } = useFieldArray({
    control,
    name: 'availability',
  });

  // Load edit data
  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getTherapistById(params.id)
        .then((data) => {
          if (data) {
            const mapped: TherapistFormValues = {
              ...data,
              tags: data.tags || [],
              certificationFiles: [],
              availability: data.availability || [],
            };
            reset(mapped);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  // Submit handler
// Submit handler
const onSubmit = async (data: TherapistFormValues) => {
  try {
    const payload: TherapistUpdatePayload = {
      ...data,
      // Convert date strings into ISO Date format
      appointmentStart: data.appointmentStart
        ? new Date(data.appointmentStart).toISOString()
        : null,
      appointmentEnd: data.appointmentEnd
        ? new Date(data.appointmentEnd).toISOString()
        : null,
      // Convert availability array into JSON string (if backend expects string)
      availability: data.availability
        ? JSON.stringify(
            data.availability.map((slot) => ({
              day: slot.day,
              startTime: slot.from,
              endTime: slot.to,
            }))
          )
        : null,
      tags: data.tags || [],
    };

    let success = false;

    if (data.certificationFiles?.length > 0) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          formData.append(key, value as any);
        }
      });
      data.certificationFiles.forEach((file) =>
        formData.append('certificationFiles', file)
      );

      success = isEditMode && params?.id
        ? await updateTherapist(params.id, formData)
        : await createTherapist(formData);
    } else {
      success = isEditMode && params?.id
        ? await updateTherapist(params.id, payload)
        : await createTherapist(payload);
    }

    if (success) {
      alert(isEditMode ? 'Therapist updated successfully' : 'Therapist created successfully');
      if (isEditMode) router.back();
      else reset();
    } else {
      alert('Therapist created successfully');
    }
  } catch (error) {
    console.error('Submit error:', error);
    alert('Operation failed');
  }
};


  if (loading)
    return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">{isEditMode ? 'Edit Therapist' : 'Add Therapist'}</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <TextFormInput control={control} name="firstName" label="First Name" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="lastName" label="Last Name" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="fullName" label="Full Name" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="jobTitle" label="Job Title" />
              </Col>
              <Col lg={12}>
                <TextAreaFormInput control={control} name="aboutMe" label="About Me" rows={3} />
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Contact Info */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Contact Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <TextFormInput control={control} name="centerAddress" label="Center Address" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="centerEmail" label="Center Email" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="centerPhoneNumber" label="Center Phone" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="contactEmail" label="Contact Email" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="contactPhone" label="Contact Phone" />
              </Col>

              {/* Language dropdown */}
              <Col lg={6}>
                <label className="form-label">Spoken Language</label>
                <Controller
                  control={control}
                  name="spokenLanguages"
                  render={({ field }) => (
                    <ChoicesFormInput className="form-control" {...field}>
                      <option value="" disabled hidden>
                        Select Language
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
            </Row>
          </CardBody>
        </Card>

        {/* Tags */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Tags</CardTitle>
          </CardHeader>
          <CardBody>
            <Controller
              control={control}
              name="tags"
              render={({ field }) => (
                <ChoicesFormInput className="form-control" multiple {...field}>
                  <option value="Physiotherapy">Physiotherapy</option>
                  <option value="Occupational Therapy">Occupational Therapy</option>
                  <option value="Speech Therapy">Speech Therapy</option>
                  <option value="Cognitive Behavioral Therapy">CBT</option>
                  <option value="Psychotherapy">Psychotherapy</option>
                </ChoicesFormInput>
              )}
            />
          </CardBody>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Availability</CardTitle>
          </CardHeader>
          <CardBody>
            {availabilityFields.map((item, index) => (
              <Row key={item.id} className="mb-2 align-items-end">
                <Col lg={4}>
               <Controller
  control={control}
  name={`availability.${index}.day`}   // ✅ correct string interpolation
  render={({ field }) => (
    <select className="form-control" {...field}>
      <option value="" disabled>
        Select Day
      </option>
      {days.map((day) => (
        <option key={day} value={day}>
          {day}
        </option>
      ))}
    </select>
  )}
/>

<Controller
  control={control}
  name={`availability.${index}.from`}   // ✅
  render={({ field }) => (
    <input type="time" className="form-control" {...field} />
  )}
/>

<Controller
  control={control}
  name={`availability.${index}.to`}   // ✅
  render={({ field }) => (
    <input type="time" className="form-control" {...field} />
  )}
/>

                </Col>
                <Col lg={2}>
                  <Button variant="danger" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              variant="outline-primary"
              onClick={() => append({ day: '', from: '', to: '' })}
            >
              Add Availability
            </Button>
          </CardBody>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Certifications / Licenses</CardTitle>
          </CardHeader>
          <CardBody>
            <Controller
              control={control}
              name="certificationFiles"
              render={({ field }) => (
                <DropzoneFormInput
                  className="py-5"
                  text="Drop your certification files here or click to browse"
                  showPreview
                  onFileUpload={(files) => field.onChange(files)}
                />
              )}
            />
          </CardBody>
        </Card>

        {/* Buttons */}
        <div className="mb-3 rounded">
          <Row className="justify-content-end g-2 mt-2">
            <Col lg={2}>
              <Button type="submit" variant="outline-primary" className="w-100">
                {isEditMode ? 'Update' : 'Create'} Therapist
              </Button>
            </Col>
            <Col lg={2}>
              <Button
                type="button"
                variant="danger"
                className="w-100"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </Col>
          </Row>
        </div>
      </form>
    </FormProvider>
  );
};

export default AddTherapist;