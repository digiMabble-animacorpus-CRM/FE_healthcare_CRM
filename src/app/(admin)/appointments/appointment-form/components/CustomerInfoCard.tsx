"use client";

import { useState } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import type { CustomerEnquiriesType } from "@/types/data";
import { customerEnquiriesData } from "@/assets/data/other";

interface Props {
  customerInfo?: CustomerEnquiriesType;
  onSave?: (updatedInfo: CustomerEnquiriesType) => void;
}

const emptyCustomer: CustomerEnquiriesType = {
  _id: "",
  name: "",
  email: "",
  number: "",
  gender: "",
  language: "",
  branch: "",
  dob: "",
  city: "",
  country: "",
  zip_code: "",
  address: "",
  tags: [],
  description: "",
  status: "new",
  lastUpdated: "",
  source: "",
  appointmentDetails: undefined,
  familyDetails: undefined,
  modeOfRegister: "",
};

const CustomerInfoCard = ({
  customerInfo = emptyCustomer,
  onSave,
}: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formState, setFormState] = useState<CustomerEnquiriesType>(
    customerInfo
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showForm, setShowForm] = useState(false);

  const handleChange = (
    field: keyof CustomerEnquiriesType,
    value: string | string[]
  ) => {
    setFormState((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setErrorMsg("Please enter search text");
      setNotFound(false);
      return;
    }

    setErrorMsg("");
    const q = searchQuery.trim().toLowerCase();

    const results = customerEnquiriesData.filter((customer) => {
      const combinedString = (
        customer.name +
        " " +
        customer.email +
        " " +
        customer.number
      ).toLowerCase();
      return q.split(/\s+/).every((token) => combinedString.includes(token));
    });

    if (results.length > 0) {
      setFormState(results[0]);
      setNotFound(false);
      setShowForm(true);
      setIsEditing(false); // view mode first
    } else {
      setFormState(emptyCustomer);
      setNotFound(true);
      setShowForm(false);
    }
  };

  const handleNewUser = () => {
    setFormState(emptyCustomer);
    setShowForm(true);
    setIsEditing(true); // directly open in edit mode
    setErrorMsg("");
    setNotFound(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    if (onSave) onSave(formState);
  };

  return (
    <Card className="mb-4">
      {/* Search & New User Section */}
      <CardHeader>
        <CardTitle as="h6">Find or Add Customer</CardTitle>
      </CardHeader>
      <CardBody>
        <Row className="mb-3">
          <Col md={8}>
            <Form.Control
              size="sm"
              placeholder="Search by Name, Email, Phone or combination"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Col>
          <Col md={2}>
            <Button
              size="sm"
              variant="primary"
              onClick={handleSearch}
              className="w-100"
            >
              Search
            </Button>
          </Col>
          <Col md={2}>
            <Button
              size="sm"
              variant="success"
              onClick={handleNewUser}
              className="w-100"
            >
              New User
            </Button>
          </Col>
        </Row>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
        {notFound && !errorMsg && (
          <Alert variant="warning">No customer found.</Alert>
        )}
      </CardBody>

      {/* Show Form/Card only after search success or new user */}
      {showForm && (
        <>
          <CardHeader className="d-flex justify-content-between align-items-center">
            <CardTitle as="h6">Customer Details</CardTitle>
            {isEditing ? (
              <div>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleSave}
                  className="me-2"
                >
                  Save
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                Edit
              </Button>
            )}
          </CardHeader>

          <CardBody>
            <Row>
              {Object.entries({
                name: "Name",
                email: "Email",
                number: "Phone",
                gender: "Gender",
                language: "Preferred Language",
                branch: "Branch",
                dob: "Date of Birth",
                city: "City",
                country: "Country",
                zip_code: "Zip Code",
                address: "Address",
                tags: "Tags",
                description: "Description",
              }).map(([key, label]) => (
                <Col
                  md={
                    key === "address" || key === "tags" || key === "description"
                      ? 12
                      : 6
                  }
                  className="mt-2"
                  key={key}
                >
                  <strong>{label}:</strong>{" "}
                  {isEditing ? (
                    key === "gender" ? (
                      <Form.Select
                        size="sm"
                        value={
                          formState[key as keyof CustomerEnquiriesType] as string
                        }
                        onChange={(e) =>
                          handleChange(
                            key as keyof CustomerEnquiriesType,
                            e.target.value
                          )
                        }
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Form.Select>
                    ) : (
                      <Form.Control
                        as={
                          key === "address" || key === "description"
                            ? "textarea"
                            : "input"
                        }
                        size="sm"
                        value={
                          Array.isArray(
                            formState[key as keyof CustomerEnquiriesType]
                          )
                            ? (
                                formState[
                                  key as keyof CustomerEnquiriesType
                                ] as string[]
                              ).join(", ")
                            : (formState[
                                key as keyof CustomerEnquiriesType
                              ] as string)
                        }
                        onChange={(e) =>
                          handleChange(
                            key as keyof CustomerEnquiriesType,
                            key === "tags"
                              ? e.target.value
                                  .split(",")
                                  .map((tag) => tag.trim())
                              : e.target.value
                          )
                        }
                      />
                    )
                  ) : Array.isArray(
                      formState[key as keyof CustomerEnquiriesType]
                    ) ? (
                    (formState[key as keyof CustomerEnquiriesType] as string[])
                      .join(", ") || "-"
                  ) : (
                    (formState[key as keyof CustomerEnquiriesType] as string) ||
                    "-"
                  )}
                </Col>
              ))}
            </Row>
          </CardBody>
        </>
      )}
    </Card>
  );
};

export default CustomerInfoCard;
