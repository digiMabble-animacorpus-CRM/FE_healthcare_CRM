"use client";
import { useForm, Controller } from "react-hook-form";
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
} from "react-bootstrap";
import TextFormInput from "@/components/from/TextFormInput";
import TextAreaFormInput from "@/components/from/TextAreaFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";

type CustomerFormValues = {
  name: string;
  email: string;
  number: string;
  dob: string;
  description: string;
  zipCode: string;
  gender: string;
  language: string;
  tags: string[];
  city: string;
  country: string;
};

const schema: yup.ObjectSchema<CustomerFormValues> = yup.object({
  name: yup.string().required("Please enter name"),
  email: yup.string().email("Invalid email").required("Please enter email"),
  number: yup
    .string()
    .matches(/^\d{10}$/, "Enter valid 10-digit number")
    .required("Please enter number"),
  dob: yup.string().required("Please enter Date of birth"),
  description: yup.string().required("Please enter address"),
  zipCode: yup
    .string()
    .matches(/^\d{5}$/, "Enter valid Zip-Code")
    .required("Please enter Zip-Code"),
  gender: yup.string().required("Please select gender"),
  language: yup.string().required("Please select language"),
  tags: yup
    .array()
    .of(yup.string().required())
    .min(1, "Please select at least one tag")
    .required("Please select tags"),
  city: yup.string().required("Please select city"),
  country: yup.string().required("Please select country"),
});

const AddCustomer = () => {
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      number: "",
      dob: "",
      description: "",
      zipCode: "",
      gender: "",
      language: "",
      tags: [],
      city: "",
      country: "",
    },
  });

  const onSubmit = (data: CustomerFormValues) => {
    console.log("✅ Submitted Data:", data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle as="h4">Customer Information</CardTitle>
        </CardHeader>
        <CardBody>
          <Row>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="name"
                  placeholder="Full Name"
                  label="Customer Name"
                />
              </div>
            </Col>
            <Col lg={6}>
              <div className="mb-3">
                <TextFormInput
                  control={control}
                  name="email"
                  placeholder="Enter Email"
                  label="Customer Email"
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
                  label="Customer Number"
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
                  <small className="text-danger">{errors.gender.message}</small>
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
            <Col lg={12}>
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

            <Col lg={12}>
              <div className="mb-3">
                <TextAreaFormInput
                  control={control}
                  name="description"
                  label="Customer Address"
                  id="schedule-textarea"
                  rows={3}
                  placeholder="Enter address"
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
                <small className="text-danger">{errors.country.message}</small>
              )}
              </div>
            </Col>
          </Row>
        </CardBody>
      </Card>
      <div className="mb-3 rounded">
        <Row className="justify-content-end g-2 mt-2">
          <Col lg={2}>
            <Button variant="outline-primary" type="submit" className="w-100">
              Create Customer
            </Button>
          </Col>
          <Col lg={2}>
            <Button variant="danger" className="w-100" type="button">
              Cancel
            </Button>
          </Col>
        </Row>
      </div>
    </form>
  );
};

export default AddCustomer;
