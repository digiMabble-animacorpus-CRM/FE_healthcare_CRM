'use client';

import React, { useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

type Props = {
  show: boolean;
  motive: any;
  calendars: any[];
  hps: any[];
  onClose: () => void;
  onSave: (id: string, calendarIds: string[]) => void;
};

export default function EditCalendarsModal({
  show,
  motive,
  calendars,
  hps,
  onClose,
  onSave,
}: Props) {
  const initial = useMemo<Set<string>>(
    () => new Set((motive?.calendarIds || []) as string[]),
    [motive],
  );

  const [selected, setSelected] = useState<Set<string>>(initial);
  const [query, setQuery] = useState('');

  // add HP label to each calendar
  const calendarsWithHp = calendars.map((c) => {
    const hp = hps.find((h) => h.id === c.hpId);
    const hpLabel = hp ? `${hp.firstName} ${hp.lastName}` : 'Other';

    return { ...c, hpLabel };
  });

  // group calendars by HP
  const grouped = useMemo(() => {
    const result: Record<string, any[]> = {};

    calendarsWithHp.forEach((cal) => {
      const key = cal.hpLabel || 'Other';
      if (!result[key]) result[key] = [];
      result[key].push(cal);
    });

    return result;
  }, [calendarsWithHp]);

  const toggle = (id: string) => {
    const copy = new Set(selected);
    if (copy.has(id)) copy.delete(id);
    else copy.add(id);
    setSelected(copy);
  };

  const filteredGrouped = useMemo(() => {
    if (!query.trim()) return grouped;

    const fg: Record<string, any[]> = {};
    const q = query.toLowerCase();

    Object.keys(grouped).forEach((group) => {
      const items = grouped[group].filter((c) => (c.label || '').toLowerCase().includes(q));
      if (items.length) fg[group] = items;
    });

    return fg;
  }, [grouped, query]);

  const submit = () => {
    onSave(motive.id, Array.from(selected));
  };

  return (
    <Modal show={show} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Edit calendars for: {motive.label}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <input
          className="form-control mb-3"
          placeholder="Search calendar..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div style={{ maxHeight: '55vh', overflow: 'auto' }}>
          {Object.keys(filteredGrouped).map((group) => (
            <div key={group} className="mb-2">
              <div style={{ fontWeight: 600, marginBottom: 6 }}>{group}</div>

              {filteredGrouped[group].map((cal) => (
                <div key={cal.id} className="d-flex align-items-center mb-1">
                  <Form.Check
                    type="checkbox"
                    id={`cal-${cal.id}`}
                    checked={selected.has(cal.id)}
                    onChange={() => toggle(cal.id)}
                    label={cal.label}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          To safeguard
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
