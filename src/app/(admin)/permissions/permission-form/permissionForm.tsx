"use client";

import { FormProvider, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Button, Card, CardBody, CardHeader, CardTitle, Col, Row } from "react-bootstrap";
import { useRouter } from "next/navigation";
import TextFormInput from "@/components/from/TextFormInput";
import type { PermissionType } from "@/types/data";

// ✅ Form Values Type
interface PermissionFormValues {
  key: string;
  label: string;
  description?: string;
}

// ✅ Validation Schema
const schema = yup.object({
  key: yup.string().required("Key is required"),
  label: yup.string().required("Label is required"),
  description: yup.string().optional(),
});

interface Props {
  defaultValues?: Partial<PermissionType>;
  isEditMode?: boolean;
  onSubmitHandler: (data: PermissionFormValues & { _id?: string }) => Promise<void>;
}

const PermissionForm = ({
  defaultValues,
  isEditMode = false,
  onSubmitHandler,
}: Props) => {
  const router = useRouter();

  const methods = useForm<PermissionFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      key: defaultValues?.key || "",
      label: defaultValues?.label || "",
      description: defaultValues?.description || "",
    },
  });

  const {
    handleSubmit,
    control,
  } = methods;

  const handleFormSubmit = async (data: PermissionFormValues) => {
    const payload = isEditMode && (defaultValues as any)?._id
      ? { ...data, _id: (defaultValues as any)._id }
      : data;

    await onSubmitHandler(payload);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              {isEditMode ? "Edit Permission Details" : "Create New Permission"}
            </CardTitle>
          </CardHeader>

          <CardBody>
            <div className="mb-4">
              <h5 className="mb-3">Permission Information</h5>
              <Row>
                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="key"
                      label="Enter Key"
                      placeholder="Ex: dashboard-access"
                    />
                  </div>
                </Col>

                <Col lg={6}>
                  <div className="mb-3">
                    <TextFormInput
                      required
                      control={control}
                      name="label"
                      label="Enter Label"
                      placeholder="Ex: Dashboard Access"
                    />
                  </div>
                </Col>

                <Col lg={12}>
                  <div className="mb-3">
                    <TextFormInput
                      control={control}
                      name="description"
                      label="Description"
                      placeholder="Ex: Allows access to dashboard pages"
                    />
                  </div>
                </Col>
              </Row>
            </div>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? "Update" : "Create"} Permission
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

export default PermissionForm;
