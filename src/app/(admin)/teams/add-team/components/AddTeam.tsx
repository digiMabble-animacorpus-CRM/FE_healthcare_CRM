'use client';

import { useEffect, useState } from 'react';
import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Spinner } from 'react-bootstrap';
import { useRouter } from 'next/navigation';

import TextFormInput from '@/components/from/TextFormInput';
import TextAreaFormInput from '@/components/from/TextAreaFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import DropzoneFormInput from '@/components/from/DropzoneFormInput';
import { getTherapistById, createTherapist, updateTherapist } from '@/helpers/therapist';
import { createTeamMember, getTeamMemberById, updateTeamMember} from '@/helpers/team-members';

type TeamsFormValues = {
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
  consultations: string;
  office_address: string;
  contact_email: string;
  contact_phone: string;
  schedule: Record<string, string>; // flexible object { monday: "9am-5pm" }
  about?: string | null;
  languages_spoken: string[];
  payment_methods?: string[];
  diplomas_and_training: string[];
  specializations: string[];
  website: string;
  frequently_asked_questions: Record<string, string>;
  calendar_links?: string[];
  photo?: string;
  tags?: any[];
  certificationFiles: File[];
};

const schema: yup.ObjectSchema<TeamsFormValues> = yup.object({
  first_name: yup.string().required('First name required'),
  last_name: yup.string().required('Last name required'),
  full_name: yup.string().required('Full name required'),
  job_1: yup.string().nullable().optional(),
  job_2: yup.string().nullable().optional(),
  job_3: yup.string().nullable().optional(),
  job_4: yup.string().nullable().optional(),
  specific_audience: yup.string().nullable().optional(),
  specialization_1: yup.string().nullable().optional(),
  who_am_i: yup.string().required('About me required'),
  consultations: yup.string().required('Consultations required'),
  office_address: yup.string().required('Center address required'),
  contact_email: yup.string().email().required('Contact email required'),
  contact_phone: yup.string().required('Contact phone required'),
  schedule: yup.object().required(),
  about: yup.string().nullable().optional(),
  languages_spoken: yup.array().of(yup.string()).required(),
  payment_methods: yup.array().of(yup.string()).optional(),
  diplomas_and_training: yup.array().of(yup.string()).required(),
  specializations: yup.array().of(yup.string()).required(),
  website: yup.string().required('Website required'),
  frequently_asked_questions: yup.object().required(),
  calendar_links: yup.array().of(yup.string()).optional(),
  photo: yup.string().optional(),
  tags: yup.array().of(yup.string()).min(1, 'Select at least one tag').required(),
  certificationFiles: yup
    .array()
    .of(yup.mixed<File>().required())
    .min(1, 'Upload at least one file')
    .required(),
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
      languages_spoken: [],
      payment_methods: [],
      diplomas_and_training: [],
      specializations: [],
      website: '',
      frequently_asked_questions: {},
      calendar_links: [],
      photo: '',
      tags: [],
      certificationFiles: [],
    },
  });

  const { control, handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getTeamMemberById(params.id)
        .then((data) => {
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
              consultations: data.consultations,
              office_address: data.office_address,
              contact_email: data.contact_email,
              contact_phone: data.contact_phone,
              schedule: data.schedule || {},
              about: data.about || '',
              languages_spoken: data.languages_spoken || [],
              payment_methods: data.payment_methods || [],
              diplomas_and_training: data.diplomas_and_training || [],
              specializations: data.specializations || [],
              website: data.website,
              frequently_asked_questions: typeof data.frequently_asked_questions === 'object' && data.frequently_asked_questions !== null
                ? data.frequently_asked_questions
                : {},
              calendar_links: data.calendar_links || [],
              photo: data.photo || '',
              tags: Array.isArray(data.tags)
                ? data.tags
                : typeof data.tags === 'function'
                  ? []
                  : Array.isArray(data.tags)
                    ? data.tags
                    : [],
              certificationFiles: [],
            };
            reset(mapped);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const onSubmit = async (formData: TeamsFormValues) => {
    try {
      // backend payload mapping

      if (isEditMode && params?.id) {
        const success = await updateTeamMember(params.id, safePayload);
        if (success) alert('Therapist updated successfully');
      } else {
        const success = await createTeamMember(safePayload);
        if (success) {
          alert('Therapist created successfully');
          reset();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('Operation failed');
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info Card */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">{isEditMode ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
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
                <TextFormInput control={control} name="job_1" label="Job Title" />
              </Col>
              <Col lg={12}>
                <TextAreaFormInput control={control} name="who_am_i" label="About Me" rows={3} />
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
                <TextFormInput control={control} name="office_address" label="Center Address" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="contact_email" label="Contact Email" />
              </Col>
              <Col lg={6}>
                <TextFormInput control={control} name="contact_phone" label="Contact Phone" />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  control={control}
                  name="languages_spoken.0"
                  label="Spoken Languages"
                />
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
    <ChoicesFormInput
      className="form-control"
      multiple
      value={field.value || []} // must be string[]
      onChange={(val: string | string[]) => {
        // Ensure RHF always receives string[]
        return field.onChange(Array.isArray(val) ? val : [val]);
      }}
    >
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
};

export default AddTeam;
