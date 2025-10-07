'use client';

import { useEffect, useState } from 'react';
import {
  Row,
  Col,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  CardTitle,
  Button,
  Spinner,
  Modal,
} from 'react-bootstrap';
import { useRouter } from 'next/navigation';
import PageTitle from '@/components/PageTitle';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { API_BASE_PATH } from '@/context/constants';
import axios from 'axios';
import { useNotificationContext } from '@/context/useNotificationContext';

export interface LanguageType {
  id: number;
  language_name: string;
  language_description: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const PAGE_LIMIT = 10;

const LanguageListPage = () => {
  const router = useRouter();
  const [languages, setLanguages] = useState<LanguageType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
const { showNotification } = useNotificationContext();
  const token = localStorage.getItem('access_token');

  const fetchLanguages = async (page: number) => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_PATH}/languages`, {
        params: {
          page,
          limit: PAGE_LIMIT,
          search: searchTerm,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // check backend structure
      const data = res.data;

      // if backend sends array directly
      if (Array.isArray(data)) {
        setLanguages(data);
        setTotalPages(1);
      }
      // if backend sends { data: [...], totalCount: n }
      else {
        setLanguages(data.data || []);
        setTotalPages(Math.ceil((data.totalCount || 0) / PAGE_LIMIT));
      }
    } catch (error) {
      console.error('Failed to fetch languages:', error);
      setLanguages([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLanguages(currentPage);
  }, [currentPage, searchTerm]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleEditClick = (id: number) => {
    router.push(`/languages/language-form/edit/${id}`);
  };

  const handleDeleteClick = (languageId: number) => {
  setSelectedLanguageId(languageId);
  setShowDeleteModal(true);
};

const handleConfirmDelete = async () => {
  if (!selectedLanguageId) return;

  try {
    await axios.delete(`${API_BASE_PATH}/languages/${selectedLanguageId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // ✅ show success notification
    showNotification({
      message: 'Language supprimé avec succès',
      variant: 'success',
    });

    fetchLanguages(currentPage);
  } catch (error) {
    console.error('Failed to delete language:', error);

    // ✅ show error notification
    showNotification({
      message: 'Échec de la suppression language',
      variant: 'danger',
    });
  } finally {
    setShowDeleteModal(false);
    setSelectedLanguageId(null);
  }
};

const handleToggleStatus = async (languageId: number, newStatus: boolean) => {
  try {
    await axios.patch(
      `${API_BASE_PATH}/languages/${languageId}`,
      { is_active: newStatus },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setLanguages((prevLanguages) =>
      prevLanguages.map((lang) =>
        lang.id === languageId ? { ...lang, is_active: newStatus } : lang
      )
    );

    showNotification({
      message: `Language ${newStatus ? 'activé' : 'désactivé'} avec succès`,
      variant: 'success',
    });
  } catch (error) {
    console.error('Failed to update status:', error);

    showNotification({
      message: 'Échec de la suppression language',
      variant: 'danger',
    });
  }
};


  return (
    <>
      <PageTitle subName="Langues" title="Liste des langues" />

      <Row>
        <Col xl={12}>
          <Card>
            <CardHeader className="d-flex flex-wrap justify-content-between align-items-center border-bottom gap-2">
              <CardTitle as="h4" className="mb-0">
                Liste de toutes les langues
              </CardTitle>

              <div className="d-flex flex-wrap align-items-center gap-2">
                <div style={{ minWidth: '200px' }}>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="Rechercher par nom..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>

                <Button
                  variant="primary"
                  onClick={() => router.push('/languages/language-form/create')}
                >
                  Ajouter une langue
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
                        <th>Non</th>
                        <th>Nom</th>
                        <th>Description</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map((item, idx) => (
                        <tr key={item.id}>
                          <td>{idx + 1}</td>
                          <td>{item.language_name}</td>
                          <td>{item.language_description}</td>
                          <td>
                            <div className="d-flex gap-2 align-items-center">
                              <Button
                                variant="soft-primary"
                                size="sm"
                                onClick={() => handleEditClick(item.id)}
                              >
                                <IconifyIcon
                                  icon="solar:pen-2-broken"
                                  className="align-middle fs-18"
                                />
                              </Button>

                              <Button
                                variant="soft-danger"
                                size="sm"
                                onClick={() => handleDeleteClick(item.id)}
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
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Précédent
                    </Button>
                  </li>
                  {[...Array(totalPages)].map((_, index) => (
                    <li
                      className={`page-item ${currentPage === index + 1 ? 'active' : ''}`}
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
              </nav>
            </CardFooter>
          </Card>
        </Col>
      </Row>

      {/* Delete Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>Êtes-vous sûr de vouloir supprimer cette langue ?</Modal.Body>
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

export default LanguageListPage;
