"use client";

import { useEffect, useMemo } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Col, Row } from "react-bootstrap";
import TextFormInput from "@/components/from/TextFormInput";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import type { LanguageType, StaffType } from "@/types/data";
import { getAllLanguages } from "@/helpers/languages";

const ContactInfo = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext<StaffType>();

  const allLangueages = useMemo<LanguageType[]>(() => {
    const languages = getAllLanguages();
    return languages;
  }, []);

  const languagesOptions = allLangueages.map((l) => ({
    _id: l._id,
    name: l.label,
  }));

  return (
    <div className="mb-4">
      <h5 className="mb-3">Contact Information</h5>
      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="address.line1"
              label="Address Line 1"
              placeholder="Enter address line 1"
            />
          </div>
        </Col>

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

        <Col lg={4}>
          <div className="mb-3">
            <TextFormInput
              required
              control={control}
              name="address.zipCode"
              label="Zip Code"
              placeholder="Enter zip code"
              type="number"
            />
          </div>
        </Col>

        <Col lg={4}>
          <div className="mb-3">
            <label className="form-label">
              Country <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="address.country"
              render={({ field }) => (
                <ChoicesFormInput className="form-control" {...field}>
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
              <small className="text-danger2">
                {errors.address.country.message}
              </small>
            )}
          </div>
        </Col>

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
                  {languagesOptions.map(({ _id, name }) => (
                    <option key={_id} value={_id}>
                      {name}
                    </option>
                  ))}
                </ChoicesFormInput>
              )}
            />
            {errors.languages && (
              <small className="text-danger2">{errors.languages.message}</small>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default ContactInfo;
