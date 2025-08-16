"use client";

import PageTitle from "@/components/PageTitle";
import IconifyIcon from "@/components/wrappers/IconifyIcon";
import { useEffect, useState } from "react";
import type { StaffType } from "@/types/data";
import Image from 'next/image';
import dayjs from "dayjs";
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
  Modal,
  Row,
  Spinner,
} from 'react-bootstrap'
import { useRouter } from 'next/navigation'
import { getAllStaff } from '@/helpers/staff'
import type { BranchDetails } from '@/types/data';
import { encryptAES } from '@/utils/encryption'
import avatar1 from "@/assets/images/users/avatar-1.jpg";

const PAGE_LIMIT = 10;
const BRANCHES = [
  "Gembloux - Orneau",
  "Gembloux - Tout Vent",
  "Anima Corpus Namur",
];

const StaffListPage = () => {
  const [staffList, setStaffList] = useState<StaffType[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const router = useRouter();

  const getDateRange = () => {
    const now = dayjs();
    switch (dateFilter) {
      case "today":
        return {
          from: now.startOf("day").toISOString(),
          to: now.endOf("day").toISOString(),
        };
      case "this_week":
        return {
          from: now.startOf("week").toISOString(),
          to: now.endOf("week").toISOString(),
        };
      case "15_days":
        return {
          from: now.subtract(15, "day").startOf("day").toISOString(),
          to: now.endOf("day").toISOString(),
        };
      case "this_month":
        return {
          from: now.startOf("month").toISOString(),
          to: now.endOf("month").toISOString(),
        };
      case "this_year":
        return {
          from: now.startOf("year").toISOString(),
          to: now.endOf("year").toISOString(),
        };
      default:
        return {};
    }
  };

const fetchStaffList = async (page: number) => {
  setLoading(true);
  console.log(' Fetching staff list...');
  try {
    const { from, to } = getDateRange();
    console.log(' Date filter range:', { from, to });

    const response = await getAllStaff(page, PAGE_LIMIT, selectedBranch || undefined, from, to, searchTerm);
    
    console.log(' Response from getAllStaff:', response);

    setStaffList(response.data);
    setTotalPages(Math.ceil(response.totalCount / PAGE_LIMIT));
  } catch (error) {
    console.error(' Failed to fetch staff list:', error);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchStaffList(currentPage);
  }, [currentPage, selectedBranch, searchTerm, dateFilter]);

  const handlePageChange = (page: number) => {
    if (page !== currentPage) setCurrentPage(page);
  };





const handleView = (staffId: number | string) => {
  router.push(`/staffs/staffs-details/${staffId}`);
};




const handleEdit = (id: string | number) => {
  const encrypted = encodeURIComponent(encryptAES(String(id)));
  router.push(`/staffs/staffs-form/${encrypted}/edit`);
};






const handlePermission = (id: string | number) => {
  const encrypted = encodeURIComponent(encryptAES(String(id)));
  router.push(`/staffs/staffs-form/${encrypted}/permission`);
};






  const handleDelete = (id: string) => {
    setSelectedStaffId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedStaffId) return;
    try {
      await fetch(`/api/therapists/${selectedStaffId}`, {
        method: "DELETE",
      });
      fetchStaffList(currentPage);
    } catch (error) {
      console.error("Failed to delete staff:", error);
    } finally {
      setShowDeleteModal(false);
      setSelectedStaffId(null);
    }
  };

  const formatGender = (gender: string): string =>
    gender ? gender.charAt(0).toUpperCase() : "";

  return (
    <>
      <PageTitle subName="Staff" title="Staff List" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                All Staff List
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Gender</th>
                        <th>Branch</th>
                        <th>Status</th>
                        <th>Role</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {staffList.map((staff, idx) => (
                        <tr key={idx}>
                          <td>{staff.name}</td>
                          <td>{staff.email}</td>
                          <td>{staff.phone_number}</td>
                          <td>{formatGender(staff.gender || '')}</td>
                          <td>{staff.branchesDetailed.map((b: { code: any }) => b.code).join(', ')}</td>
 {/* <td>
  {staff.branchesDetailed?.length
    ? staff.branchesDetailed.map((branch: BranchDetails) => branch.code).join(', ')
    : 'N/A'}
</td> */}



                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <Image src={avatar1} className="img-fluid me-2 avatar-sm rounded-circle" alt="avatar-1" />
                              <span>{staff?.name}</span>
                            </div>
                          </td>
                          <td>{staff?.email}</td>
                          <td>{staff?.phoneNumber}</td>
                          <td>{formatGender(staff?.gender || "")}</td>
                          <td>
                            {staff?.branchesDetailed
                              .map((b: { code: any }) => b.code)
                              .join(", ")}
                          </td>
                          <td>
                            <span
                              className={`badge bg-${staff.status === "active" ? "success" : "danger"} text-white fs-12 px-2 py-1`}
                            >
                              {staff?.status}
                            </span>
                          </td>
                          <td>{staff.createdAt ? dayjs(staff.createdAt).format('YYYY-MM-DD HH:mm') : 'N/A'}</td>
                          <td>
                            <div className="d-flex gap-2">
                              <Button variant="light" size="sm" onClick={() => handleView(String(staff.id))}>
                                <IconifyIcon icon="solar:eye-broken" className="align-middle fs-18" />
                              </Button>
                              <Button variant="soft-primary" size="sm" onClick={() => handleEdit(String(staff.id))}>
                                <IconifyIcon icon="solar:pen-2-broken" className="align-middle fs-18" />
                              </Button>
                              <Button variant="soft-danger" size="sm" onClick={() => handleDelete(String(staff.id))}>
                                <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" className="align-middle fs-18" />
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
              <nav>
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

      <Modal
        show={showDeleteModal}
        onHide={() => setShowDeleteModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this staff? This action cannot be
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

export default StaffListPage;
