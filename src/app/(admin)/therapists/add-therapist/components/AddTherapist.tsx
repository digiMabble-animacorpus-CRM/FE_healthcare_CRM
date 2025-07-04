"use client";

import { useEffect, useState } from "react";
import {
  useForm,
  Controller,
  FormProvider,
  useFieldArray,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Button,
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
} from "react-bootstrap";
import { useRouter } from "next/navigation";

import { getPatientById } from "@/helpers/data";
import type { PatientType } from "@/types/data";
import TextFormInput from "@/components/from/TextFormInput";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import DropzoneFormInput from "@/components/from/DropzoneFormInput";

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

type AvailabilitySlot = {
  day: string;
  from: string;
  to: string;
};

type TherapistFormValues = {
  name: string;
  email: string;
  number: string;
  dob: string;
  description: string;
  address: string;
  zipCode: string;
  gender: string;
  language: string;
  branch: string;
  tags: string[];
  city: string;
  country: string;
  specialization: string;
  experience: string;
  education: string;
  certificationFiles: File[];
  registrationNumber: string;
  availability: AvailabilitySlot[];
};

const schema: yup.ObjectSchema<TherapistFormValues> = yup.object({
  name: yup.string().required("Please enter name"),
  email: yup.string().email("Invalid email").required("Please enter email"),
  number: yup
    .string()
    .matches(/^\d{10}$/, "Enter valid 10-digit number")
    .required("Please enter number"),
  dob: yup.string().required("Please enter Date of birth"),
  address: yup.string().required("Please enter address"),
  description: yup.string().required("Please enter description"),
  zipCode: yup
    .string()
    .matches(/^\d{5}$/, "Enter valid Zip-Code")
    .required("Please enter Zip-Code"),
  gender: yup.string().required("Please select gender"),
  branch: yup.string().required("Please select branch"),
  language: yup.string().required("Please select language"),
  tags: yup
    .array()
    .of(yup.string().required())
    .min(1, "Please select at least one tag")
    .required("Please select tags"),
  city: yup.string().required("Please select city"),
  country: yup.string().required("Please select country"),
  specialization: yup.string().required("Please select specialization"),
  experience: yup.string().required("Please enter experience"),
  education: yup.string().required("Please enter education/degrees"),
  certificationFiles: yup
    .array()
    .of(yup.mixed<File>().required("File is required"))
    .min(1, "Please upload at least one certification file")
    .required("Please upload certification files"),
  registrationNumber: yup.string().required("Please enter registration number"),
  availability: yup
    .array()
    .of(
      yup.object().shape({
        day: yup.string().required("Day is required"),
        from: yup.string().required("Start time is required"),
        to: yup.string().required("End time is required"),
      })
    )
    .required("Please add at least one availability slot")
    .min(1, "Please add at least one availability slot"),
});

interface Props {
  params: { id?: string };
}

