'use client';
import { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import DropzoneFormInput from '@/components/from/DropzoneFormInput';
import { getTherapistById } from '@/helpers/therapist';

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
  firstName: yup.string().required('First name required'),
  lastName: yup.string().required('Last name required'),
  fullName: yup.string().required('Full name required'),
  photo: yup.string().optional(),
  jobTitle: yup.string().required('Job title required'),
  targetAudience: yup.string().nullable().optional(),
  specialization1: yup.string().nullable().optional(),
  specialization2: yup.string().nullable().optional(),
  aboutMe: yup.string().required('About me required'),
  consultations: yup.string().required('Consultations required'),
  centerAddress: yup.string().required('Center address required'),
  centerEmail: yup.string().email('Invalid email').required('Center email required'),
  centerPhoneNumber: yup.string().required('Center phone required'),
  contactEmail: yup.string().email('Invalid email').required('Contact email required'),
  contactPhone: yup.string().required('Contact phone required'),
  schedule: yup.string().required('Schedule required'),
  about: yup.string().nullable().optional(),
  spokenLanguages: yup.string().required('Spoken languages required'),
  paymentMethods: yup.string().optional(),
  degreesAndTraining: yup.string().required('Degrees & training required'),
  specializations: yup.string().required('Specializations required'),
  website: yup.string().required('Website required'),
  faq: yup.string().required('FAQ required'),
  agendaLinks: yup.string().nullable().optional(),
  rosaLink: yup.string().nullable().optional(),
  googleAgendaLink: yup.string().nullable().optional(),
  appointmentStart: yup.string().nullable().optional(),
  appointmentEnd: yup.string().nullable().optional(),
  appointmentAlert: yup.string().nullable().optional(),
  availability: yup.array().of(
    yup.object({
      day: yup.string().required('Day is required'),
      from: yup.string().required('Start time is required'),
      to: yup.string().required('End time is required'),
    }),
  ),
  tags: yup.array().of(yup.string().required()).min(1, 'Select at least one tag').required(),
  certificationFiles: yup.array().of(yup.mixed<File>().required()).min(1, 'Upload at least one file').required(),
});

interface Props {
  params?: { id?: string };
}

