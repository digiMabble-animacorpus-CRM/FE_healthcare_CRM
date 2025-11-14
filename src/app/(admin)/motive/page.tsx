'use client';

import { useEffect, useMemo, useState } from 'react';
import PageTitle from '@/components/PageTitle';
import {
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  CardTitle,
  Col,
  Row,
  Spinner,
} from 'react-bootstrap';
import { useNotificationContext } from '@/context/useNotificationContext';
import {
  getAllCalendars,
  getAllHps,
  getAllMotives,
  MotiveDto,
  updateMotivesBulk,
} from './helpers/motive';
import MotiveCard from './components/motiveCards';
import EditCalendarsModal from './components/editCalenderDialog';
import EditPatternModal from './components/editDialog';
import CreateMotiveForm from './components/createMotiveDialog';

// ✅ Import the Create Motive Form (modal)

const PAGE_SIZE = 20;

export default function MotivesListPage() {
  const [motives, setMotives] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'ACTIVE' | 'INACTIVE' | 'ARCHIVED' | ''>('ACTIVE');
  const [calendarFilter, setCalendarFilter] = useState<string | undefined>(undefined);
  const [hpFilter, setHpFilter] = useState<string | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');

  // Reference data
  const [calendars, setCalendars] = useState<any[]>([]);
  const [hps, setHps] = useState<any[]>([]);

  // Dialogs
  const [editingCalendarsFor, setEditingCalendarsFor] = useState<any | null>(null);
  const [editingPatternFor, setEditingPatternFor] = useState<any | null>(null);
  const [showCreateMotive, setShowCreateMotive] = useState(false); // ✅ new

  const { showNotification } = useNotificationContext();

  /** 🔹 Fetch all motives, calendars, hps */
  const fetchAll = async () => {
    setLoading(true);
    try {
      const [mResp, cResp, hResp] = await Promise.all([
        getAllMotives(currentPage, PAGE_SIZE, 'label', 1),
        getAllCalendars(1, 200, 'label', 1),
        getAllHps(1, 500, 'firstName', 1),
      ]);

      setMotives(mResp.data || []);
      setTotalPages(mResp.totalPages || 1);
      setCalendars(cResp.elements || []);
      setHps(hResp.elements || []);
    } catch (err) {
      console.error('fetchAll error', err);
      setMotives([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleArchiveToggle = async (m: any) => {
    const newStatus = m.status === 'ARCHIVED' ? 'ACTIVE' : 'ARCHIVED';
    const payload: MotiveDto[] = [{ id: m.id, status: newStatus }];
    const ok = await updateMotivesBulk(payload);
    if (ok) {
      showNotification({
        message: `Motive ${newStatus === 'ARCHIVED' ? 'archived' : 'restored'}.`,
        variant: 'success',
      });
      fetchAll();
    } else {
      showNotification({ message: 'Failed to update motive status', variant: 'danger' });
    }
  };

  const openEditCalendars = (motive: any) => setEditingCalendarsFor(motive);
  const openEditPattern = (motive: any) => setEditingPatternFor(motive);

  const handleCalendarsSaved = async (id: string, calendarIds: string[]) => {
    const ok = await updateMotivesBulk([{ id, calendarIds }]);
    if (ok) {
      showNotification({ message: 'Calendars updated', variant: 'success' });
      fetchAll();
    } else {
      showNotification({ message: 'Failed to update calendars', variant: 'danger' });
    }
    setEditingCalendarsFor(null);
  };

  const handlePatternSaved = async (id: string, payload: Partial<MotiveDto>) => {
    const ok = await updateMotivesBulk([{ id, ...payload } as MotiveDto]);
    if (ok) {
      showNotification({ message: 'Pattern updated', variant: 'success' });
      fetchAll();
    } else {
      showNotification({ message: 'Failed to update pattern', variant: 'danger' });
    }
    setEditingPatternFor(null);
  };

  const handlePageChange = (page: number) => {
    if (page < 1 || (totalPages && page > totalPages)) return;
    setCurrentPage(page);
  };

  /** 🔹 Local Filtering (Frontend only) */
  const filteredMotives = useMemo(() => {
    let data = [...motives];
    if (statusFilter) data = data.filter((m) => m.status === statusFilter);
    if (calendarFilter) data = data.filter((m) => (m.calendarIds || []).includes(calendarFilter));
    if (hpFilter) {
      const hpCalendars = calendars.filter((c) => c.hpId === hpFilter).map((c) => c.id);
      data = data.filter((m) => m.calendarIds?.some((id: string) => hpCalendars.includes(id)));
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      data = data.filter((m) => m.label?.toLowerCase().includes(q));
    }
    return data;
  }, [motives, statusFilter, calendarFilter, hpFilter, searchTerm, calendars]);

  return (
    <>
      <PageTitle subName="Patterns" title="Motives / Patterns" />

      <Row>
        <Col xl={12}>
          <Card className="shadow-sm">
            {/* 🔹 Header with Add Button */}
            <CardHeader className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 flex-wrap">
              <div className="d-flex align-items-center justify-content-between w-100">
                <CardTitle as="h4" className="mb-0">Motives</CardTitle>
                <Button variant="primary" size="sm" onClick={() => setShowCreateMotive(true)}>
                  + Add Motive
                </Button>
              </div>

              {/* 🔹 Filters Section */}
              <div
                className="d-flex flex-wrap align-items-center gap-2 w-100 w-md-auto"
                style={{ minHeight: 40 }}
              >
                {/* HP Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ minWidth: 180, flex: '1 1 180px' }}
                  value={hpFilter || ''}
                  onChange={(e) => setHpFilter(e.target.value || undefined)}
                >
                  <option value="">All specialties</option>
                  {hps.map((hp) => (
                    <option key={hp.id} value={hp.id}>
                      {hp.firstName ? `${hp.firstName} ${hp.lastName ?? ''}` : hp.id}
                    </option>
                  ))}
                </select>

                {/* Calendar Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ minWidth: 180, flex: '1 1 180px' }}
                  value={calendarFilter || ''}
                  onChange={(e) => setCalendarFilter(e.target.value || undefined)}
                >
                  <option value="">All calendars</option>
                  {calendars.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  className="form-select form-select-sm"
                  style={{ minWidth: 150, flex: '1 1 150px' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                >
                  <option value="">All statuses</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="ARCHIVED">Archived</option>
                </select>

                {/* Search Input */}
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search motives..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ flex: '1 1 220px', minWidth: 180 }}
                />
              </div>
            </CardHeader>

            {/* 🔹 Body */}
            <CardBody className="p-0">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" />
                </div>
              ) : (
                <div className="p-3">
                  {filteredMotives.length === 0 ? (
                    <div className="text-center text-muted py-4">No motives found</div>
                  ) : (
                    <div className="list-group">
                      {filteredMotives.map((m) => (
                        <MotiveCard
                          key={m.id}
                          motive={m}
                          calendars={calendars}
                          hps={hps}
                          onEditCalendars={() => openEditCalendars(m)}
                          onEditPattern={() => openEditPattern(m)}
                          onToggleArchive={() => handleArchiveToggle(m)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </CardBody>

            {/* 🔹 Pagination */}
            <CardFooter>
              <nav aria-label="Pagination">
                <ul className="pagination justify-content-center justify-content-md-end flex-wrap mb-0 gap-1">
                  <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                    <Button
                      variant="link"
                      className="page-link"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      Prev
                    </Button>
                  </li>

                  {[...Array(Math.max(1, totalPages || 1))].map((_, idx) => (
                    <li
                      key={idx}
                      className={`page-item ${currentPage === idx + 1 ? 'active' : ''}`}
                    >
                      <Button
                        variant="link"
                        className="page-link"
                        onClick={() => handlePageChange(idx + 1)}
                      >
                        {idx + 1}
                      </Button>
                    </li>
                  ))}

                  <li className={`page-item ${currentPage === (totalPages || 1) ? 'disabled' : ''}`}>
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

      {/* 🔹 Edit Modals */}
      {editingCalendarsFor && (
        <EditCalendarsModal
          show
          motive={editingCalendarsFor}
          calendars={calendars}
          hps={hps}
          onClose={() => setEditingCalendarsFor(null)}
          onSave={handleCalendarsSaved}
        />
      )}

      {editingPatternFor && (
        <EditPatternModal
          show
          motive={editingPatternFor}
          onClose={() => setEditingPatternFor(null)}
          onSave={handlePatternSaved}
        />
      )}

      {/* 🔹 Create Motive Modal */}
      {showCreateMotive && (
        <CreateMotiveForm
          show
          onClose={() => setShowCreateMotive(false)}
          onSaved={() => {
            showNotification({ message: 'Motive created successfully', variant: 'success' });
            fetchAll(); // ✅ refresh list on success
          }}
        />
      )}
    </>
  );
}
