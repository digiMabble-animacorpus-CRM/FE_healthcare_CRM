'use client';

import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { FormCheck, FormSelect } from 'react-bootstrap';
import TextFormInput from '@/components/from/TextFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import { StaffRoleType } from '@/types/data';
import { getAllPermissions } from '@/helpers/permission';
import { useMemo } from 'react';

const StaffRoleFormFields = () => {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<StaffRoleType>();

  const tag = useWatch({ control, name: 'tag' });
  const allPermissions = useMemo(() => getAllPermissions(), []);

  const isRole = tag === 'Role';
  const isAccessLevel = tag === 'AccessLevel';

  return (
    <>
      <div className="mb-3">
        <label className="form-label">
          Type de balise <span className="text-danger">*</span>
        </label>
        <Controller
          name="tag"
          control={control}
          render={({ field }) => (
            <FormSelect {...field}>
              <option value="" disabled>
                Sélectionnez le type de balise
              </option>
              <option value="Role">Rôle</option>
              <option value="AccessLevel">Niveau d accès</option>
            </FormSelect>
          )}
        />
        {errors.tag && <small className="text-danger2">{errors.tag.message as string}</small>}
      </div>
      <div className="mb-3">
        <TextFormInput required control={control} name="key" label="Key" placeholder="Ex: doctor" />
      </div>

      <div className="mb-3">
        <TextFormInput
          required
          control={control}
          name="label"
          label="Étiquette"
          placeholder="Ex : Thérapeute"
        />
      </div>

      <div className="mb-3">
        <TextFormInput
          control={control}
          name="description"
          label="Description du rôle"
          placeholder="Ex : Responsable de..."
        />
      </div>

      <div className="mb-3">
        <label className="form-label">
          Autorisations <span className="text-danger">*</span>
        </label>
        <Controller
          control={control}
          name="defaultPermissions"
          render={({ field }) => (
            <ChoicesFormInput
              className="form-control"
              multiple
              options={{ removeItemButton: true }}
              disabled={!isRole}
              {...field}
            >
              {allPermissions.map((p) => (
                <option key={p.key} value={p.key}>
                  {p.label}
                </option>
              ))}
            </ChoicesFormInput>
          )}
        />
        {errors.defaultPermissions && (
          <small className="text-danger2">{errors.defaultPermissions.message as string}</small>
        )}
      </div>

      <div className="mb-3 d-flex align-items-center gap-3">
        <FormCheck
          type="checkbox"
          id="internal"
          label="Est-ce un rôle interne"
          disabled={!isAccessLevel}
          {...register('internal')}
        />
        <FormCheck
          type="checkbox"
          id="requiresDetails"
          label="Nécessite des détails supplémentaires"
          disabled={!isRole}
          {...register('requiresDetails')}
        />
        <FormCheck
          type="checkbox"
          id="requiresAvailability"
          label="Nécessite des informations de disponibilité"
          disabled={!isRole}
          {...register('requiresAvailability')}
        />
      </div>
    </>
  );
};

export default StaffRoleFormFields;
