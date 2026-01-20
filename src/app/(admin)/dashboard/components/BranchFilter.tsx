"use client";

import { Form } from "react-bootstrap";
import { Site } from "../dashboard.types";

// =====================================================
// COMPONENT
// =====================================================
interface BranchFilterProps {
  branches: Site[];
  value?: string;
  onChange?: (id: string) => void;
  loading?: boolean;
}

export default function BranchFilter({
  branches,
  value = "all",
  onChange,
  loading = false,
}: BranchFilterProps) {
  if (loading) return null;

  return (
    <div>
      <Form.Group>
        <Form.Label className="fw-semibold">Succursale</Form.Label>
        <Form.Select
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          className="shadow-sm"
        >
          <option value="all">Toutes les succursales</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </Form.Select>
      </Form.Group>
    </div>
  );
}
