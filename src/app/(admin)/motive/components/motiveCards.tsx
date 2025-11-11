'use client';

import React from 'react';
import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { Button } from 'react-bootstrap';

type Props = {
  motive: any;
  calendars: any[];
  hps: any[];
  onEditCalendars: () => void;
  onEditPattern: () => void;
  onToggleArchive: () => void;
};

export default function MotiveCard({
  motive,
  calendars,
  hps,
  onEditCalendars,
  onEditPattern,
  onToggleArchive,
}: Props) {
  const count = (motive.calendarIds || []).length;

  // Get calendar labels (limit to 3)
  const calendarLabels = (motive.calendarIds || [])
    .map((cid: string) => calendars.find((c) => c.id === cid)?.label)
    .filter(Boolean)
    .slice(0, 3);

  return (
    <div
      className="list-group-item border-0 shadow-sm d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 p-3"
      style={{
        borderRadius: 10,
        background: '#fff',
        marginBottom: 10,
      }}
    >
      {/* Left section: label + color + calendars */}
      <div className="d-flex flex-wrap align-items-start align-items-md-center gap-3">
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: motive.color || '#ddd',
            flexShrink: 0,
          }}
        />

        <div style={{ minWidth: 180 }}>
          <div
            className="fw-semibold text-truncate"
            style={{ maxWidth: 250 }}
          >
            {motive.label || '—'}
          </div>

          <div
            className="text-muted text-truncate"
            style={{ fontSize: 13, maxWidth: 300 }}
          >
            {calendarLabels.length > 0
              ? calendarLabels.join(', ')
              : '—'}
          </div>
        </div>
      </div>

      {/* Right section: icons + actions */}
      <div className="d-flex flex-wrap justify-content-start justify-content-md-end align-items-center gap-2 w-auto">
        {/* Notification icon */}
        {motive.isSendingNotificationsDisabled && (
          <IconifyIcon
            icon="ic:baseline-notifications-off"
            className="text-muted flex-shrink-0"
            style={{ fontSize: 18 }}
          />
        )}

        {/* Calendar count */}
        <div className="text-muted d-flex align-items-center me-1">
          <IconifyIcon
            icon="ic:twotone-calendar-month"
            className="me-1"
          />
          <span style={{ fontSize: 13 }}>{count}</span>
        </div>

        {/* Action buttons */}
        <div className="d-flex gap-1 flex-wrap">
          <Button
            variant="light"
            size="sm"
            className="d-flex align-items-center"
            onClick={onEditPattern}
            title="Edit pattern"
          >
            <IconifyIcon icon="ic:round-mode-edit" />
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center"
            onClick={onEditCalendars}
            title="Edit calendars"
          >
            <IconifyIcon icon="ic:outline-edit-calendar" className="fs-6" />
          </Button>

          <Button
            variant="outline-secondary"
            size="sm"
            className="d-flex align-items-center"
            onClick={onToggleArchive}
            title={
              motive.status === 'ARCHIVED' ? 'Restore' : 'Push to Archive'
            }
          >
            <IconifyIcon
              icon={
                motive.status === 'ARCHIVED'
                  ? 'ic:outline-published-with-changes'
                  : 'ic:baseline-archive'
              }
              className="fs-6"
            />
          </Button>
        </div>
      </div>
    </div>
  );
}
