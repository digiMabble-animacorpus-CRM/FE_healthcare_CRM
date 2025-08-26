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
  tags: string[];
};

const schema: yup.ObjectSchema<TeamsFormValues> = yup.object({
  first_name: yup.string().required('First name required'),
  last_name: yup.string().required('Last name required'),
  full_name: yup.string().required('Full name required'),
  job_1: yup.string().nullable().required('At least one job title required'),
  who_am_i: yup.string().required('About me required'),
  contact_email: yup.string().email().required('Contact email required'),
  contact_phone: yup.string().required('Contact phone required'),
  languages_spoken: yup.array().of(yup.string()).min(1, 'Select at least one language').required(),
  specializations: yup.array().of(yup.string()).min(1, 'Add at least one specialization').required(),
}).required();

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
      languages_spoken: [''],
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

  const { control, handleSubmit, reset, watch, formState: { errors } } = methods;

  // Dynamic arrays
  const diplomasArray = useFieldArray({ control, name: 'diplomas_and_training' });
  const specializationsArray = useFieldArray({ control, name: 'specializations' });
  const calendarLinksArray = useFieldArray({ control, name: 'calendar_links' });
  const faqArray = useFieldArray({ control, name: 'frequently_asked_questions' });

  // Fetch for edit
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
              schedule: data.schedule || {},
              about: data.about || '',
              languages_spoken: data.languages_spoken?.length ? data.languages_spoken : [''],
              payment_methods: data.payment_methods || [],
              diplomas_and_training: data.diplomas_and_training?.length ? data.diplomas_and_training : [''],
              specializations: data.specializations?.length ? data.specializations : [''],
              website: data.website || '',
              frequently_asked_questions: data.frequently_asked_questions?.length
                ? data.frequently_asked_questions
                : [{ question: '', answer: '' }],
              calendar_links: data.calendar_links?.length ? data.calendar_links : [''],
              photo: data.photo || '',
              tags: data.tags || [],
            };
            reset(mapped);
          }
        })
        .catch((err) => console.error('Fetch error', err))
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const onSubmit = async (formData: TeamsFormValues) => {
    try {
      if (isEditMode && params?.id) {
        const updatePayload: TeamMemberUpdatePayload = transformToBackendDto(formData);
        await updateTeamMember(params.id, updatePayload);
        alert('Team member updated successfully');
      } else {
        const createPayload: TeamMemberCreatePayload = transformToBackendDto(formData);
        await createTeamMember(createPayload);
        alert('Team member created successfully');
        reset();
      }
      router.back();
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Submit error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* form fields ... same as your existing render blocks */}
      </form>
    </FormProvider>
  );
};

export default AddTeam;
