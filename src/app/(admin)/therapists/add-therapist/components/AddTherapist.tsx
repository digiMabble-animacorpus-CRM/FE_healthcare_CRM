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
  startTime: string;
  endTime: string;
};

type Center = {
  center_address: string;
  center_email: string;
  center_phone_number: string;
  availability: AvailabilitySlot[];
};

export type TherapistFormValues = {
  id_pro?: string;
  first_name: string;
  last_name: string;
  photo: string;
  job_title: string;
  about_me: string;
  consultations: string;
  centers: Center[];
  contact_email: string;
  contact_phone: string;
  spoken_languages: string[];
  degrees_and_training: string[];
  specializations: string[];
  website: string;
  faq: string;
  agenda_links: string;
  tags: string[];
  certificationFiles: File[];
};

const schema: yup.ObjectSchema<TherapistFormValues> = yup.object({
  id_pro: yup.string().default(''),
  first_name: yup.string().required('First name is required'),
  last_name: yup.string().required('Last name is required'),
  photo: yup.string().default(''),
  job_title: yup.string().required('Job title is required'),
  about_me: yup.string().default(''),
  consultations: yup.string().default(''),
  centers: yup
    .array()
    .of(
      yup.object({
        center_address: yup.string().default(''),
        center_email: yup.string().email('Invalid email').default(''),
        center_phone_number: yup.string().default(''),
        availability: yup
          .array()
          .of(
            yup.object({
              day: yup.string().default(''),
              startTime: yup.string().default(''),
              endTime: yup.string().default(''),
            })
          )
          .default([]),
      })
    )
    .required('At least one center is required')
    .default([]),
  contact_email: yup.string().email('Invalid email').required('Email is required'),
  contact_phone: yup.string().required('Phone number is required'),
  // ✅ Force string[] without undefined
  spoken_languages: yup
    .array()
    .of(yup.string().required())
    .min(1, 'At least one language is required')
    .default([]),
  degrees_and_training: yup.array().of(yup.string().required()).default([]),
  specializations: yup.array().of(yup.string().required()).default([]),
  website: yup.string().default(''),
  faq: yup.string().default(''),
  agenda_links: yup.string().default(''),
  tags: yup.array().of(yup.string().required()).default([]),
  certificationFiles: yup.array().of(yup.mixed<File>().required()).default([]),
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
      first_name: '',
      last_name: '',
      photo: '',
      job_title: '',
      about_me: '',
      consultations: '',
      centers: [
        {
          center_address: '',
          center_email: '',
          center_phone_number: '',
          availability: [],
        },
      ],
      contact_email: '',
      contact_phone: '',
      spoken_languages: [],
      degrees_and_training: [],
      specializations: [],
      website: '',
      faq: '',
      agenda_links: '',
      tags: [],
      certificationFiles: [],
    },
  });

  const { control, handleSubmit, reset } = methods;
  const { fields: centerFields, append: addCenter, remove: removeCenter } = useFieldArray({
    control,
    name: 'centers',
  });

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
              centers: data.centers || [],
            };
            reset(mapped);
          }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isEditMode, params?.id, reset]);

  const onSubmit = async (data: TherapistFormValues) => {
    try {
      const payload: TherapistUpdatePayload = {
        photo: data.photo || "",
        consultations: data.consultations || "",
        specializations: data.specializations || [],
        website: data.website || "",
        faq: data.faq || "",
        firstName: data.first_name || "",
        lastName: data.last_name || "",
        jobTitle: data.job_title || "",
        aboutMe: data.about_me || "",
        contactEmail: data.contact_email || "",
        contactPhone: data.contact_phone || "",
        spokenLanguages: (data.spoken_languages || []).join(", "),
        degreesAndTraining: (data.degrees_and_training || []).join(", "),
        agendaLinks: data.agenda_links || "",
        tags: (data.tags || []).join(", "),
        centers: (data.centers || []).map((c) => ({
          centerAddress: c.center_address || "",
          centerEmail: c.center_email || "",
          centerPhoneNumber: c.center_phone_number || "",
          availability: (c.availability || []).map((slot) => ({
            day: slot.day,
            startTime: slot.startTime,
            endTime: slot.endTime,
          })),
        })),
      };

      let success = false;

      if (data.certificationFiles?.length > 0) {
        const formData = new FormData();
        Object.entries(payload).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            formData.append(key, JSON.stringify(value));
          }
        });
        data.certificationFiles.forEach((file) =>
          formData.append("certificationFiles", file)
        );

        success =
          isEditMode && params?.id
            ? await updateTherapist(params.id, formData)
            : await createTherapist(formData);
      } else {
        success =
          isEditMode && params?.id
            ? await updateTherapist(params.id, payload)
            : await createTherapist(payload);
      }

      if (success) {
        alert(isEditMode ? "Therapist updated successfully" : "Therapist created successfully");
        if (isEditMode) router.back();
        else reset();
      } else {
        alert("Operation failed");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Operation failed");
    }
  };

  if (loading)
    return <Spinner animation="border" className="my-5 d-block mx-auto" />;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Basic Info */}
         {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle as="h4">{isEditMode ? 'Edit Therapist' : 'Basic Information'}</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <TextFormInput control={control} name="first_name" label="First Name" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="last_name" label="Last Name" />
            </Col>
            
          </Row>
        
          <Row>
            <Col lg={6}>
              <TextFormInput control={control} name="contact_email" label="Contact Email" />
            </Col>
            <Col lg={6}>
              <TextFormInput control={control} name="contact_phone" label="Contact Phone" />
            </Col>
            <Col lg={12}>
              <label className="form-label">Spoken Languages</label>
              <Controller
                control={control}
                name="spoken_languages"
                render={({ field }) => (
                  <ChoicesFormInput className="form-control" multiple {...field}>
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

      {/* Professional Details */}
      <Card>
        <CardHeader>
          <CardTitle as="h4">Professional Details</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <TextFormInput control={control} name="job_title" label="Job Title" />
            </Col>
            <Col lg={12}>
              <TextAreaFormInput control={control} name="about_me" label="About Me" rows={3} />
            </Col>
            <Col lg={12}>
              <TextAreaFormInput control={control} name="consultations" label="Consultations" rows={2} />
            </Col>
            <Col lg={12}>
              <TextAreaFormInput control={control} name="degrees_and_training" label="Degrees & Training" rows={2} />
            </Col>
            <Col lg={12}>
              <TextAreaFormInput control={control} name="specializations" label="Specializations" rows={2} />
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Centers */}
      <Card>
        <CardHeader>
          <CardTitle as="h4">Centers & Availability</CardTitle>
        </CardHeader>
        <CardBody>
          {centerFields.map((center, cIndex) => (
            <div key={center.id} className="mb-3 p-3 border rounded">
              <Row>
                <Col lg={6}>
                  <TextFormInput control={control} name={`centers.${cIndex}.center_address`} label="Center Address" />
                </Col>
                <Col lg={6}>
                  <TextFormInput control={control} name={`centers.${cIndex}.center_email`} label="Center Email" />
                </Col>
                <Col lg={6}>
                  <TextFormInput
                    control={control}
                    name={`centers.${cIndex}.center_phone_number`}
                    label="Center Phone"
                  />
                </Col>
              </Row>
              <h6 className="mt-3">Availability</h6>
              <Controller
                control={control}
                name={`centers.${cIndex}.availability`}
                render={({ field }) => (
                  <div>
                    {(field.value || []).map((slot: AvailabilitySlot, i: number) => (
                      <Row key={i} className="mb-2">
                        <Col lg={4}>
                          <select
                            className="form-control"
                            value={slot.day}
                            onChange={(e) => {
                              const newSlots = [...field.value];
                              newSlots[i].day = e.target.value;
                              field.onChange(newSlots);
                            }}
                          >
                            <option value="">Select Day</option>
                            {days.map((d) => (
                              <option key={d} value={d}>
                                {d}
                              </option>
                            ))}
                          </select>
                        </Col>
                        <Col lg={3}>
                          <input
                            type="time"
                            className="form-control"
                            value={slot.startTime}
                            onChange={(e) => {
                              const newSlots = [...field.value];
                              newSlots[i].startTime = e.target.value;
                              field.onChange(newSlots);
                            }}
                          />
                        </Col>
                        <Col lg={3}>
                          <input
                            type="time"
                            className="form-control"
                            value={slot.endTime}
                            onChange={(e) => {
                              const newSlots = [...field.value];
                              newSlots[i].endTime = e.target.value;
                              field.onChange(newSlots);
                            }}
                          />
                        </Col>
                        <Col lg={2}>
                          <Button
                            variant="danger"
                            onClick={() => {
                              const newSlots = [...field.value];
                              newSlots.splice(i, 1);
                              field.onChange(newSlots);
                            }}
                          >
                            Remove
                          </Button>
                        </Col>
                      </Row>
                    ))}
                    <Button
                      variant="outline-primary"
                      onClick={() =>
                        field.onChange([...(field.value || []), { day: '', startTime: '', endTime: '' }])
                      }
                    >
                      Add Slot
                    </Button>
                  </div>
                )}
              />
              <Button variant="danger" className="mt-2" onClick={() => removeCenter(cIndex)}>
                Remove Center
              </Button>
            </div>
          ))}
          <Button
            variant="outline-success"
            onClick={() => addCenter({ center_address: '', center_email: '', center_phone_number: '', availability: [] })}
          >
            Add Center 
          </Button>
          
        </CardBody>
      </Card>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle as="h4">Additional Information</CardTitle>
        </CardHeader>
        <CardBody>
          <TextAreaFormInput control={control} name="faq" label="FAQ (Frequently Asked Questions)" rows={3} />
        </CardBody>
      </Card>

      {/* Certifications */}
      <Card>
        <CardHeader>
          <CardTitle as="h4">Photo</CardTitle>
        </CardHeader>
        <CardBody>
          <Controller
            control={control}
            name="certificationFiles"
            render={({ field }) => (
              <DropzoneFormInput
                className="py-5"
                text="Drop your Photo files here or click to browse"
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
