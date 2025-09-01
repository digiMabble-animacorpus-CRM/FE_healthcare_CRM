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
  team_id: string;
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
  schedule: Record<string, string | null>;
  about: string;
  languages_spoken: string[];
  payment_methods: string[];
  diplomas_and_training: string[];
  specializations: string[];
  website: string;
  frequently_asked_questions: { question: string; answer: string }[];
  calendar_links: string[];
  photo: string; 
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
    .default([]),
  payment_methods: yup.array().of(yup.string()).optional().default([]),
  diplomas_and_training: yup.array().of(yup.string().required()).optional().default([]),
  specializations: yup.array().of(yup.string().required()).min(1, 'Add at least one specialization').required().default([]),
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
  calendar_links: yup.array().of(yup.string().url()).optional().default([]),
  photo: yup.string().optional(),  
});

interface Props {
  params?: { id?: string };
}

// Convert [{question, answer}] to {question: answer}
function faqArrayToObject(faqArr: { question: string; answer: string }[]) {
  const result: Record<string, string> = {};
  faqArr.forEach(({ question, answer }) => {
    if (question) result[question] = answer || '';
  });
  return result;
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
      frequently_asked_questions: [{ question: '', answer: '' }],
      calendar_links: [],
      photo: '',     
    },
  });

  const { control, handleSubmit, reset, watch, formState } = methods;
  const { errors } = formState;

  const diplomasArray = useFieldArray<TeamsFormValues, 'diplomas_and_training'>({ control, name: 'diplomas_and_training' });
  const specializationsArray = useFieldArray<TeamsFormValues, 'specializations'>({ control, name: 'specializations' });
  const calendarLinksArray = useFieldArray<TeamsFormValues, 'calendar_links'>({ control, name: 'calendar_links' });
  const frequently_asked_questionsArray = useFieldArray<TeamsFormValues, 'frequently_asked_questions'>({ control, name: 'frequently_asked_questions' });

  useEffect(() => {
    if (isEditMode && params?.id) {
      setLoading(true);
      getTeamMemberById(params.id)
        .then((data) => {
          if (data) {
            const mapped: TeamsFormValues = {
              first_name: data.first_name || '',
              last_name: data.last_name || '',
              full_name: data.full_name || '',
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
              schedule: data.schedule && Object.keys(data.schedule).length ? data.schedule : { Monday: '9am-5pm', Tuesday: '9am-5pm' },
              about: data.about || '',
              languages_spoken: Array.isArray(data.languages_spoken) ? data.languages_spoken : [],
              payment_methods: Array.isArray(data.payment_methods) ? data.payment_methods : [],
              diplomas_and_training: Array.isArray(data.diplomas_and_training) ? data.diplomas_and_training : [],
              specializations: Array.isArray(data.specializations) ? data.specializations : [],
              website: data.website || '',
              frequently_asked_questions:
                data.frequently_asked_questions && typeof data.frequently_asked_questions === 'object'
                  ? Object.entries(data.frequently_asked_questions).map(([question, answer]) => ({
                      question,
                      answer: typeof answer === 'string' ? answer : (answer ? String(answer) : ''),
                    }))
                  : [{ question: '', answer: '' }],
              calendar_links: Array.isArray(data.calendar_links) ? data.calendar_links : [],
              photo: data.photo || '',
              team_id: data.team_id || '',
            };
            reset(mapped);
          }
        })
        .catch((error) => {
          console.error('Failed to fetch team member data:', error);
        })
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  useEffect(() => {
    const subscription = watch((value) => {
      // Debug: Uncomment to log form value changes
      // console.log('Form values changed:', value);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    // Debug: Uncomment to log errors
    // console.log('Form errors:', errors);
  }, [errors]);

  const mapFormDataToCreatePayload = (formData: TeamsFormValues): TeamMemberCreatePayload => {
    const faqObj = faqArrayToObject(formData.frequently_asked_questions || []);
    return {
      teamId: formData.team_id || '',
      firstName: formData.first_name,
      lastName: formData.last_name,
      fullName: formData.full_name,
      job1: formData.job_1 || null,
      job2: formData.job_2 || null,
      job3: formData.job_3 || null,
      job4: formData.job_4 || null,
      specificAudience: formData.specific_audience || null,
      specialization1: formData.specialization_1 || null,
      whoAmI: formData.who_am_i,
      consultations: formData.consultations,
      officeAddress: formData.office_address,
      contactEmail: formData.contact_email,
      contactPhone: formData.contact_phone,
      schedule: {
        text: formData.schedule && Object.keys(formData.schedule).length ? JSON.stringify(formData.schedule) : null,
      },
      about: formData.about || null,
      languagesSpoken: formData.languages_spoken,
      paymentMethods: formData.payment_methods,
      diplomasAndTraining: formData.diplomas_and_training,
      specializations: formData.specializations,
      website: formData.website,
      frequentlyAskedQuestions: Object.keys(faqObj).length ? JSON.stringify(faqObj) : null,
      calendarLinks: formData.calendar_links,
      photo: formData.photo || '',
    };
  };

  const onSubmit = async (formData: TeamsFormValues) => {
    try {
      if (isEditMode && params?.id) {
        const updatePayload: TeamMemberUpdatePayload = transformToBackendDto(formData);
        const success = await updateTeamMember(params.id, updatePayload);
        if (success) {
          alert('Team member updated successfully');
        }
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
