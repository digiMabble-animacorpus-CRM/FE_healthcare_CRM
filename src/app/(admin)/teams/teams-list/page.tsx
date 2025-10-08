'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllTeamMembers } from '@/helpers/team-members';
import type { TeamMemberType } from '@/types/data';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import {
  Badge,
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
} from 'react-bootstrap';

const PAGE_SIZE = 500;
const BRANCHES = ['Gembloux - Orneau', 'Gembloux - Tout Vent', 'Namur'];

const TeamsListPage = () => {
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMemberType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapistId, setSelectedTeamMemberId] = useState<string | null>(null);

  const router = useRouter();

  const fetchTeamMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getAllTeamMembers(1, 10000); // fetch all
      if (!response.data || response.data.length === 0) {
        throw new Error('No data');
      }
      setAllTeamMembers(response.data || []);
    } catch (err) {
      setError('Failed to fetch data');
      setAllTeamMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const getDateRange = () => {
    const now = dayjs();
    switch (dateFilter) {
      case 'today':
        return { from: now.startOf('day'), to: now.endOf('day') };
      case 'this_week':
        return { from: now.startOf('week'), to: now.endOf('week') };
      case '15_days':
        return { from: now.subtract(15, 'day').startOf('day'), to: now.endOf('day') };
      case 'this_month':
        return { from: now.startOf('month'), to: now.endOf('month') };
      case 'this_year':
        return { from: now.startOf('year'), to: now.endOf('year') };
      default:
        return null;
    }
  };

  const filteredTeamMembers = useMemo(() => {
    let data = [...allTeamMembers];
    if (selectedBranch) {
      data = data.filter((t) => t.office_address?.includes(selectedBranch));
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (t) =>
          (t.first_name?.toLowerCase().includes(term) ?? false) ||
          (t.last_name?.toLowerCase().includes(term) ?? false) ||
          (t.full_name?.toLowerCase().includes(term) ?? false) ||
          (t.contact_email?.toLowerCase().includes(term) ?? false) ||
          (t.contact_phone?.toLowerCase().includes(term) ?? false),
      );
    }
    return data;
  }, [allTeamMembers, selectedBranch, searchTerm, dateFilter]);

  const totalPages = Math.ceil(filteredTeamMembers.length / PAGE_SIZE);

  const currentData = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTeamMembers.slice(start, start + PAGE_SIZE);
  }, [filteredTeamMembers, currentPage]);

  const handleView = (id: string) => {
    router.push(`/teams/details/${id}`);
  };

  const handleEditClick = (id: string) => router.push(`/teams/edit-team/${id}`);

  const handleDeleteClick = (id: string) => {
    setSelectedTeamId(id);
    setSelectedTeamMemberId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTeamId) return;
    try {
      await fetch(`http://164.92.220.65/api/v1/team-members/${selectedTeamId}`, {
        method: 'DELETE',
      });
      setAllTeamMembers(allTeamMembers.filter((t) => t.team_id.toString() !== selectedTeamId));
    } catch (err) {
      // error handling
    } finally {
      setShowDeleteModal(false);
      setSelectedTeamId(null);
      setSelectedTeamMemberId(null);
    }
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  // Helper for showing avatar fallback
  const getProfileDisplay = (member: TeamMemberType) => {
    const photoUrl = member.photo && member.photo.startsWith('http') ? member.photo : '';
    if (photoUrl)
      return (
        <img
          src={photoUrl}
          alt="Profile"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'cover',
            borderRadius: '50px',
            background: '#f6f6f6',
          }}
        />
      );
    // Fallback: first letter in a colored circle
    const initial = member.first_name ? member.first_name.trim().charAt(0).toUpperCase() : 'U';
    return (
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#007bff',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 600,
          fontSize: 20,
          textTransform: 'uppercase',
        }}
      >
        {initial}
      </div>
    );
  };

  return (
    <>
      <PageTitle subName="Teams" title="Liste des équipes" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de toutes les équipes <small>({filteredTeamMembers.length} Total)</small>
              </CardTitle>
              {error && <div className="alert alert-danger text-center">{error}</div>}
              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Rechercher par nom, email, numéro..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  style={{ minWidth: 200 }}
                />

                <Dropdown>
                  <DropdownToggle className="btn btn-sm btn-primary dropdown-toggle text-white">
                    {selectedBranch || 'Filtrer par succursale'}
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
                      >
                        {branch}
                      </DropdownItem>
                    ))}
                    {selectedBranch && (
                      <DropdownItem
                        className="text-danger"
                        onClick={() => {
                          setSelectedBranch(null);
                          setCurrentPage(1);
                        }}
                      >
                        Clear Branch Filter
                      </DropdownItem>
                    )}
                  </DropdownMenu>
                </Dropdown>
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className="table table-hover table-sm table-centered mb-0"
                    style={{ minWidth: 1100 }}
                  >
                    <thead className="bg-light-subtle">
                      <tr>
                        <th style={{ width: 30 }}>Non</th>
                        <th>Photo</th>
                        <th>Nom</th>
                        <th>E-mail</th>
                        <th>Téléphone</th>
                        <th>Succursale</th>
                        <th>Titre demploi</th>
                        <th>Rôle</th>
                        <th>Statut</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center py-4 text-muted">
                            No data found
                          </td>
                        </tr>
                      ) : (
                        currentData.map((item, idx) => (
                          <tr key={item.team_id}>
                            <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                            <td>{getProfileDisplay(item)}</td>
                            <td>{item.full_name}</td>
                            <td>{item.contact_email}</td>
                            <td>{item.contact_phone}</td>
                            <td>
                              {Array.isArray(item.branches)
                                ? item.branches.map((b) => b.name).join(', ')
                                : ''}
                            </td>
                            <td>{item.job_1}</td>
                            <td>
                              {item.role === 'super_admin'
                                ? 'Super Admin'
                                : item.role === 'staff'
                                  ? 'Staff'
                                  : item.role === 'admin'
                                    ? 'Admin'
                                    : item.role}
                            </td>
                            <td>
                              <Badge
                                bg={item.status === 'active' ? 'success' : 'danger'}
                                text="light"
                                style={{ textTransform: 'capitalize' }}
                              >
                                {item.status}
                              </Badge>
                            </td>
                            <td>
                              <div className="d-flex gap-2">
                                <Button
                                  variant="light"
                                  size="sm"
                                  onClick={() => handleView(item.team_id)}
                                >
                                  <IconifyIcon icon="solar:eye-broken" />
                                </Button>
                                <Button
                                  variant="soft-primary"
                                  size="sm"
                                  onClick={() => handleEditClick(item.team_id.toString())}
                                >
                                  <IconifyIcon icon="solar:pen-2-broken" />
                                </Button>
                                <Button
                                  variant="soft-danger"
                                  size="sm"
                                  onClick={() => handleDeleteClick(item.team_id.toString())}
                                >
                                  <IconifyIcon icon="solar:trash-bin-minimalistic-2-broken" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>

            <CardFooter>
              <ul className="pagination justify-content-end mb-0">
                <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                  <Button
                    variant="link"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                </li>
                {Array.from({ length: totalPages }).map((_, idx) => (
                  <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(idx + 1)}
                    >
                      {idx + 1}
                    </Button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <Button
                    variant="link"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </li>
              </ul>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer ce membre de l équipe ?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TeamsListPage;