const AddTeam = ({ params }: Props) => {
  const router = useRouter();
  const isEditMode = !!params?.id;
  const [loading, setLoading] = useState<boolean>(isEditMode);

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

  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getTherapistById(params.id)
        .then((data) => {
          if (data) {
            reset({
              firstName: data.first_name || '',
              lastName: data.last_name || '',
              fullName: data.full_name || '',
              photo: data.photo || '',
              jobTitle: data.job_1 || '',
              targetAudience: data.specific_audience || '',
              specialization1: data.specialization_1 || '',
              specialization2: data.job_2 || '',
              aboutMe: data.who_am_i || '',
              consultations: data.consultations || '',
              centerAddress: data.office_address || '',
              centerEmail: data.center_email || data.contact_email || '',
              centerPhoneNumber: data.center_phone_number || '',
              contactEmail: data.contact_email || '',
              contactPhone: data.contact_phone || '',
              schedule: typeof data.schedule === 'object'
                ? Object.entries(data.schedule).map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`).join(', ')
                : '',
              about: data.about || '',
              spokenLanguages: Array.isArray(data.languages_spoken) ? data.languages_spoken.join(', ') : '',
              paymentMethods: Array.isArray(data.payment_methods) ? data.payment_methods.join(', ') : '',
              degreesAndTraining: Array.isArray(data.diplomas_and_training) ? data.diplomas_and_training.join(', ') : '',
              specializations: Array.isArray(data.specializations) ? data.specializations.join(', ') : '',
              website: data.website || '',
              faq: data.frequently_asked_questions ? JSON.stringify(data.frequently_asked_questions, null, 2) : '',
              agendaLinks: Array.isArray(data.calendar_links) ? data.calendar_links.join(', ') : '',
              rosaLink: data.rosaLink || '',
              googleAgendaLink: data.googleAgendaLink || '',
              appointmentStart: data.appointmentStart || '',
              appointmentEnd: data.appointmentEnd || '',
              appointmentAlert: data.appointmentAlert || '',
              availability: data.availability || [],
              tags: Array.isArray(data.tags) ? data.tags : [],
              certificationFiles: [],
            });
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const parseDelimitedString = (input: string | undefined) =>
    input?.split(',').map((v) => v.trim()).filter(Boolean) || [];

  const parseFAQ = (input: string) => {
    try {
      return JSON.parse(input);
    } catch {
      return {};
    }
  };

  const parseSchedule = (input: string) => {
    const obj: Record<string, string> = {};
    input.split(',').forEach((segment) => {
      const [day, time] = segment.split(':').map((s) => s.trim());
      if (day && time) {
        obj[day.toLowerCase()] = time;
      }
    });
    return obj;
  };

  const onSubmit = async (data: TherapistFormValues) => {
    try {
      setLoading(true);

      // Upload certification files first
      let certificationFileUrls: string[] = [];
      if (data.certificationFiles && data.certificationFiles.length > 0) {
        const formData = new FormData();
        data.certificationFiles.forEach((file) => {
          formData.append('certificationFiles', file);
        });

        const fileRes = await fetch('http://localhost:8080/api/v1/team-members/certifications', {
          method: 'POST',
          body: formData,
        });

        if (!fileRes.ok) {
          throw new Error('File upload failed');
        }
        const fileUploadResponse = await fileRes.json();
        certificationFileUrls = fileUploadResponse.files || [];
      }

      // Prepare payload
      const payload: any = {
        last_name: data.lastName,
        first_name: data.firstName,
        full_name: data.fullName,
        job_1: data.jobTitle,
        specific_audience: data.targetAudience || undefined,
        specialization_1: data.specialization1 || undefined,
        job_2: data.specialization2 || undefined,
        who_am_i: data.aboutMe,
        consultations: data.consultations,
        office_address: data.centerAddress,
        center_email: data.centerEmail,
        center_phone_number: data.centerPhoneNumber,
        contact_email: data.contactEmail,
        contact_phone: data.contactPhone,
        schedule: parseSchedule(data.schedule),
        about: data.about || undefined,
        languages_spoken: parseDelimitedString(data.spokenLanguages),
        payment_methods: parseDelimitedString(data.paymentMethods),
        diplomas_and_training: parseDelimitedString(data.degreesAndTraining),
        specializations: parseDelimitedString(data.specializations),
        website: data.website,
        frequently_asked_questions: parseFAQ(data.faq),
        calendar_links: parseDelimitedString(data.agendaLinks ?? undefined),
        photo: data.photo || undefined,
        rosaLink: data.rosaLink || undefined,
        googleAgendaLink: data.googleAgendaLink || undefined,
        appointmentStart: data.appointmentStart || undefined,
        appointmentEnd: data.appointmentEnd || undefined,
        appointmentAlert: data.appointmentAlert || undefined,
        availability: data.availability || [],
        tags: data.tags || [],
        certificationFiles: certificationFileUrls,
      };

      // Choose method and endpoint based on mode
      const url = isEditMode
        ? `http://localhost:8080/api/v1/team-members/${params?.id}`
        : 'http://localhost:8080/api/v1/team-members';
      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Failed to submit');
      }

      alert(`Therapist ${isEditMode ? 'updated' : 'created'} successfully`);
      reset();
      router.back();
    } catch (error: any) {
      console.error(error);
      alert(`Submit error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info Card */}
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
        {/* Contact Info Card */}
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
              <Col lg={6}>
                <TextFormInput control={control} name="spokenLanguages" label="Spoken Languages (comma separated)" />
              </Col>
            </Row>
          </CardBody>
        </Card>
        {/* Tags Card */}
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
        {/* Availability Card */}
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
                    name={`availability.${index}.day`}
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
                </Col>
                <Col lg={3}>
                  <Controller
                    control={control}
                    name={`availability.${index}.from`}
                    render={({ field }) => <input type="time" className="form-control" {...field} />}
                  />
                </Col>
                <Col lg={3}>
                  <Controller
                    control={control}
                    name={`availability.${index}.to`}
                    render={({ field }) => <input type="time" className="form-control" {...field} />}
                  />
                </Col>
                <Col lg={2}>
                  <Button variant="danger" onClick={() => remove(index)}>
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="outline-primary" onClick={() => append({ day: '', from: '', to: '' })}>
              Add Availability
            </Button>
          </CardBody>
        </Card>
        {/* Certification Files */}
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
        <div className="mb-3 rounded">
          <Row className="justify-content-end g-2 mt-2">
            <Col lg={2}>
              <Button type="submit" variant="outline-primary" className="w-100">
                {isEditMode ? 'Update' : 'Create'} Therapist
              </Button>
            </Col>
            <Col lg={2}>
              <Button variant="danger" className="w-100" onClick={() => router.back()}>
                Cancel
              </Button>
            </Col>
          </Row>
        </div>
      </form>
    </FormProvider>
  );