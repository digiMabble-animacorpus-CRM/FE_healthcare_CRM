'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { getAllTherapistTeamMembers } from '@/helpers/therapistTeam';
import type { TeamMemberType } from '@/types/data';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
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

const TherapistTeamsListPage = () => {
  const [allTeamMembers, setAllTeamMembers] = useState<TeamMemberType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTherapistTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedTherapistId, setSelectedTeamMemberId] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const router = useRouter();

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
  const fetchTeamMembers = async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const dateRange = getDateRange();
      const from = dateRange?.from.format('YYYY-MM-DD') || undefined;
      const to = dateRange?.to.format('YYYY-MM-DD') || undefined;

      const response = await getAllTherapistTeamMembers(
        page,
        PAGE_SIZE,
        selectedBranch || undefined,
        from,
        to,
        searchTerm || undefined
      );

      console.log('API Data:', response.data);
      console.log('Total Count:', response.totalCount);

      if (!response.data || response.data.length === 0) {
        setAllTeamMembers([]);
        setTotalCount(0);
      } else {
        setAllTeamMembers(
          response.data.map((item: any) => ({
            ...item,
            team_id: item.therapistId ?? item.team_id ?? item.id ?? '',
          }))
        );
        setTotalCount(response.totalCount);
      }
    } catch (err) {
      setError('Failed to fetch data');
      
      ([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, selectedBranch, searchTerm, dateFilter]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const currentData = allTeamMembers;

  const handleView = (id: string) => {
    router.push(`/therapist-teams/details/${id}`);
  };

  const handleEditClick = (id: string) => router.push(`/teams/edit-TherapistTeam/${id}`);

  const handleDeleteClick = (id: string) => {
    setSelectedTeamId(id);
    setSelectedTeamMemberId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTherapistTeamId) return;
    try {
      await fetch(`http://164.92.220.65/api/v1/therapist-team/${selectedTherapistTeamId}`, {
        method: 'DELETE',
      });
      setAllTeamMembers(allTeamMembers.filter((t) => t.team_id !== selectedTherapistTeamId));
      setTotalCount((count) => count - 1);
    } catch (err) {
      // Optionally set error message here for delete failure
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
    const photoUrl = member.imageUrl && member.imageUrl.startsWith('http') ? member.imageUrl : '';
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
    const initial = member.firstName ? member.firstName.trim().charAt(0).toUpperCase() : 'U';
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
      <PageTitle subName="Teams" title="Liste de toutes les équipes" />
      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de toutes les équipes({totalCount} Total)
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
                  <table className="table table-hover table-sm table-centered mb-0" style={{ minWidth: 1100 }}>
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
                          <tr key={item.team_id ?? `team-member-${idx}`}>
                            <td>{(currentPage - 1) * PAGE_SIZE + idx + 1}</td>
                            <td>{getProfileDisplay(item)}</td>
                            <td>{item.firstName}</td>
                            <td>{item.contactEmail}</td>
                            <td>{item.contactPhone}</td>
                            <td>
                              {Array.isArray(item.branchIds)
                                ? item.branchIds
                                    .map((b) =>
                                      typeof b === 'object' && b !== null && 'name' in b
                                        ? (b as { name: string }).name
                                        : typeof b === 'number'
                                        ? b.toString()
                                        : ''
                                    )
                                    .join(', ')
                                : ''}
                            </td>
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
                                  onClick={() => item.team_id && handleView(item.team_id)}
                                  disabled={!item.team_id}
                                >
                                  <IconifyIcon icon="solar:eye-broken" />
                                </Button>
                                <Button
                                  variant="soft-primary"
                                  size="sm"
                                  onClick={() => item.team_id && handleEditClick(item.team_id.toString())}
                                  disabled={!item.team_id}
                                >
                                  <IconifyIcon icon="solar:pen-2-broken" />
                                </Button>
                                <Button
                                  variant="soft-danger"
                                  size="sm"
                                  onClick={() => item.team_id && handleDeleteClick(item.team_id.toString())}
                                  disabled={!item.team_id}
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
                  <Button variant="link" className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
                    Précédent
                  </Button>
                </li>
                {Array.from({ length: totalPages }, (_, idx) => (
                  <li key={idx} className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}>
                    <Button variant="link" className="page-link" onClick={() => handlePageChange(idx + 1)}>
                      {idx + 1}
                    </Button>
                  </li>
                ))}
                <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                  <Button variant="link" className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
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

export default TherapistTeamsListPage;
