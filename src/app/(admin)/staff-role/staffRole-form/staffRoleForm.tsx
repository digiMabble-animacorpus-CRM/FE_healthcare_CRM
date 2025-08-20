'use client';

import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import type { StaffRoleType } from '@/types/data';
import StaffRoleFormFields from './components/staffRoleFormFields';

interface StaffRoleFormValues {
  key: string;
  label: string;
  description?: string;
  tag: 'Role' | 'AccessLevel';
  internal?: boolean;
  requiresDetails?: boolean;
  requiresAvailability?: boolean;
  defaultPermissions?: string[];
}

const schema = yup.object({
  key: yup.string().required('Role Key is required'),
  label: yup.string().required('Role Label is required'),

  tag: yup
    .mixed<'Role' | 'AccessLevel'>()
    .oneOf(['Role', 'AccessLevel'], 'Tag must be Role or AccessLevel')
    .required('Tag is required'),

  defaultPermissions: yup
    .array()
    .of(yup.string().required())
    .when('tag', {
      is: 'AccessLevel',
      then: (schema) => schema.max(0, 'AccessLevel cannot have permissions.'),
      otherwise: (schema) => schema.min(1, 'Please select at least 1 permission.'),
    })
    .optional(),
});

interface Props {
  defaultValues?: Partial<StaffRoleType>;
  isEditMode?: boolean;
  onSubmitHandler: (data: StaffRoleFormValues) => Promise<void>;
}

const StaffRoleForm = ({ defaultValues, isEditMode = false, onSubmitHandler }: Props) => {
  const router = useRouter();

  const methods = useForm<StaffRoleFormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      key: defaultValues?.key ?? '',
      label: defaultValues?.label ?? '',
      description: defaultValues?.description ?? '',
      defaultPermissions: Array.isArray(defaultValues?.defaultPermissions)
        ? defaultValues.defaultPermissions
        : [],
      tag:
        defaultValues?.tag === 'Role' || defaultValues?.tag === 'AccessLevel'
          ? defaultValues.tag
          : 'Role',
      internal: !!defaultValues?.internal,
      requiresDetails: !!defaultValues?.requiresDetails,
      requiresAvailability: !!defaultValues?.requiresAvailability,
    },
  });

  const {
    handleSubmit,
    formState: { errors },
  } = methods;

  const handleFormSubmit = async (data: StaffRoleFormValues) => {
    await onSubmitHandler(data);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle as="h5">
              {isEditMode ? 'Edit Staff Role Details' : 'Create New Staff Role'}
            </CardTitle>
          </CardHeader>

          <CardBody>
            <div className="mb-4">
              <h5 className="mb-3">Staff Role Information</h5>
              <StaffRoleFormFields />
            </div>

            <div className="mt-4 d-flex gap-3 justify-content-end">
              <Button type="submit" variant="primary">
                {isEditMode ? 'Update' : 'Create'} Staff Role
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

export default StaffRoleForm;
