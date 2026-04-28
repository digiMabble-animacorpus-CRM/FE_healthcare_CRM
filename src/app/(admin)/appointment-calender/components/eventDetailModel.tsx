"use client";

import React from "react";
import { Modal, Button } from "react-bootstrap";
import type { CalendarEvent } from "../events/types";
import type { Calendar } from "../calendars/types";
import type { HealthProfessional } from "../hps/types";
import type { Patient } from "../patients/types";
import type { Site } from "../sites/types";

interface Props {
  event: CalendarEvent | null;
  calendars: Calendar[];
  hps: HealthProfessional[];
  patients: Patient[];
  sites: Site[];
  onClose: () => void;
  onEdit: (id: string) => void;   // 👈 NEW
}

const EventDetailsModal: React.FC<Props> = ({
  event,
  calendars,
  hps,
  patients,
  sites,
  onClose,
  onEdit,
}) => {
  if (!event) return null;

  const calendar = calendars.find((c) => c.id === event.calendarId);
  const hp = hps.find((h) => h.id === calendar?.hpId);
  const site = sites.find((s) => s.id === calendar?.siteId);
  const patient = patients.find(
    (p) => p.externalId === event.patientExId || p.id === event.patientExId
  );

  const translate = (val: string) => {
    const map: Record<string, string> = {
      // Statuses
      ACTIVE: 'Actif',
      PENDING: 'En attente',
      CANCELED: 'Annulé',
      DELETED: 'Supprimé',
      NO_SHOW: 'Non présenté',
      IN_WAITING_ROOM: 'En salle d attente',
      IN_CONSULTATION: 'En consultation',
      OVERDUE: 'En retard',
      SEEN: 'Terminé',
      CONFIRMED: 'Confirmé',

      // Types
      APPOINTMENT: 'Rendez-vous',
      LEAVE: 'Congé',
      PERSONAL: 'Personnel',
      EXTERNAL_EVENT: 'Événement externe',
      BUSY: 'Occupé',
    };
    return map[val] || val;
  };

  return (
    <Modal show={true} onHide={onClose} centered backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>{event.title || 'Détails de l’événement'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <p>
          <strong>Heure :</strong> {new Date(event.startAt).toLocaleString()} —{' '}
          {new Date(event.endAt).toLocaleString()}
        </p>

        <p>
          <strong>Thérapeute :</strong> {hp ? `${hp.firstName} ${hp.lastName}` : '—'}
        </p>

        <p>
          <strong>Site :</strong> {site?.name || '—'}
        </p>

        <p>
          <strong>Patient :</strong>{' '}
          {patient ? `${patient.firstName} ${patient.lastName}` : 'Aucun patient associé'}
        </p>

        <p>
          <strong>Type :</strong> {translate(event.type)}
        </p>

        <p>
          <strong>Statut :</strong> {translate(event.status)}
        </p>

        {event.description && (
          <p>
            <strong>Description :</strong> {event.description}
          </p>
        )}

        {event.patientNote && (
          <p>
            <strong>Note du patient :</strong> {event.patientNote}
          </p>
        )}

        {event.hpNote && (
          <p>
            <strong>Note du professionnel de santé :</strong> {event.hpNote}
          </p>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button
          variant="primary"
          onClick={() => {
            onClose();
            onEdit(event.id);
          }}
        >
          Modifier
        </Button>

        <Button variant="secondary" onClick={onClose}>
          Fermer
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default EventDetailsModal;
