'use client';

import { useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import TextFormInput from '@/components/from/TextFormInput';
import ChoicesFormInput from '@/components/from/ChoicesFormInput';
import type { LanguageType, StaffType } from '@/types/data';
import { getAllLanguages } from '@/helpers/languages';

const ContactInfo = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<StaffType>();

  const allLanguages = useMemo<LanguageType[]>(() => getAllLanguages(), []);

  const languageOptions = allLanguages.map((lang) => ({
    _id: lang._id,
    name: lang.label,
  }));

  return (
    <div className="mb-4">
      <h5 className="mb-3">Contact Information</h5>
      <Row>
        {/* Address Line 1 */}
        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="address.street"
              label="Address Line 1"
              placeholder="Enter address line 1"
            />
          </div>
        </Col>

        {/* Address Line 2 */}
        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput
              control={control}
              name="address.line2"
              label="Address Line 2"
              placeholder="Enter address line 2"
            />
          </div>
        </Col>

        {/* City */}
        <Col lg={4}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="address.city"
              label="City"
              placeholder="Enter city"
            />
          </div>
        </Col>

        {/* Zip Code */}
        <Col lg={4}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="address.zip_code"
              label="Zip Code"
              placeholder="Enter zip code"
              type="number"
            />
          </div>
        </Col>

        {/* Country Dropdown */}
        <Col lg={4}>
          <div className="mb-3">
            <label className="form-label">
              Country <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="address.country"
              render={({ field }) => (
                <ChoicesFormInput
                  className="form-control"
                  {...field}
                  value={field.value}
                  onChange={(val) => field.onChange(val)}
                >
                  <option value="" disabled hidden>
                    Select country
                  </option>
                  <option value="Belgium">Belgium</option>
                  <option value="France">France</option>
                  <option value="India">India</option>
                </ChoicesFormInput>
              )}
            />
            {errors.address?.country && (
              <small className="text-danger">
                {(errors.address.country as any)?.message || 'Country is required'}
              </small>
            )}
          </div>
        </Col>

        {/* Languages Spoken Multi-Select */}
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Languages Spoken <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="languages"
              render={({ field }) => (
                <ChoicesFormInput
                  className="form-control"
                  multiple
                  options={{ removeItemButton: true }}
                  {...field}
                >
                  <option value="" disabled hidden>
                    Select languages
                  </option>
                  {languageOptions.map(({ _id, name }) => (
                    <option key={_id} value={_id}>
                      {name}
                    </option>
                  ))}
                </ChoicesFormInput>
              )}
            />
            {errors.languages && (
              <small className="text-danger">
                {(errors.languages as any)?.message || 'At least one language is required'}
              </small>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ContactInfo;
