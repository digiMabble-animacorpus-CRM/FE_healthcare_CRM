"use client";

import { Form, Row, Col } from "react-bootstrap";
import { Site } from "../dashboard.types";

// =====================================================
// SKELETON
// =====================================================
export function BranchFilterSkeleton() {
  return (
    <Row className="mb-4">
      <Col md={4}>
        <div className="placeholder-wave">
          <div className="placeholder col-12" style={{ height: 40 }}></div>
        </div>
      </Col>
    </Row>
  );
}

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
  if (loading) return <BranchFilterSkeleton />;

  return (
    <div>
        <Form.Group>
          <Form.Label className="fw-semibold">Branch</Form.Label>
          <Form.Select
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            className="shadow-sm"
          >
            <option value="all">All Branches</option>

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
