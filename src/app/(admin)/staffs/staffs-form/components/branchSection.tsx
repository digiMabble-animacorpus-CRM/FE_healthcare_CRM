"use client";

import { useEffect, useMemo } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Col, Row, FormCheck } from "react-bootstrap";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import type { StaffType, BranchType } from "@/types/data";
import { getAllBranch } from "@/helpers/branch";

const BranchSection = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<StaffType>();

  const assignedBranches = useWatch({ control, name: "branches" }) || [];
  const selectedBranch = useWatch({ control, name: "selectedBranch" });

  //  Get all branches as full objects
  const allBranches = useMemo<BranchType[]>(() => {
    const branches = getAllBranch();
    return branches;
  }, []);

  // For rendering options in dropdown
  const branchOptions = allBranches.map((b) => ({
    _id: b._id,
    name: b.name,
  }));

  //  Auto-select or clear primary branch based on selection count
useEffect(() => {
  if (assignedBranches.length === 1) {
    const branchId = typeof assignedBranches[0] === "string"
      ? assignedBranches[0]
      : assignedBranches[0].id;

    if (selectedBranch !== branchId) {
      setValue("selectedBranch", branchId, { shouldValidate: true });
    }
  } else if (assignedBranches.length > 1) {
    const isCurrentSelectedValid = assignedBranches.some(
      (b) => (typeof b === "string" ? b : b.id) === selectedBranch
    );

    if (!selectedBranch || !isCurrentSelectedValid) {
      const firstBranch = typeof assignedBranches[0] === "string"
        ? assignedBranches[0]
        : assignedBranches[0].id;

      if (selectedBranch !== firstBranch) {
        setValue("selectedBranch", firstBranch, { shouldValidate: true });
      }
    }
  } else if (selectedBranch !== "") {
    setValue("selectedBranch", "", { shouldValidate: true });
  }
}, [assignedBranches, selectedBranch, setValue]);


  return (
    <div className="mb-4">
      <h5 className="mb-3">Branch Assignment</h5>

      <Row>
        <Col lg={6}>
          <div className="mb-3">
            <label className="form-label">
              Assign Branches <span className="text-danger">*</span>
            </label>
            <Controller
              control={control}
              name="branches"
              render={({ field: { onChange, value = [], ...rest } }) => {
                return (
                  <ChoicesFormInput
                    className="form-control"
                    multiple
                    options={{ removeItemButton: true }}
                    value={value.map((v) => (typeof v === "string" ? v : v.id))}
                    onChange={(val) => {
                      const converted = Array.isArray(val)
                        ? val.map((v) => ({
                            id: v,
                            isPrimary: false,
                          }))
                        : [{ id: val, isPrimary: false }];
                      onChange(converted);
                    }}
                    {...rest}
                  >
                    {branchOptions.map(({ _id, name }) => (
                      <option key={_id} value={_id}>
                        {name}
                      </option>
                    ))}
                  </ChoicesFormInput>
                );
              }}
            />
            {errors.branches && (
              <small className="text-danger">{errors.branches.message}</small>
            )}
          </div>
        </Col>

        {assignedBranches.length > 1 && (
          <Col>
            <div className="mb-3">
              <label className="form-label d-block mb-3">
                Select Primary Branch <span className="text-danger">*</span>
              </label>
              <Row>
                {assignedBranches.map((branch) => {
                  const branchId =
                    typeof branch === "string" ? branch : branch.id;
                  const branchName =
                    allBranches.find((b) => b._id === branchId)?.name ||
                    branchId;

                  return (
                    <Col lg={4} key={branchId}>
                      <Controller
                        name="selectedBranch"
                        control={control}
                        render={({ field }) => (
                          <FormCheck
                            type="radio"
                            id={`primary-${branchId}`}
                            name="selectedBranch"
                            label={branchName}
                            value={branchId}
                            checked={field.value === branchId}
                            onChange={() => {
                              field.onChange(branchId);
                            }}
                          />
                        )}
                      />
                    </Col>
                  );
                })}
              </Row>
              {errors.selectedBranch && (
                <small className="text-danger">
                  {errors.selectedBranch.message}
                </small>
              )}
            </div>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default BranchSection;
