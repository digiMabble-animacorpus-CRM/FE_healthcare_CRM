"use client";

import { useEffect } from "react";
import { useFormContext, Controller, useWatch } from "react-hook-form";
import { Col, Row, FormCheck } from "react-bootstrap";
import ChoicesFormInput from "@/components/from/ChoicesFormInput";
import type { StaffType, BranchName, AssignedBranch } from "@/types/data";

const branchOptions: BranchName[] = [
  "Gembloux - Orneau",
  "Gembloux - Tout Vent",
  "Anima Corpus Namur",
];

const BranchSection = () => {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<StaffType>();

  const assignedBranches = useWatch({ control, name: "branches" }) || [];
  const selectedBranch = useWatch({ control, name: "selectedBranch" });

  // 🔄 Auto-select or clear primary branch based on selection count
  useEffect(() => {
    if (assignedBranches.length === 1) {
      const branchName =
        typeof assignedBranches[0] === "string"
          ? assignedBranches[0]
          : assignedBranches[0].name;
      setValue("selectedBranch", branchName, { shouldValidate: true });
    } else if (assignedBranches.length > 1) {
      const isCurrentSelectedValid = assignedBranches.some(
        (b) => (typeof b === "string" ? b : b.name) === selectedBranch
      );

      if (!selectedBranch || !isCurrentSelectedValid) {
        const firstBranch =
          typeof assignedBranches[0] === "string"
            ? assignedBranches[0]
            : assignedBranches[0].name;
        setValue("selectedBranch", firstBranch, { shouldValidate: true });
      }
    } else {
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
              render={({ field: { onChange, value, ...rest } }) => (
                <ChoicesFormInput
                  className="form-control"
                  multiple
                  options={{ removeItemButton: true }}
                  value={value.map((v) => (typeof v === "string" ? v : v.name))}
                  onChange={(val) => {
                    const converted = Array.isArray(val)
                      ? val.map((v) => ({ name: v }))
                      : [{ name: val }];
                    onChange(converted);
                  }}
                  {...rest}
                >
                  {branchOptions.map((branch) => (
                    <option key={branch} value={branch}>
                      {branch}
                    </option>
                  ))}
                </ChoicesFormInput>
              )}
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
                {assignedBranches.map((branch: AssignedBranch | string) => {
                  const branchName =
                    typeof branch === "string" ? branch : branch.name;

                  return (
                    <Col lg={4} key={branchName}>
                      <Controller
                        name="selectedBranch"
                        control={control}
                        render={({ field }) => (
                          <FormCheck
                            type="radio"
                            id={`primary-${branchName}`}
                            name="selectedBranch"
                            label={branchName}
                            value={branchName}
                            checked={field.value === branchName}
                            onChange={() => field.onChange(branchName)}
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
