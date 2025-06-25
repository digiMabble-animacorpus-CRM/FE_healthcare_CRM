"use client";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { getAllPatients } from "@/helpers/data";
import { useEffect, useState } from "react";
import type { PatientType } from "@/types/data";
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  Spinner,
} from "react-bootstrap";

const PAGE_LIMIT = 10;
const BRANCHES = [
  "Gembloux - Orneau",
  "Gembloux - Tout Vent",
  "Anima Corpus Namur",
];

const CustomersListPage = () => {
  const [patients, setPatients] = useState<PatientType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchPatients = async (page: number, branch?: string) => {
    setLoading(true);
    try {
      const response = await getAllPatients(page, PAGE_LIMIT, branch);
      setPatients(response.data);
      setTotalPages(Math.ceil(response.totalCount / PAGE_LIMIT));
    } catch (error) {
      console.error("Failed to fetch patient data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients(currentPage, selectedBranch || undefined);
  }, [currentPage, selectedBranch]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) {
      setCurrentPage(page);
    }
  };

  return (
    <>
      <PageTitle subName="Customers" title="Customer List" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom">
              <CardTitle as={"h4"}>All Customer List</CardTitle>
              <Dropdown>
                <DropdownToggle
                  className="btn btn-sm btn-outline-secondary d-flex align-items-center"
                  id="branchFilter"
                >
                  <IconifyIcon
                    icon="material-symbols:filter-alt-outline"
                    width={18}
                    className="me-1"
                  />
                  {selectedBranch || "Filter by Branch"}
                </DropdownToggle>
                <DropdownMenu>
                  {BRANCHES.map((branch) => (
                    <DropdownItem
                      key={branch}
                      onClick={() => {
                        setSelectedBranch(branch);
                        setCurrentPage(1);
                      }}
                      active={selectedBranch === branch}
                      className={
                        selectedBranch === branch
                          ? "fw-bold d-flex gap-2 justify-content-between align-items-center"
                          : ""
                      }
                    >
                      {branch}
                      {selectedBranch === branch && (
                        <IconifyIcon icon="mdi:check" width={16} height={16} />
                      )}
                    </DropdownItem>
                  ))}

                  {selectedBranch && (
                    <DropdownItem
                      onClick={() => {
                        setSelectedBranch(null);
                        setCurrentPage(1);
                      }}
                      className="text-danger"
                    >
                      Clear Filter
                    </DropdownItem>
                  )}
                </DropdownMenu>
              </Dropdown>
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
                        <th>Patient's name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Age / Gender</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Last Activity</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patients.map((item: PatientType, idx: number) => (
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
                          <td>{item.name}</td>
                          <td>{item.email}</td>
                          <td>{item.number}</td>
                          <td>{item.dob}</td>
                          <td>{item.branch}</td>
                          <td>
                            <span
                              className={`badge bg-${item.status === "available" ? "success" : "danger"} text-white fs-12 px-2 py-1`}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td>{item.lastUpdated}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="light" size="sm">
                                <IconifyIcon
                                  icon="solar:eye-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button variant="soft-primary" size="sm">
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>
                              <Button variant="soft-danger" size="sm">
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
                      className={`page-item ${currentPage === index + 1 ? "active" : ""}`}
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
                    className={`page-item ${currentPage === totalPages ? "disabled" : ""}`}
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
    </>
  );
};

export default CustomersListPage;
