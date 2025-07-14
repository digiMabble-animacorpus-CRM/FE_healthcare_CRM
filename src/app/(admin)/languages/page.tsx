"use client";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useEffect, useState } from "react";
import type { LanguageType, StaffType } from "@/types/data";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Modal,
  Row,
  Spinner,
} from "react-bootstrap";
import { useRouter } from "next/navigation";
import { getLanguages } from "@/helpers/languages";

const PAGE_LIMIT = 10;

const StaffsListPage = () => {
  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    null
  );
  const router = useRouter();

  const fetchLanguages = async (page: number) => {
    setLoading(true);
    try {
      const response = await getLanguages(page, PAGE_LIMIT, searchTerm);
      setLanguages(response.data);
      setTotalPages(Math.ceil(response.totalCount / PAGE_LIMIT));
    } catch (error) {
      console.error("Failed to fetch enquiries data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  const handleEditClick = (id: string) => {
    router.push(`languages/language-form/${id}/edit`);
  };

  const handleDeleteClick = (id: string) => {
    setSelectedPatientId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedPatientId) return;

    try {
      await fetch(`/api/languages/${selectedPatientId}`, {
        method: "DELETE",
      });

      fetchLanguages(currentPage); // refresh list
    } catch (error) {
      console.error("Failed to delete enquiries:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedPatientId(null);
    }
  };

  return (
    <>
      <PageTitle subName="Languages" title="Languages List" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                All Languages List
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: "200px" }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Search by name, email, number..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
                <Button variant="primary" onClick={() => router.push("/languages/language-form/create")}>
                  Add Language
                </Button>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle text-nowrap table-hover table-centered mb-0">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ width: 20 }}>
                          <div className="form-check">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              id="customCheck1"
                            />
                            <label
                              className="form-check-label"
                              htmlFor="customCheck1"
                            />
                          </div>
                        </th>
                        {/* <th>Id</th> */}
                        <th>Key</th>
                        <th>Label</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map((item: LanguageType, idx: number) => (
                        <tr key={idx}>
                          <td>
                            <div className="form-check">
                              <input
                                type="checkbox"
                                className="form-check-input"
                                id={`check-${idx}`}
                              />
                            </div>
                          </td>
                          {/* <td>{item._id}</td> */}
                          <td>{item.key}</td>
                          <td>{item.label}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEditClick(item._id)}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(item._id)}
                              >
                                <IconifyIcon
                                  icon="solar:trash-bin-minimalistic-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>

            <CardFooter>
              <nav aria-label="Page navigation example">
                <ul className="pagination justify-content-end mb-0">
                  <li
                    className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
                  >
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Previous
                    </Button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      className={`page-item ${
                        currentPage === index + 1 ? "active" : ""
                      }`}
                      key={index}
                    >
                      <Button
                        variant="link"
                        className="page-link"
                        onClick={() => handlePageChange(index + 1)}
                      >
                        {index + 1}
                      </Button>
                    </li>
                  ))}
                  <li
                    className={`page-item ${
                      currentPage === totalPages ? "disabled" : ""
                    }`}
                  >
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </li>
                </ul>
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Delete Confirmation Modal */}
      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this customer? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default StaffsListPage;
