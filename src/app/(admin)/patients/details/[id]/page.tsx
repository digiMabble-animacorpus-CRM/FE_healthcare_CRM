'use client';

import PageTitle from '@/components/PageTitle';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

import {
  getPatientById,
  getPatientEvents,
  updateEventNote,
  deletePatient,
} from '@/helpers/patient';

import type { PatientType } from '@/types/data';
import {
  Button,
  Card,
  Spinner,
  Table,
  Pagination,
  Modal,
  Form,
  Dropdown,
  ButtonGroup,
} from 'react-bootstrap';
import dayjs from 'dayjs';
import PatientFormModal from '../../components/PatientFormModal';
import { BsThreeDotsVertical } from "react-icons/bs";

const calculateAge = (birthdate: { year: number; month: number; day: number }) => {
  if (!birthdate?.year) return null;

  const now = dayjs();
  const birth = dayjs(
    `${birthdate.year}-${birthdate.month}-${birthdate.day > 0 ? birthdate.day : 1}`,
  );
  return now.diff(birth, 'year');
};

const PatientDetailsPage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [patient, setPatient] = useState<PatientType | null>(null);
  const [loading, setLoading] = useState(true);

  // Events
  const [events, setEvents] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Note Modal
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  const [noteText, setNoteText] = useState('');
  const [saving, setSaving] = useState(false);

  // Edit Patient Modal
  const [showEditModal, setShowEditModal] = useState(false);

  // Delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch patient
  useEffect(() => {
    if (!id) return;

    const fetchPatient = async () => {
      setLoading(true);

      try {
        const data = await getPatientById(id);
        if (!data) throw new Error('Failed to fetch');

        setPatient(data);
      } catch {
        router.push('/patients/patient-list');
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, router]);

  // Fetch events
  const fetchEvents = async () => {
    if (!id) return;

    setEventsLoading(true);
    const result = await getPatientEvents(id as string, currentPage, limit);

    setEvents(result.elements || []);
    setTotalCount(result.totalCount || 0);
    setEventsLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, [id, currentPage]);

  // Open Note Modal
  const handleOpenNoteModal = (event: any) => {
    setSelectedEvent(event);
    setNoteText(event.hpNote || '');
    setShowModal(true);
  };

  const handleCloseNoteModal = () => {
    setShowModal(false);
    setSelectedEvent(null);
    setNoteText('');
  };

  const handleSaveNote = async () => {
    if (!selectedEvent) return;

    setSaving(true);
    const success = await updateEventNote(selectedEvent.id, noteText);
    setSaving(false);

    if (success) {
      handleCloseNoteModal();
      fetchEvents();
    } else {
      alert('Failed to save note. Try again.');
    }
  };

  // Delete patient
  const confirmDelete = async () => {
    if (!patient) return;

    setDeleting(true);

    const payload = [];

    const success = await deletePatient(patient.id, patient.externalId || undefined);

    setDeleting(false);

    if (!success) {
      alert('Delete failed');
      return;
    }

    // redirect after delete
    router.push('/patients/patient-list');
  };

  // Loading states
  if (loading)
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
        <p className="mt-2">Loading patient details...</p>
      </div>
    );

  if (!patient)
    return (
      <div className="text-center py-5 text-muted">
        <p>No patient data found.</p>
      </div>
    );

  const email = patient.contactInfos?.find((c) => c.type === 'EMAIL')?.value || 'N/A';
  const phone = patient.contactInfos?.find((c) => c.type === 'PHONE')?.value || 'N/A';
  const address = patient.address || {};

  return (
    <>
      {/* Back button */}
      <Button
        className="mb-3"
        variant="text"
        size="sm"
        onClick={() => router.push('/patients/patient-list')}
      >
        ← Back to List
      </Button>

      <PageTitle subName="Patient" title="Détails du patient" />

      {/* Patient Info */}
      <Card className="shadow-sm border-0 mt-3">
        <Card.Body>
          {/* TITLE + ACTIONS DROPDOWN */}
          <div className="d-flex justify-content-between align-items-center">
            <h4 className="mb-3">
              {patient.firstName} {patient.lastName}
            </h4>

            {/* ACTIONS DROPDOWN */}
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle
                variant="light"
                className="border-0 p-0"
                id="actions-dropdown"
                style={{ background: 'transparent', boxShadow: 'none' }}
              >
                <BsThreeDotsVertical size={20} />
              </Dropdown.Toggle>

              <Dropdown.Menu align="end">
                <Dropdown.Item onClick={() => setShowEditModal(true)}>Edit Patient</Dropdown.Item>

                <Dropdown.Divider />

                <Dropdown.Item className="text-danger" onClick={() => setShowDeleteModal(true)}>
                  Delete Patient
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>

          {/* PATIENT FIELDS */}
          <div className="row">
            <div className="col-md-6 mb-3">
              <strong>External ID:</strong>
              <br /> {patient.externalId || 'N/A'}
            </div>

            <div className="col-md-6 mb-3">
              <strong>SSIN:</strong>
              <br /> {patient.ssin || 'N/A'}
            </div>

            <div className="col-md-6 mb-3">
              <strong>Gender:</strong>
              <br /> {patient.legalGender || 'N/A'}
            </div>

            <div className="col-md-6 mb-3">
              <strong>Language:</strong>
              <br /> {patient.language || 'N/A'}
            </div>

            <div className="col-md-6 mb-3">
              <strong>Birthdate:</strong>
              <br />
              {patient.birthdate
                ? `${patient.birthdate.day}/${patient.birthdate.month}/${patient.birthdate.year} (${calculateAge(patient.birthdate)} yrs)`
                : 'N/A'}
            </div>

            <div className="col-md-6 mb-3">
              <strong>Status:</strong>
              <br />
              <span className={`badge bg-${patient.status === 'ACTIVE' ? 'success' : 'secondary'}`}>
                {patient.status}
              </span>
            </div>

            <div className="col-md-6 mb-3">
              <strong>Email:</strong>
              <br /> {email}
            </div>

            <div className="col-md-6 mb-3">
              <strong>Phone:</strong>
              <br /> {phone}
            </div>

            <div className="col-md-12 mb-3">
              <strong>Address:</strong>
              <br />
              {address.street ? (
                <>
                  {address.street} {address.number && `, ${address.number}`} <br />
                  {address.zipCode} {address.city} <br />
                  {address.country}
                </>
              ) : (
                'N/A'
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Appointments */}
      <Card className="shadow-sm border-0 mt-4">
        <Card.Body>
          <h5 className="mb-3">Appointments</h5>

          {eventsLoading ? (
            <div className="text-center py-4">
              <Spinner animation="border" />
              <p className="mt-2">Loading appointments...</p>
            </div>
          ) : events.length === 0 ? (
            <p className="text-muted text-center py-3">No appointments found.</p>
          ) : (
            <>
              <Table hover responsive className="align-middle">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Pattern</th>
                    <th>Status</th>
                    <th>Calendar</th>
                    <th>Note</th>
                    <th className="text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td>{dayjs(event.startAt).format('DD/MM/YYYY HH:mm')}</td>
                      <td>{event.motiveLabel || '—'}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            event.status === 'CANCELED'
                              ? 'danger'
                              : event.status === 'ACTIVE'
                                ? 'success'
                                : 'secondary'
                          }`}
                        >
                          {event.status || '—'}
                        </span>
                      </td>
                      <td>{event.calendarLabel || '—'}</td>

                      <td style={{ whiteSpace: 'pre-wrap' }}>
                        {event.hpNote || <span className="text-muted">No note</span>}
                      </td>

                      <td className="text-center">
                        <Button
                          variant="link"
                          size="sm"
                          className={`p-0 ${event.hpNote ? 'text-primary' : 'text-success'}`}
                          onClick={() => handleOpenNoteModal(event)}
                        >
                          {event.hpNote ? 'Edit Note' : 'Add Note'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {totalCount > limit && (
                <div className="d-flex justify-content-center mt-3">
                  <Pagination>
                    {Array.from({ length: Math.ceil(totalCount / limit) }, (_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                  </Pagination>
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>

      {/* Add/Edit Note Modal */}
      <Modal show={showModal} onHide={handleCloseNoteModal} centered>
        <Modal.Header closeButton>
          <Modal.Title>{selectedEvent?.motiveLabel || 'Note'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="mb-1">
            <strong>{selectedEvent?.calendarLabel}</strong>
          </p>
          <p className="text-muted">
            {selectedEvent && dayjs(selectedEvent.startAt).format('MMM D — h:mm A')}
          </p>

          <Form.Group>
            <Form.Control
              as="textarea"
              rows={4}
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Add a note"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={handleCloseNoteModal}>
            Cancel
          </Button>
          <Button variant="danger" disabled={saving} onClick={handleSaveNote}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Patient Modal */}
      {showEditModal && (
        <PatientFormModal
          show={showEditModal}
          mode="edit"
          patientId={patient.id}
          onClose={() => setShowEditModal(false)}
          onSaved={async () => {
            const refreshed = await getPatientById(patient.id);
            setPatient(refreshed);
          }}
        />
      )}

      {/* Delete Patient Confirmation */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Delete Patient</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          Are you sure you want to delete{' '}
          <strong>
            {patient.firstName} {patient.lastName}
          </strong>
          ? <br />
          This action cannot be undone.
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default PatientDetailsPage;
