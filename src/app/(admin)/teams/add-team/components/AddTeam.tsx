'use client';
<<<<<<< HEAD
=======

>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
import { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import DropzoneFormInput from '@/components/from/DropzoneFormInput';
<<<<<<< HEAD
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
=======
import { createTeamMember, getTeamMemberById, TeamMemberUpdatePayload, transformToBackendDto, updateTeamMember } from '@/helpers/team-members';
import { TeamMemberCreatePayload } from '@/types/data';

type TeamsFormValues = {
  team_id?: string;
  first_name: string;
  last_name: string;
  full_name: string;
  job_1?: string | null;
  job_2?: string | null;
  job_3?: string | null;
  job_4?: string | null;
  specific_audience?: string | null;
  specialization_1?: string | null;
  who_am_i: string;
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
  consultations: string;
  office_address: string;
  contact_email: string;
  contact_phone: string;
  schedule: Record<string, string | null>;
  about: string;
  languages_spoken: string[];
  payment_methods: string[];
  diplomas_and_training: string[];
  specializations: string[];
  website: string;
<<<<<<< HEAD
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
=======
  frequently_asked_questions: { question: string; answer: string }[];
  calendar_links: string[];
  photo: string;
  tags: string[];
};

const schema: yup.ObjectSchema<TeamsFormValues> = yup.object({
  first_name: yup.string().required('First name required'),
  last_name: yup.string().required('Last name required'),
  full_name: yup.string().required('Full name required'),
  job_1: yup.string().nullable().required('At least one job title required'),
  job_2: yup.string().nullable().optional(),
  job_3: yup.string().nullable().optional(),
  job_4: yup.string().nullable().optional(),
  specific_audience: yup.string().nullable().optional(),
  specialization_1: yup.string().nullable().optional(),
  who_am_i: yup.string().required('About me required'),
  consultations: yup.string().optional(),
  office_address: yup.string().optional(),
  contact_email: yup.string().email().required('Contact email required'),
  contact_phone: yup.string().required('Contact phone required'),
  schedule: yup.object().optional(),
  about: yup.string().nullable().optional(),
  languages_spoken: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one language')
    .required('Languages spoken required')
    .default(['']),
  payment_methods: yup.array().of(yup.string()).optional(),
  diplomas_and_training: yup.array().of(yup.string().required()).optional(),
  specializations: yup.array().of(yup.string().required()).min(1, 'Add at least one specialization').required(),
  website: yup.string().optional(),
  frequently_asked_questions: yup
    .array()
    .of(
      yup.object({
        question: yup.string().optional(),
        answer: yup.string().optional(),
      })
    )
    .default([{ question: '', answer: '' }]),
  calendar_links: yup.array().of(yup.string().url()).optional(),
  photo: yup.string().optional(),
  tags: yup.array().of(yup.string()).optional(),
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
});

interface Props {
  params?: { id?: string };
}

const AddTeam = ({ params }: Props) => {
  const router = useRouter();
  const isEditMode = !!params?.id;
  const [loading, setLoading] = useState<boolean>(isEditMode);

  const methods = useForm<TeamsFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      first_name: '',
      last_name: '',
      full_name: '',
      job_1: '',
      job_2: '',
      job_3: '',
      job_4: '',
      specific_audience: '',
      specialization_1: '',
      who_am_i: '',
      consultations: '',
      office_address: '',
      contact_email: '',
      contact_phone: '',
      schedule: {},
      about: '',
      languages_spoken: [''], // start with one empty item to avoid empty map
      payment_methods: [],
      diplomas_and_training: [''],
      specializations: [''],
      website: '',
      frequently_asked_questions: [{ question: '', answer: '' }],
      calendar_links: [''],
      photo: '',
      tags: [],
    },
  });

  const { control, handleSubmit, reset } = methods;
  const { fields: availabilityFields, append, remove } = useFieldArray({
    control,
    name: 'availability',
  });
  const { control, handleSubmit, reset, watch, formState } = methods;
  const { errors } = formState;

  // For dynamic list fields
  const diplomasArray = useFieldArray({ control, name: 'diplomas_and_training' });
  const specializationsArray = useFieldArray({ control, name: 'specializations' });
  const calendarLinksArray = useFieldArray({ control, name: 'calendar_links' });
  const frequently_asked_questionsArray = useFieldArray({ control, name: 'frequently_asked_questions' });

 // Fetch Team for edit mode
  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getTherapistById(params.id)
        .then((data) => {
          if (data) {
            reset({
              firstName: data.firstName || '',
              lastName: data.lastName || '',
              fullName: data.fullName || '',
              photo: data.photo || '',
              jobTitle: data.jobTitle || '',
              targetAudience: data.targetAudience || '',
              specialization1: data.specialization1 || '',
              specialization2: data.specialization2 || '',
              aboutMe: data.aboutMe || '',
              consultations: data.consultations || '',
              centerAddress: data.centerAddress || '',
              centerEmail: data.centerEmail || data.contactEmail || '',
              centerPhoneNumber: data.centerPhoneNumber || '',
              contactEmail: data.contactEmail || '',
              contactPhone: data.contactPhone || '',
              schedule: typeof data.schedule === 'object'
                ? Object.entries(data.schedule).map(([day, hours]) => `${day.charAt(0).toUpperCase() + day.slice(1)}: ${hours}`).join(', ')
                : '',
              about: data.about || '',
              spokenLanguages: Array.isArray(data.languages_spoken)
                ? data.languages_spoken.join(', ')
                : typeof data.languages_spoken === 'function'
                  ? ''
                  : (typeof data.languages_spoken === 'string' ? data.languages_spoken : ''),
              paymentMethods: Array.isArray(data.paymentMethods) ? data.paymentMethods.join(', ') : '',
              degreesAndTraining: Array.isArray(data.degreesAndTraining) ? data.degreesAndTraining.join(', ') : '',
              specializations: Array.isArray(data.specializations) ? data.specializations.join(', ') : '',
              website: data.website || '',
              faq: data.frequently_asked_questions ? JSON.stringify(data.frequently_asked_questions, null, 2) : '',
              agendaLinks: Array.isArray(data.agendaLinks) ? data.agendaLinks.join(', ') : '',
              rosaLink: data.rosaLink || '',
              googleAgendaLink: data.googleAgendaLink || '',
              appointmentStart: data.appointmentStart || '',
              appointmentEnd: data.appointmentEnd || '',
              appointmentAlert: data.appointmentAlert || '',
              availability: data.availability || [],
              tags: Array.isArray(data.tags) ? data.tags : [],
              certificationFiles: [],
            });
      console.log('Fetching team member with ID:', params.id);
      getTeamMemberById(params.id)
        .then((data) => {
          console.log('Fetched data:', data);
          if (data) {
            const mapped: TeamsFormValues = {
              first_name: data.first_name,
              last_name: data.last_name,
              full_name: data.full_name,
              job_1: data.job_1 || '',
              job_2: data.job_2 || '',
              job_3: data.job_3 || '',
              job_4: data.job_4 || '',
              specific_audience: data.specific_audience || '',
              specialization_1: data.specialization_1 || '',
              who_am_i: data.who_am_i || '',
              consultations: data.consultations || '',
              office_address: data.office_address || '',
              contact_email: data.contact_email || '',
              contact_phone: data.contact_phone || '',
              schedule: data.schedule && Object.keys(data.schedule).length
                ? data.schedule
                : { Monday: '9am-5pm', Tuesday: '9am-5pm' },
              about: data.about || '',
              languages_spoken: data.languages_spoken && data.languages_spoken.length ? data.languages_spoken : [''],
              payment_methods: data.payment_methods || [],
              diplomas_and_training: data.diplomas_and_training && data.diplomas_and_training.length ? data.diplomas_and_training : [''],
              specializations: data.specializations && data.specializations.length ? data.specializations : [''],
              website: data.website || '',
              frequently_asked_questions:
                Array.isArray(data.frequently_asked_questions) && data.frequently_asked_questions.length > 0
                  ? data.frequently_asked_questions
                  : [{ question: '', answer: '' }],
              calendar_links: data.calendar_links && data.calendar_links.length ? data.calendar_links : [''],
              photo: data.photo || '',
              tags: data.tags || [],
            };
            console.log('Resetting form with mapped values:', mapped);
            reset(mapped);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch team member data:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

<<<<<<< HEAD
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
=======
  useEffect(() => {
    const subscription = watch((value) => {
      console.log('Form values changed:', value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    console.log('Form errors:', errors);
  }, [errors]);

  const mapFormDataToCreatePayload = (formData: TeamsFormValues): TeamMemberCreatePayload => {
    console.log('Mapping form data to create payload:', formData);
    return {
      team_id: formData.team_id || '',
      first_name: formData.first_name,
      last_name: formData.last_name,
      full_name: formData.full_name,
      job_1: formData.job_1 || '',
      job_2: formData.job_2 || '',
      job_3: formData.job_3 || '',
      job_4: formData.job_4 || '',
      specific_audience: formData.specific_audience || '',
      specialization_1: formData.specialization_1 || '',
      who_am_i: formData.who_am_i,
      consultations: formData.consultations,
      office_address: formData.office_address,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      schedule: {
        text: formData.schedule ? JSON.stringify(formData.schedule) : null,
      },
      about: formData.about || '',
      languages_spoken: formData.languages_spoken,
      payment_methods: formData.payment_methods || [],
      diplomas_and_training: formData.diplomas_and_training,
      specializations: formData.specializations,
      website: formData.website,
      frequently_asked_questions: formData.frequently_asked_questions ? JSON.stringify(formData.frequently_asked_questions) : null,
      calendar_links: formData.calendar_links || [],
      photo: formData.photo || '',      
    };
  };

  const onSubmit = async (formData: TeamsFormValues) => {
    console.log('Form submission triggered with data:', formData);
    try {
      if (isEditMode && params?.id) {
        console.log('Updating team member with id:', params.id);
        const updatePayload: TeamMemberUpdatePayload = transformToBackendDto(formData);
        const success = await updateTeamMember(params.id, updatePayload);
        if (success) {
          alert('Team member updated successfully');
          console.log('Update successful');
        }
      } else {
        console.log('Creating a new team member');
        const createPayload = mapFormDataToCreatePayload(formData);
        const success = await createTeamMember(createPayload);
        if (success) {
          alert('Team member created successfully');
          reset();
          console.log('Creation successful and form reset');
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
        }
        const fileUploadResponse = await fileRes.json();
        certificationFileUrls = fileUploadResponse.files || [];
      }
<<<<<<< HEAD

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

      alert(`Details ${isEditMode ? 'updated' : 'created'} successfully`);
      reset();
      router.back();
    } catch (error: any) {
      console.error(error);
      alert(`Submit error: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
=======
    } catch (error: any) {
      console.error('Submit error:', error);
      if (error?.message) {
        console.error('Error message:', error.message);
      }
      alert('Operation failed');
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
<<<<<<< HEAD
            <CardTitle as="h4">{isEditMode ? 'Edit Details' : 'Add Details'}</CardTitle>
=======
            <CardTitle as="h4">{isEditMode ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <TextFormInput control={control} name="first_name" label="First Name" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="last_name" label="Last Name" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="full_name" label="Full Name" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="job_1" label="Job Title 1" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="job_2" label="Job Title 2" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="job_3" label="Job Title 3" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="job_4" label="Job Title 4" />
              </Col>
              <Col lg={12}>
                <TextFormInput control={control} name="specific_audience" label="Specific Audience" />
              </Col>
              <Col lg={12}>
                <TextFormInput control={control} name="specialization_1" label="Primary Specialization" />
              </Col>
              <Col lg={12}>
                <TextAreaFormInput control={control} name="who_am_i" label="About Me" rows={3} />
              </Col>
            </Row>
          </CardBody>
        </Card>
<<<<<<< HEAD
=======

        {/* Consultations */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Consultations</CardTitle>
          </CardHeader>
          <CardBody>
            <TextAreaFormInput control={control} name="consultations" label="Consultations" rows={3} />
          </CardBody>
        </Card>

>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
        {/* Contact Info Card */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Contact Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <TextFormInput control={control} name="office_address" label="Center Address" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="contact_email" label="Contact Email" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="contact_phone" label="Contact Phone" />
              </Col>
              <Col lg={6}>
<<<<<<< HEAD
                <TextFormInput control={control} name="contactEmail" label="Contact Email" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="contactPhone" label="Contact Phone" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="spokenLanguages" label="Spoken Languages (comma separated)" />
=======
                {/* Support multiple languages */}
                {methods.watch('languages_spoken').map((_, index) => (
                  <TextFormInput
                    key={index}
                    control={control}
                    name={`languages_spoken.${index}`}
                    label={`Spoken Language ${index + 1}`}
                  />
                ))}
                <Button variant="link" onClick={() => methods.setValue('languages_spoken', [...methods.getValues('languages_spoken'), ''])}>
                  + Add Language
                </Button>
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
              </Col>
            </Row>
          </CardBody>
        </Card>
<<<<<<< HEAD
        {/* Tags Card */}
=======

        {/* Payment Methods */}
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
        <Card>
          <CardHeader>
            <CardTitle as="h4">Payment Methods</CardTitle>
          </CardHeader>
          <CardBody>
            <Controller
              control={control}
              name="payment_methods"
              render={({ field }) => (
                <ChoicesFormInput className="form-control" multiple value={field.value || []} onChange={field.onChange}>
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="PayPal">PayPal</option>
                </ChoicesFormInput>
              )}
            />
          </CardBody>
        </Card>
<<<<<<< HEAD
        {/* Availability Card */}
=======

        {/* Diplomas and Training */}
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
        <Card>
          <CardHeader>
            <CardTitle as="h4">Diplomas and Training</CardTitle>
          </CardHeader>
          <CardBody>
<<<<<<< HEAD
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
=======
            {diplomasArray.fields.map((field, index) => (
              <Row key={field.id} className="mb-2 align-items-center">
                <Col lg={10}>
                  <TextFormInput control={control} name={`diplomas_and_training.${index}`} label={`Diploma/Training ${index + 1}`} />
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
                </Col>
                <Col lg={2}>
                  <Button variant="danger" onClick={() => diplomasArray.remove(index)}>
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="link" onClick={() => diplomasArray.append('')}>
              + Add Diploma/Training
            </Button>
          </CardBody>
        </Card>
<<<<<<< HEAD
        {/* Certification Files */}
=======

        {/* Specializations */}
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
        <Card>
          <CardHeader>
            <CardTitle as="h4">Specializations</CardTitle>
          </CardHeader>
          <CardBody>
<<<<<<< HEAD
            <Controller
              control={control}
              name="certificationFiles"
              render={({ field }) => (
                <DropzoneFormInput
                  className="py-5"
                  text="Drop your certification files here or click to browse"
                  showPreview
                  onFileUpload={(files: any) => field.onChange(files)}
                />
              )}
            />
          </CardBody>
        </Card>
=======
            {specializationsArray.fields.map((field, index) => (
              <Row key={field.id} className="mb-2 align-items-center">
                <Col lg={10}>
                  <TextFormInput control={control} name={`specializations.${index}`} label={`Specialization ${index + 1}`} />
                </Col>
                <Col lg={2}>
                  <Button variant="danger" onClick={() => specializationsArray.remove(index)}>
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="link" onClick={() => specializationsArray.append('')}>
              + Add Specialization
            </Button>
          </CardBody>
        </Card>

        {/* Website */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Website</CardTitle>
          </CardHeader>
          <CardBody>
            <TextFormInput control={control} name="website" label="Website URL" />
          </CardBody>
        </Card>

        {/* Frequently Asked Questions */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardBody>
            {watch('frequently_asked_questions').map((_, i) => (
              <Row key={i} className="mb-2">
                <Col lg={5}>
                  <TextFormInput control={control} name={`frequently_asked_questions.${i}.question`} label="Question" />
                </Col>
                <Col lg={6}>
                  <TextFormInput control={control} name={`frequently_asked_questions.${i}.answer`} label="Answer" />
                </Col>
              </Row>
            ))}
            <Button variant="link" onClick={() => frequently_asked_questionsArray.append({ question: '', answer: '' })}>
              + Add Frequently Asked Question
            </Button>
          </CardBody>
        </Card>

        {/* Calendar Links */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Calendar Links</CardTitle>
          </CardHeader>
          <CardBody>
            {calendarLinksArray.fields.map((field, index) => (
              <Row key={field.id} className="mb-2 align-items-center">
                <Col lg={10}>
                  <TextFormInput control={control} name={`calendar_links.${index}`} label={`Calendar Link ${index + 1}`} />
                </Col>
                <Col lg={2}>
                  <Button variant="danger" onClick={() => calendarLinksArray.remove(index)}>
                    Remove
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="link" onClick={() => calendarLinksArray.append('')}>
              + Add Calendar Link
            </Button>
          </CardBody>
        </Card>

        {/* Submit Buttons */}
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
        <div className="mb-3 rounded">
          <Row className="justify-content-end g-2 mt-2">
            <Col lg={2}>
              <Button type="submit" variant="outline-primary" className="w-100">
                {isEditMode ? 'Update' : 'Create'} Team Member
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
};
<<<<<<< HEAD
=======

export default AddTeam;
>>>>>>> 858838c54e6b3c9535f397b23108a44952427756
