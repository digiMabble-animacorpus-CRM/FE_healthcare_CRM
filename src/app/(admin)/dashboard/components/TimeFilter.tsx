"use client";

import { ButtonGroup, Button } from "react-bootstrap";
import { TimeFilterType } from "../dashboard.types";

interface TimeFilterProps {
  value: TimeFilterType;
  onChange: (value: TimeFilterType) => void;
}

export default function TimeFilter({ value, onChange }: TimeFilterProps) {
  return (
    <ButtonGroup className="mb-3">
      <Button
        variant={value === "today" ? "primary" : "outline-primary"}
        onClick={() => onChange("today")}
      >
        Today
      </Button>

      <Button
        variant={value === "week" ? "primary" : "outline-primary"}
        onClick={() => onChange("week")}
      >
        This Week
      </Button>

      <Button
        variant={value === "month" ? "primary" : "outline-primary"}
        onClick={() => onChange("month")}
      >
        This Month
      </Button>

      <Button
        variant={value === "all" ? "primary" : "outline-primary"}
        onClick={() => onChange("all")}
      >
        All
      </Button>
    </ButtonGroup>
  );
}
