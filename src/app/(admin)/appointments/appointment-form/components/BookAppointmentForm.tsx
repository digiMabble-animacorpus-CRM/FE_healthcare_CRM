"use client";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Button,
} from "react-bootstrap";
import AppointmentFields from "./AppointmentFields";

type AppointmentFormValues = {
  date: string;
  time: string;
  service: string;
  department: string;
  notes?: string;
};

const schema = yup.object({
  date: yup.string().required("Select date"),
  time: yup.string().required("Select time"),
  department: yup.string().required("Select department"),
  service: yup.string().required("Select service"),
  notes: yup.string().optional(),
});

interface Props {
  defaultValues?: Partial<AppointmentFormValues>;
  onSubmitHandler: (data: AppointmentFormValues) => void;
  isEditMode?: boolean;
}

const BookAppointmentForm = ({
  defaultValues,
  onSubmitHandler,
  isEditMode,
}: Props) => {
  const methods = useForm<AppointmentFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      date: "",
      time: "",
      service: "",
      department: "",
      notes: "",
      ...defaultValues,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = (data: AppointmentFormValues) => {
    console.log("Submitted Appointment Data:", data);
    onSubmitHandler(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle as="h6">
              {isEditMode ? "Edit Appointment" : "Book Appointment"}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <AppointmentFields/>

            <div className="d-flex justify-content-end mt-4">
              <Button type="submit" variant="primary">
                {isEditMode ? "Update Appointment" : "Book Appointment"}
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

export default BookAppointmentForm;
