'use client';

import PageTitle from '@/components/PageTitle';
import { deleteTherapist, getAllTherapists } from '@/helpers/therapist';
import type { TherapistType } from '@/types/data';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
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
} from 'react-bootstrap';

const PAGE_SIZE = 10;

const TherapistsListPage = () => {
  const [therapists, setTherapists] = useState<TherapistType[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  // Fetch all therapists
  const fetchTherapists = async () => {
    setLoading(true);
    try {
      const response = await getAllTherapists(currentPage, PAGE_SIZE);
      setTherapists(response.data || []);
      setTotalCount(response.totalCount || response.data?.length || 0);
      setTotalPages(response.totalPage || 1);
    } catch (err) {
      setTherapists([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, [currentPage]);

  // Filter by search
  const filteredTherapists = useMemo(() => {
    if (!searchTerm.trim()) return therapists;
    const term = searchTerm.toLowerCase();
    return therapists.filter(
      (t) =>
        `${t.firstName ?? ''} ${t.lastName ?? ''}`.toLowerCase().includes(term) ||
        (t.nihii ?? '').toLowerCase().includes(term)
    );
  }, [therapists, searchTerm]);

  const currentData = filteredTherapists;

  // Pagination Logic
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
      const pages: (number | string)[] = [];
      pages.push(1);
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      if (currentPage <= 3) endPage = 4;
      if (currentPage >= totalPages - 2) startPage = totalPages - 3;
      if (startPage > 2) pages.push('...');
      for (let i = startPage; i <= endPage; i++) pages.push(i);
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
      return pages;
    };

    return (
      <ul className="pagination flex-wrap justify-content-center justify-content-md-end gap-1 mb-0">

        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
          <Button variant="link" className="page-link" onClick={() => handlePageChange(currentPage - 1)}>
            Précédent
          </Button>
        </li>

        {getPageNumbers().map((pageNum, index) => (
          <li
            key={index}
            className={`page-item ${currentPage === pageNum ? 'active' : ''} ${
              pageNum === '...' ? 'disabled' : ''
            }`}
          >
            {pageNum === '...' ? (
              <span className="page-link">...</span>
            ) : (
              <Button variant="link" className="page-link" onClick={() => handlePageChange(pageNum as number)}>
                {pageNum}
              </Button>
            )}
          </li>
        ))}

        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
          <Button variant="link" className="page-link" onClick={() => handlePageChange(currentPage + 1)}>
            Suivant
          </Button>
        </li>
      </ul>
    );
  };

  return (
    <>
      <PageTitle subName="Thérapeute" title="Liste des thérapeutes" />

      <Row>
        <Col xs={12}>
          <Card>

            {/* Responsive Card Header */}
            <CardHeader
              className="
                d-flex 
                flex-column flex-md-row 
                justify-content-between 
                align-items-start align-items-md-center 
                gap-2 
                border-bottom
              "
            >
              <CardTitle as="h4" className="mb-0">
                Liste de tous les thérapeutes{' '}
                <span className="text-muted">({totalCount} Total)</span>
              </CardTitle>

              <div className="d-flex gap-2 align-items-center">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Rechercher par nom ou NIHII..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>

            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover table-sm table-centered mb-0">
                    <thead className="bg-light-subtle">
                      <tr>
                        <th>No</th>
                        <th>Nom</th>
                        <th>NIHII</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentData.length > 0 ? (
                        currentData.map((item, index) => (
                          <tr key={item.id}>
                            <td>{(currentPage - 1) * PAGE_SIZE + index + 1}</td>
                            <td>{`${item.firstName ?? ''} ${item.lastName ?? ''}`}</td>
                            <td>{item.nihii ?? '-'}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="text-center py-4 text-muted">
                            Aucun thérapeute trouvé
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardBody>

            <CardFooter>{renderPagination()}</CardFooter>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default TherapistsListPage;