const AddTherapist = ({ params }: Props) => {
  const router = useRouter();
  const isEditMode = !!params.id;

  const [loading, setLoading] = useState<boolean>(isEditMode);

  const methods = useForm<TherapistFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      number: "",
      dob: "",
      description: "",
      address: "",
      zipCode: "",
      gender: "",
      language: "",
      branch: "",
      tags: [],
      city: "",
      country: "",
      specialization: "",
      experience: "",
      education: "",
      certificationFiles: [],
      registrationNumber: "",
      availability: [],
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = methods;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "availability",
  });

  useEffect(() => {
    if (isEditMode) {
      const fetchData = async () => {
        try {
          const response = await getPatientById(params.id!);
          const data = response.data;
          if (Array.isArray(data) && data.length > 0) {
            reset(data[0] as unknown as TherapistFormValues);
          }
        } catch (error) {
          console.error("Failed to fetch patient:", error);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [isEditMode, params.id, reset]);

  const onSubmit = async (data: TherapistFormValues) => {
    console.log(isEditMode ? "Edit Submitted Data:" : "Create Submitted Data:", data);
  };

  if (loading) {
    return (
      <div className="text-center my-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h4">
              {isEditMode ? "Edit Therapist" : "Add Therapist"}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="name"
                    placeholder="Full Name"
                    label="Therapist Name"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="email"
                    placeholder="Enter Email"
                    label="Therapist Email"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="number"
                    type="number"
                    placeholder="Enter Number"
                    label="Therapist Number"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="dob"
                    type="date"
                    placeholder=""
                    label="Date of Birth"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Gender</label>
                  <Controller
                    control={control}
                    name="gender"
                    render={({ field }) => (
                      <ChoicesFormInput className="form-control" {...field}>
                        <option value="" disabled hidden>
                          Select Gender
                        </option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="others">Others</option>
                      </ChoicesFormInput>
                    )}
                  />
                  {errors.gender && (
                    <small className="text-danger">
                      {errors.gender.message}
                    </small>
                  )}
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Preferred Language</label>
                  <Controller
                    control={control}
                    name="language"
                    render={({ field }) => (
                      <ChoicesFormInput className="form-control" {...field}>
                        <option value="" disabled hidden>
                          Select Preferred Language
                        </option>
                        <option value="EN">English</option>
                        <option value="FR">French</option>
                        <option value="NL">Dutch</option>
                      </ChoicesFormInput>
                    )}
                  />
                  {errors.language && (
                    <small className="text-danger">
                      {errors.language.message}
                    </small>
                  )}
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Tags</label>
                  <Controller
                    control={control}
                    name="tags"
                    render={({ field }) => (
                      <ChoicesFormInput
                        className="form-control"
                        multiple
                        options={{ removeItemButton: true }}
                        {...field}
                      >
                        <option value="Blog">Blog</option>
                        <option value="Business">Business</option>
                        <option value="Health">Health</option>
                        <option value="Computer Software">
                          Computer Software
                        </option>
                        <option value="Lifestyle blogs">Lifestyle blogs</option>
                        <option value="Fashion">Fashion</option>
                      </ChoicesFormInput>
                    )}
                  />
                  {errors.tags && (
                    <small className="text-danger">{errors.tags.message}</small>
                  )}
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Branch</label>
                  <Controller
                    control={control}
                    name="branch"
                    render={({ field }) => (
                      <ChoicesFormInput className="form-control" {...field}>
                        <option value="" disabled hidden>
                          Select Branch
                        </option>
                        <option value="Gembloux - Orneau">
                          Gembloux - Orneau
                        </option>
                        <option value="Gembloux - Tout Vent">
                          Gembloux - Tout Vent
                        </option>
                        <option value="Anima Corpus Namur">
                          Anima Corpus Namur
                        </option>
                      </ChoicesFormInput>
                    )}
                  />
                  {errors.branch && (
                    <small className="text-danger">
                      {errors.branch.message}
                    </small>
                  )}
                </div>
              </Col>

              <Col lg={6}>
                <div className="mb-3">
                  <TextAreaFormInput
                    control={control}
                    name="address"
                    label="Therapist Address"
                    id="schedule-textarea"
                    rows={3}
                    placeholder="Enter address"
                  />
                </div>
              </Col>
              <Col lg={6}>
                <div className="mb-3">
                  <TextAreaFormInput
                    control={control}
                    name="description"
                    label="Description"
                    id="schedule-textarea"
                    rows={3}
                    placeholder="Any Description"
                  />
                </div>
              </Col>

              <Col lg={4}>
                <div className="mb-3">
                  <TextFormInput
                    control={control}
                    name="zipCode"
                    type="number"
                    placeholder="Zip-Code"
                    label="Zip-Code"
                  />
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <label className="form-label">City</label>
                  <Controller
                    control={control}
                    name="city"
                    render={({ field }) => (
                      <ChoicesFormInput className="form-control" {...field}>
                        <option value="" disabled hidden>
                          Choose a city
                        </option>
                        <option value="London">London</option>
                        <option value="Paris">Paris</option>
                        <option value="New York">New York</option>
                      </ChoicesFormInput>
                    )}
                  />
                  {errors.city && (
                    <small className="text-danger">{errors.city.message}</small>
                  )}
                </div>
              </Col>
              <Col lg={4}>
                <div className="mb-3">
                  <label className="form-label">Country</label>
                  <Controller
                    control={control}
                    name="country"
                    render={({ field }) => (
                      <ChoicesFormInput className="form-control" {...field}>
                        <option value="" disabled hidden>
                          Choose a country
                        </option>
                        <option value="UK">United Kingdom</option>
                        <option value="FR">France</option>
                        <option value="IN">India</option>
                      </ChoicesFormInput>
                    )}
                  />
                  {errors.country && (
                    <small className="text-danger">
                      {errors.country.message}
                    </small>
                  )}
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Professional Information</CardTitle>
          </CardHeader>
          <CardBody>
            <Row>
              <Col lg={6}>
                <div className="mb-3">
                  <label className="form-label">Specialization</label>
                  <Controller
                    control={control}
                    name="specialization"
                    render={({ field }) => (
                      <ChoicesFormInput className="form-control" {...field}>
                        <option value="" disabled hidden>
                          Select Specialization
                        </option>
                        <option value="physiotherapy">Physiotherapy</option>
                        <option value="occupational-therapy">
                          Occupational Therapy
                        </option>
                        <option value="speech-therapy">Speech Therapy</option>
                        <option value="cognitive-behavioral-therapy">
                          Cognitive Behavioral Therapy
                        </option>
                        <option value="psychotherapy">Psychotherapy</option>
                      </ChoicesFormInput>
                    )}
                  />
                  {errors.specialization && (
                    <small className="text-danger">
                      {errors.specialization.message}
                    </small>
                  )}
                </div>
              </Col>
              <Col lg={6}>
                <TextFormInput
                  control={control}
                  name="experience"
                  placeholder="Enter Experience"
                  label="Years of Experience"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  control={control}
                  name="education"
                  placeholder="Enter Education / Degrees"
                  label="Education / Degrees"
                />
              </Col>
              <Col lg={6}>
                <TextFormInput
                  control={control}
                  name="registrationNumber"
                  placeholder="e.g., license ID"
                  label="Registration Number"
                />
              </Col>
            </Row>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as="h4">Availability / Working Hours</CardTitle>
          </CardHeader>
          <CardBody>
            {fields.map((item, index) => (
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
                    render={({ field }) => (
                      <input type="time" className="form-control" {...field} />
                    )}
                  />
                </Col>
                <Col lg={3}>
                  <Controller
                    control={control}
                    name={`availability.${index}.to`}
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
              onClick={() => append({ day: "", from: "", to: "" })}
            >
              Add Availability
            </Button>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle as={"h4"}>Upload Certifications / Licenses</CardTitle>
          </CardHeader>
          <CardBody>
            <Controller
              control={control}
              name="certificationFiles"
              render={({ field }) => (
                <DropzoneFormInput
                  className="py-5"
                  iconProps={{
                    icon: "bx:cloud-upload",
                    height: 48,
                    width: 48,
                    className: "mb-4 text-primary",
                  }}
                  text="Drop your Certifications / Licenses here, or click to browse"
                  helpText={
                    <span className="text-muted fs-13">
                      (1600 x 1200 (4:3) recommended. PNG, JPG and GIF files are
                      allowed )
                    </span>
                  }
                  showPreview
                  onFileUpload={(files) => field.onChange(files)}
                />
              )}
            />
            {errors.certificationFiles && (
              <small className="text-danger">
                {errors.certificationFiles.message}
              </small>
            )}
          </CardBody>
        </Card>

        <div className="mb-3 rounded">
          <Row className="justify-content-end g-2 mt-2">
            <Col lg={2}>
              <Button variant="outline-primary" type="submit" className="w-100">
                {isEditMode ? "Update" : "Create"} Therapist
              </Button>
            </Col>
            <Col lg={2}>
              <Button
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
