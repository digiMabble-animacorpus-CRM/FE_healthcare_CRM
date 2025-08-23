'use client';

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
  consultations: string;
  office_address: string;
  contact_email: string;
  contact_phone: string;
  schedule: Record<string, string>; // flexible object { monday: "9am-5pm" }
  about: string;
  languages_spoken: string[];
  payment_methods: string[];
  diplomas_and_training: string[];
  specializations: string[];
  website: string;
  frequently_asked_questions: { question: string; answer: string }[];
  calendar_links: string[];
  photo: string;
  tags: string[];
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
  languages_spoken: yup.array()
    .of(yup.string().required())
    .min(1, 'Select at least one language')
    .required('Languages spoken required')
    .default([]),
  payment_methods: yup.array().of(yup.string()).min(1, 'Select at least one payment method').required(),
  diplomas_and_training: yup.array().of(yup.string().required()).min(1, 'Add at least one diploma or training').required(),
  specializations: yup.array().of(yup.string().required()).min(1, 'Add at least one specialization').required(),
  website: yup.string().required('Website required'),
  frequently_asked_questions: yup
      .array()
      .of(
        yup.object({
          question: yup.string().optional(),
          answer: yup.string().optional(),
        })
      ),
  calendar_links: yup.array().of(yup.string().url()).optional(),
  photo: yup.string().optional(),
  tags: yup.array().of(yup.string()).min(1, 'Select at least one tag').required(),
  certificationFiles: yup.array().of(yup.mixed<File>().required()).min(1, 'Upload at least one file').required(),
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
      diplomas_and_training: [''],   // start with one empty field
      specializations: [''],         // start with one empty field
      website: '',
      frequently_asked_questions: [{}],
      calendar_links: [''],          // start with one empty field
      photo: '',
      tags: [],
      certificationFiles: [],
    },
  });

  const { control, handleSubmit, reset, watch } = methods;

  // For dynamic list fields
  const diplomasArray = useFieldArray({ control, name: 'diplomas_and_training' });
  const specializationsArray = useFieldArray({ control, name: 'specializations' });
  const calendarLinksArray = useFieldArray({ control, name: 'calendar_links' });
  const frequently_asked_questionsArray = useFieldArray({ control, name:'frequently_asked_questions'})
  
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
              diplomas_and_training: data.diplomas_and_training.length ? data.diplomas_and_training : [''],
              specializations: data.specializations.length ? data.specializations : [''],
              website: data.website,
              frequently_asked_questions: typeof data.frequently_asked_questions === 'object' && data.frequently_asked_questions !== null ? data.frequently_asked_questions : {},
              calendar_links: data.calendar_links.length ? data.calendar_links : [''],
              photo: data.photo || '',
              tags: data.tags || [],
              certificationFiles: [], // cannot preset files for security reasons
            };
            reset(mapped);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const mapFormDataToCreatePayload = (formData: TeamsFormValues): TeamMemberCreatePayload => {
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
    try {
      if (isEditMode && params?.id) {
        const updatePayload: TeamMemberUpdatePayload = transformToBackendDto(formData);
        const success = await updateTeamMember(params.id, updatePayload);
        if (success) alert('Team member updated successfully');
      } else {
        const createPayload = mapFormDataToCreatePayload(formData);
        const success = await createTeamMember(createPayload);
        if (success) {
          alert('Team member created successfully');
          reset();
        }
      }
    } catch (error: any) {
      console.error('Submit error:', error);
      if (error?.message) {
        console.error('Error message:', error.message);
      }
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

        {/* Consultations */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Consultations</CardTitle>
          </CardHeader>
          <CardBody>
            <TextAreaFormInput control={control} name="consultations" label="Consultations" rows={3} />
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
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Payment Methods</CardTitle>
          </CardHeader>
          <CardBody>
            <Controller
              control={control}
              name="payment_methods"
              render={({ field }) => (
                <ChoicesFormInput
                  className="form-control"
                  multiple
                  value={field.value || []}
                  onChange={field.onChange}
                >
                  <option value="Cash">Cash</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="PayPal">PayPal</option>
                </ChoicesFormInput>
              )}
            />

          </CardBody>
        </Card>

        {/* Diplomas and Training */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Diplomas and Training</CardTitle>
          </CardHeader>
          <CardBody>
            {diplomasArray.fields.map((field, index) => (
              <Row key={field.id} className="mb-2 align-items-center">
                <Col lg={10}>
                  <TextFormInput control={control} name={`diplomas_and_training.${index}`} label={`Diploma/Training ${index + 1}`} />
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

        {/* Specializations */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Specializations</CardTitle>
          </CardHeader>
          <CardBody>
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

        {/* FAQ (Frequently Asked Questions) */}
        <Card>
          <CardHeader>
            <CardTitle as="h4">Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardBody>
            {/* Simple key-value FAQ input */}
            {Object.entries(watch('frequently_asked_questions')).map(([question, answer], i) => (
              <Row key={i} className="mb-2">
                <Col lg={5}>
                  <TextFormInput
                    control={control}
                    name={`frequently_asked_questions.${i}.question`}
                    label="Question"
                  />
                </Col>
                <Col lg={6}>
                  <TextFormInput
                    control={control}
                    name={`frequently_asked_questions.${i}.answer`}
                    label="Answer"
                  />
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

        {/* Submit Buttons */}
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

export default AddTeam;