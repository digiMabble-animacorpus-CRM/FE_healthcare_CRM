// src/app/motives/components/EditCalendarsModal.tsx
'use client';

import React, { useMemo, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

type Props = {
    show: boolean;
    motive: any;
    calendars: any[]; // list of calendars
    hps: any[]; // list of hps
    onClose: () => void;
    onSave: (id: string, calendarIds: string[]) => void;
};

export default function EditCalendarsModal({ show, motive, calendars, hps, onClose, onSave }: Props) {
    const initial = useMemo<Set<string>>(
        () => new Set((motive.calendarIds || []) as string[]),
        [motive]
    );
    const [selected, setSelected] = useState<Set<string>>(initial);
    const [query, setQuery] = useState('');

    // group calendars by HP label (use hpId -> find hp)
    const calendarsWithHp = calendars.map((c) => ({
        ...c,
        hpLabel: hps.find((h) => h.id === c.hpId) ? `${hps.find((h) => h.id === c.hpId).firstName ?? ''} ${hps.find((h) => h.id === c.hpId).lastName ?? ''}`.trim() : 'Other',
    }));

    const grouped = useMemo(() => {
        const g: Record<string, any[]> = {};
        calendarsWithHp.forEach((c) => {
            const key = c.hpLabel || 'Other';
            if (!g[key]) g[key] = [];
            g[key].push(c);
        });
        return g;
    }, [calendarsWithHp]);

    const toggle = (id: string) => {
        const copy = new Set(selected);
        if (copy.has(id)) copy.delete(id);
        else copy.add(id);
        setSelected(copy);
    };

    const onSubmit = () => {
        onSave(motive.id, Array.from(selected));
    };

    const filteredGrouped = useMemo(() => {
        if (!query.trim()) return grouped;
        const q = query.toLowerCase();
        const fg: Record<string, any[]> = {};
        Object.keys(grouped).forEach((k) => {
            const items = grouped[k].filter((c) => (c.label || '').toLowerCase().includes(q));
            if (items.length) fg[k] = items;
        });
        return fg;
    }, [grouped, query]);

    return (
        <Modal show={show} onHide={onClose} centered size="lg">
            <Modal.Header closeButton>
                <Modal.Title>{motive.label}</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                <div className="mb-3">
                    <input className="form-control" placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>

                <div style={{ maxHeight: '50vh', overflow: 'auto' }}>
                    {Object.keys(filteredGrouped).map((group) => (
                        <div key={group} className="mb-2">
                            <div style={{ fontWeight: 600, marginBottom: 6 }}>{group}</div>
                            {filteredGrouped[group].map((cal: any) => (
                                <div key={cal.id} className="d-flex align-items-center mb-1">
                                    <Form.Check
                                        checked={selected.has(cal.id)}
                                        onChange={() => toggle(cal.id)}
                                        type="checkbox"
                                        id={`cal-${cal.id}`}
                                        label={cal.label}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={onSubmit}>To safeguard</Button>
            </Modal.Footer>
        </Modal>
    );
}
