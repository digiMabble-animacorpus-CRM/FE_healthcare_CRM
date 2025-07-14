"use client";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Card, CardBody, CardHeader, CardTitle } from "react-bootstrap";
import { useRouter } from "next/navigation";

import type { StaffType } from "@/types/data";
import PersonalInfo from "./components/personalInfo";
import ProfessionalInfo from "./components/professionalInfo";
import BranchSection from "./components/branchSection";
import ContactInfo from "./components/contactInfo";
import AvailabilitySection from "./components/availabilitySection";
import PermissionsSection from "./components/permissionSection";
import { useMemo } from "react";
import { getAllRoles } from "@/helpers/staff";

// ✅ Schema aligned with StaffType
const schema: yup.ObjectSchema<any> = yup.object().shape({
  name: yup.string().required("Name is required"),
  email: yup.string().email().required("Email is required"),
  phoneNumber: yup.string().required("Phone number is required"),
  gender: yup.string().required("Gender is required"),
  dob: yup.string().required("Date of birth is required"),
  description: yup.string(),
  roleId: yup.string().required("Role is required"),
  accessLevelId: yup.string().required("Access Level is required"),
  branches: yup
    .array()
    .of(
      yup.object().shape({
        id: yup.string().required("Branch ID is required"),
        isPrimary: yup.boolean().optional(),
      })
    )
    .min(1, "Select at least one branch")
    .required(),
  selectedBranch: yup.string().required("Select primary branch"),
  address: yup.object().shape({
    line1: yup.string().required("Address Line 1 is required"),
    city: yup.string().required("City is required"),
    zipCode: yup.string().required("Zip Code is required"),
    country: yup.string().required("Country is required"),
  }),
  languages: yup.array().min(1, "At least one language is required").required(),
  availability: yup.array().of(
    yup.object().shape({
      day: yup.string().required("Day is required"),
      from: yup.string().required("Start time is required"),
      to: yup.string().required("End time is required"),
    })
  ),
  permissions: yup.array().of(
    yup.object().shape({
      _id: yup.string().required("Permission ID is required"),
      enabled: yup.boolean().required(),
    })
  ),
});

interface Props {
  defaultValues?: Partial<StaffType>;
  isEditMode?: boolean;
  onSubmitHandler: (data: StaffType) => Promise<void>;
}

const StaffForm = ({
  defaultValues,
  isEditMode = false,
  onSubmitHandler,
}: Props) => {
  const router = useRouter();

  const methods = useForm<StaffType>({
    resolver: yupResolver(schema),
    defaultValues: {
      ...defaultValues,
      branches: defaultValues?.branches || [],
      permissions: defaultValues?.permissions || [],
      availability: defaultValues?.availability || [],
      languages: defaultValues?.languages || [],
      roleId: defaultValues?.roleId || "",
      accessLevelId: defaultValues?.accessLevelId || "",
      address: defaultValues?.address || {
        line1: "",
        city: "",
        zipCode: "",
        country: "",
      },
    },
  });

  const {
    handleSubmit,
    watch,
    formState: { errors },
  } = methods;

  const roleId = watch("roleId") || "";
  const selectedRole = useMemo(() => {
    return getAllRoles().find((r) => r._id === roleId);
  }, [roleId]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmitHandler)}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              {isEditMode ? "Edit Staff Details" : "Create New Staff"}
            </CardTitle>
          </CardHeader>
          <CardBody>
            <PersonalInfo />
            <ProfessionalInfo />
            <BranchSection />
            <ContactInfo />
            {selectedRole?.requiresAvailability && <AvailabilitySection />}
            <PermissionsSection />
            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? "Update" : "Create"} Staff
              </Button>
              <Button variant="secondary" onClick={() => router.back()}>
                Cancel
              </Button>
            </div>
          </CardBody>
        </Card>
      </form>
    </FormProvider>
  );
};

export default StaffForm;
