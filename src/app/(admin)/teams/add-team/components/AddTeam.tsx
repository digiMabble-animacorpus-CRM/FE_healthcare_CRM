'use client';

import { useForm, Controller, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row, Form } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

// Helpers
import { createTeamMember, TeamMemberUpdatePayload, updateTeamMember } from '@/helpers/team-members';
import { TeamMemberCreatePayload } from '@/types/data';

// ✅ Validation schema
const schema = yup.object({
  first_name: yup.string().required('First name required'),
  last_name: yup.string().required('Last name required'),
  full_name: yup.string().required('Full name required'),
  job_1: yup.string().nullable().required('At least one job title required'),
  who_am_i: yup.string().required('About me required'),
  contact_email: yup.string().email().required('Contact email required'),
  contact_phone: yup.string().required('Contact phone required'),
  languages_spoken: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Select at least one language')
    .required(),
  specializations: yup
    .array()
    .of(yup.string().required())
    .min(1, 'Add at least one specialization')
    .required(),
});

type TeamsFormValues = yup.InferType<typeof schema> &
  Partial<Omit<TeamMemberUpdatePayload, keyof yup.InferType<typeof schema>>>;

interface Props {
  defaultValues?: Partial<TeamsFormValues>;
  isEdit?: boolean;
}

const AddTeam = ({ defaultValues, isEdit }: Props) => {
  const router = useRouter();

  const methods = useForm<TeamsFormValues>({
    resolver: yupResolver(schema),
    defaultValues: defaultValues || {
      first_name: '',
      last_name: '',
      full_name: '',
      job_1: '',
      who_am_i: '',
      contact_email: '',
      contact_phone: '',
      languages_spoken: [],
      specializations: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  const onSubmit = async (data: TeamsFormValues) => {
    try {
      if (isEdit && data.team_id) {
        await updateTeamMember(data.team_id, data as TeamMemberUpdatePayload);
      } else {
        await createTeamMember(data as TeamMemberCreatePayload);
      }
      router.push('/(admin)/teams');
    } catch (err) {
      console.error('Error saving team member:', err);
    }
  };

  return (
    <FormProvider {...methods}>
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{isEdit ? 'Edit Team Member' : 'Add Team Member'}</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>First Name</Form.Label>
                  <Controller
                    name="first_name"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} isInvalid={!!errors.first_name} />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.first_name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Last Name</Form.Label>
                  <Controller
                    name="last_name"
                    control={control}
                    render={({ field }) => (
                      <Form.Control {...field} isInvalid={!!errors.last_name} />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.last_name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            {/* About Me */}
            <Row className="mt-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label>About Me</Form.Label>
                  <Controller
                    name="who_am_i"
                    control={control}
                    render={({ field }) => (
                      <Form.Control
                        as="textarea"
                        rows={3}
                        {...field}
                        isInvalid={!!errors.who_am_i}
                      />
                    )}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.who_am_i?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>
          </CardBody>
        </Card>

        <Button type="submit" className="mt-3">
          {isEdit ? 'Update' : 'Create'}
        </Button>
      </Form>
    </FormProvider>
  );
};

export default AddTeam;
