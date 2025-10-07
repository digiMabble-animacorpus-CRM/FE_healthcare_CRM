'use client';

import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { deleteTherapistTeamMember, getAllTherapistTeamMembers } from '@/helpers/therapistTeam';
import type { TeamMemberType } from '@/types/data';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useNotificationContext } from '@/context/useNotificationContext';
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
const { showNotification } = useNotificationContext();
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
        searchTerm || undefined,
      );
      const members = response?.data || [];
      if (!members || members.length === 0) {
        setAllTeamMembers([]);
        setTotalCount(0);
      } else {
        setAllTeamMembers(
          members.map((item: any) => ({
            ...item,
            team_id: item.therapistId ?? item.id ?? '',
            firstName: item.firstName,
            lastName: item.lastName,
            contactEmail: item.contactEmail,
            contactPhone: item.contactPhone,
            branches: item.branches ?? [], // ✅ correct field
            role: item.role,
            status: item.status,
            imageUrl: item.imageUrl,
          })),
        );
        setTotalCount(response.totalCount ?? members.length);
      }
    } catch (err) {
      setError('Failed to fetch data');
      setAllTeamMembers(allTeamMembers.filter((t) => t.team_id !== selectedTherapistTeamId));
      setTotalCount((count) => count - 1);
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
    router.push(`/therapist-team/details/${id}`);
  };

  const handleEditClick = (id: string) => router.push(`/therapist-team/edit-TherapistTeam/${id}`);

  const handleDeleteClick = (id: string) => {
    setSelectedTeamId(id);
    setSelectedTeamMemberId(id);
    setShowDeleteModal(true);
  };

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const handleConfirmDelete = async () => {
    if (!selectedTherapistTeamId) return;

    setDeletingId(selectedTherapistTeamId);
    setShowDeleteModal(false);

    try {
  const success = await deleteTherapistTeamMember(selectedTherapistTeamId);

  if (success) {
    // Optimistically remove deleted member
    setAllTeamMembers((prev) => {
      const updated = prev.filter(
        (t) => String(t.team_id) !== String(selectedTherapistTeamId)
      );

      // If current page has no more items after deletion, go to previous page
      if (updated.length === 0 && currentPage > 1) {
        setCurrentPage((prevPage) => prevPage - 1);
      }

      return updated;
    });

    // Decrease total count
    setTotalCount((prev) => prev - 1);

    // Clear selected ID
    setSelectedTeamId(null);
    setSelectedTeamMemberId(null);

    // ✅ Success notification
    showNotification({
      message: 'Thérapeute supprimé avec succès',
      variant: 'success',
    });
  } else {
    // ❌ Failure notification
    showNotification({
      message: 'Échec de la suppression du thérapeute.',
      variant: 'danger',
    });
  }
} catch (err) {
  console.error(err);
  // ❌ Error notification
  showNotification({
    message: "Une erreur s'est produite lors de la suppression du thérapeute.",
    variant: 'danger',
  });
} finally {
  setDeletingId(null);
}}

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
                            <td>
                              {item.firstName} {item.lastName}
                            </td>
                            <td>{item.contactEmail}</td>
                            <td>{item.contactPhone}</td>
                            <td>
                              {Array.isArray(item.branches)
                                ? item.branches.map((b: any) => b.name).join(', ')
                                : ''}
                            </td>
                            <td>
                              {item.role === 'super-admin'
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
                                  onClick={() =>
                                    item.team_id && handleEditClick(item.team_id.toString())
                                  }
                                  disabled={!item.team_id}
                                >
                                  <IconifyIcon icon="solar:pen-2-broken" />
                                </Button>
                                <Button
                                  variant="soft-danger"
                                  size="sm"
                                  onClick={() =>
                                    item.team_id && handleDeleteClick(item.team_id.toString())
                                  }
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
                  <Button
                    variant="link"
                    className="page-link"
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                </li>
                {Array.from({ length: totalPages }, (_, idx) => (
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
          <Button variant="danger" onClick={handleConfirmDelete} disabled={deletingId !== null}>
            {deletingId ? <Spinner size="sm" animation="border" /> : 'Supprimer'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default TherapistTeamsListPage;
