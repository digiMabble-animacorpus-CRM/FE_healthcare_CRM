"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Form } from "react-bootstrap";

interface Props {
  onCheck: (email: string) => void;
  isCustomerNotFound: boolean;
}

const CheckCustomerSection = ({ onCheck, isCustomerNotFound }: Props) => {
  const router = useRouter();
  const [email, setEmail] = useState("");

  return (
    <div className="p-3 border rounded bg-light">
      <Form.Group className="mb-2">
        <Form.Label className="fw-bold">Search by Email</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter customer's email"
        />
      </Form.Group>

      {isCustomerNotFound && (
        <p className="text-danger mt-1 mb-2">
          Customer not found. You can create a new customer or search with a different email.
        </p>
      )}

      <div className="mt-2">
        {!isCustomerNotFound ? (
          <Button variant="primary" onClick={() => onCheck(email)} disabled={!email.trim()}>
            Search
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              onClick={() => onCheck(email)}
              disabled={!email.trim()}
              className="me-2"
            >
              Search Again
            </Button>
            <Button
              variant="success"
              onClick={() => router.push("/customer-enquiries/add-enquiry")}
            >
              Create New Customer
            </Button>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckCustomerSection;
