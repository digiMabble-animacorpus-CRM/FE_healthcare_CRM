'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
    Modal,
    Button,
    Form,
    Nav,
    Spinner,
    Alert,
    InputGroup
} from 'react-bootstrap';
import { HexColorPicker } from 'react-colorful';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { createMotive, getAllCalendars, getAllHps, MotiveCreateRequestDto } from '../helpers/motive';

/* ---------------------- Types ---------------------- */

type CalendarDto = {
    id: string;
    label: string;
    hpId?: string;
};

type HpDto = {
    id: string;
    firstName?: string;
    lastName?: string;
};

type FormValues = {
    calendarIds: string[];
    label: string;
    color: string;
    type: 'CABINET' | 'VISITES' | 'VIDEO';
    patientApplicability: 'both' | 'new' | 'existing';
    newPatientDuration?: number;
    existingPatientDuration?: number;
    isBookableOnline?: boolean;
    isSendingNotificationsDisabled?: boolean;
    newPatientOnline?: boolean;
    existingPatientOnline?: boolean;
};

/* ---------------------- Constants ---------------------- */

const INITIAL_PALETTE = [
    '#F7F2CF', '#EADBD2', '#EADAE7', '#DBECF0',
    '#DDEBD6', '#F4F2D9', '#EDEBE0', '#F7DDE2'
];

const COLOR_GRID = [
    ['#F7DDE2', '#F3C5C5', '#E8BEE0', '#CFEAF5', '#D8EFD9', '#F9E7D9', '#EDEDED', '#FADCD9', '#D9E2FF', '#EFD9F7'],
    ['#FDE2DF', '#FFD8B5', '#FFF2B0', '#DFF2C9', '#C8F1D8', '#DDF7F2', '#CCF2FF', '#C5D6FF', '#E5D6FF', '#FFE0F1'],
    ['#FFD5D5', '#FFBFA0', '#FFD680', '#E6FFB2', '#CFFFD2', '#CFF7F0', '#BEE9FF', '#B7C6FF', '#D1BBFF', '#FFB5E6'],
    ['#FFB3B3', '#FF9E66', '#FFD24D', '#BFFD66', '#99FF99', '#66FFD9', '#66E6FF', '#66A3FF', '#9966FF', '#FF66D1'],
];

const hexColorRegex = /^#[0-9A-F]{6}$/i;

/* ---------------------- Validation ---------------------- */

const schema = yup.object({
    calendarIds: yup.array().of(yup.string().required()).min(1, 'Veuillez sélectionner au moins une spécialité.').required(),
    label: yup.string().trim().required('Veuillez entrer un nom de motif.'),
    color: yup.string().matches(hexColorRegex, 'Veuillez choisir une couleur valide.').required(),
    type: yup.string().oneOf(['CABINET', 'VISITES', 'VIDEO']).required('Veuillez sélectionner un type.'),
    patientApplicability: yup.string().oneOf(['both', 'new', 'existing']).required(),
    newPatientDuration: yup.number().transform((v, o) => (o === '' ? undefined : v)).when('patientApplicability', {
        is: (v: string) => v === 'new' || v === 'both',
        then: (s) => s.required('Durée requise.').positive('Doit être > 0.').integer('Doit être un entier.'),
        otherwise: (s) => s.optional(),
    }),
    existingPatientDuration: yup.number().transform((v, o) => (o === '' ? undefined : v)).when('patientApplicability', {
        is: (v: string) => v === 'existing' || v === 'both',
        then: (s) => s.required('Durée requise.').positive('Doit être > 0.').integer('Doit être un entier.'),
        otherwise: (s) => s.optional(),
    }),
    isBookableOnline: yup.boolean().optional(),
    isSendingNotificationsDisabled: yup.boolean().optional(),
});

/* ---------------------- Component ---------------------- */

type Props = {
    show: boolean;
    onClose: () => void;
    onSaved?: () => void;
};

export default function CreateMotiveForm({ show, onClose, onSaved }: Props) {
    const [calendars, setCalendars] = useState<CalendarDto[]>([]);
    const [hps, setHps] = useState<HpDto[]>([]);
    const [loading, setLoading] = useState(false);
    const [query, setQuery] = useState('');
    const [alert, setAlert] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [showDropdown, setShowDropdown] = useState(false);
    const [showColorPicker, setShowColorPicker] = useState(false);
    const [pickerTab, setPickerTab] = useState<'default' | 'personal'>('default');
    const [customColor, setCustomColor] = useState('#fa8c16');
    const [colorPalette, setColorPalette] = useState<string[]>(INITIAL_PALETTE);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const colorPickerRef = useRef<HTMLDivElement>(null);

    const defaultValues: FormValues = {
        calendarIds: [],
        label: '',
        color: INITIAL_PALETTE[0],
        type: 'CABINET',
        patientApplicability: 'both',
        newPatientDuration: 30,
        existingPatientDuration: 30,
        isBookableOnline: true,
        isSendingNotificationsDisabled: false,
        newPatientOnline: true,
        existingPatientOnline: true,
    };

    const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = useForm<FormValues>({
        resolver: yupResolver(schema),
        defaultValues,
    });

    const selectedColor = watch('color');
    const selectedCalendarIds = watch('calendarIds') || [];
    const patientApplicability = watch('patientApplicability');

    /* ---------------------- Click outside handlers ---------------------- */
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
            if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
                setShowColorPicker(false);
            }
        };

        if (showDropdown || showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [showDropdown, showColorPicker]);

    /* ---------------------- Load calendars + hps ---------------------- */
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [cRes, hRes] = await Promise.all([
                    getAllCalendars(1, 200, 'label', 1),
                    getAllHps(1, 500, 'firstName', 1),
                ]);
                setCalendars(cRes.elements || []);
                setHps(hRes.elements || []);
            } catch (e) {
                console.error('Error loading data', e);
                setAlert({ type: 'danger', text: 'Impossible de charger les spécialités ou praticiens.' });
            } finally {
                setLoading(false);
            }
        };
        if (show) load();
    }, [show]);

    useEffect(() => {
        if (selectedColor) setCustomColor(selectedColor);
    }, [selectedColor]);

    /* ---------------------- Group calendars by HP ---------------------- */
    const groupedCalendars = useMemo(() => {
        const map: Record<string, CalendarDto[]> = {};
        calendars.forEach((cal) => {
            const hp = hps.find((h) => h.id === cal.hpId);
            const group = hp ? `${hp.firstName ?? ''} ${hp.lastName ?? ''}`.trim() : 'Autres';
            if (!map[group]) map[group] = [];
            map[group].push(cal);
        });
        return map;
    }, [calendars, hps]);

    /* ---------------------- Filtered by search ---------------------- */
    const filteredGroups = useMemo(() => {
        if (!query.trim()) return groupedCalendars;
        const q = query.toLowerCase();
        const filtered: Record<string, CalendarDto[]> = {};
        Object.keys(groupedCalendars).forEach((group) => {
            const items = groupedCalendars[group].filter((c) => (c.label || '').toLowerCase().includes(q));
            if (items.length) filtered[group] = items;
        });
        return filtered;
    }, [query, groupedCalendars]);

    /* ---------------------- Handlers ---------------------- */
    const toggleCalendar = (id: string) => {
        const curr = Array.isArray(selectedCalendarIds) ? selectedCalendarIds : [];
        const newArr = curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id];
        setValue('calendarIds', newArr, { shouldValidate: true });
    };

    const applyColor = (c: string) => {
        setValue('color', c, { shouldValidate: true });
        setCustomColor(c);
    };

    const applyCustomColor = () => {
        // Add custom color to palette if not already there
        if (!colorPalette.includes(customColor)) {
            setColorPalette([...colorPalette, customColor]);
        }
        applyColor(customColor);
        setShowColorPicker(false);
    };

    const applyDefaultColor = (a: string) => {
        // Add default color to palette if not already there
        if (!colorPalette.includes(a)) {
            setColorPalette([...colorPalette, a]);
        }
        applyColor(a);
        setShowColorPicker(false);
    };

    const onSubmit = async (values: FormValues) => {
        setAlert(null);
        setSubmitting(true);

        const payload: MotiveCreateRequestDto = {
            calendarIds: values.calendarIds,
            label: values.label.trim(),
            color: values.color,
            status: 'ACTIVE',
            isBookableOnline: !!(values.newPatientOnline || values.existingPatientOnline),
            isSendingNotificationsDisabled: !!values.isSendingNotificationsDisabled,
            type: values.type,
            newPatientDuration:
                values.patientApplicability !== 'existing' ? Number(values.newPatientDuration) : undefined,
            existingPatientDuration:
                values.patientApplicability !== 'new' ? Number(values.existingPatientDuration) : undefined,
        };

        const { success, message } = await createMotive(payload);

        if (!success) {
            setAlert({ type: 'danger', text: message || 'Échec de la création du motif.' });
            setSubmitting(false);
            return;
        }

        setAlert({ type: 'success', text: 'Motif créé avec succès.' });
        reset(defaultValues);
        onSaved?.();

        setTimeout(() => {
            setSubmitting(false);
            setAlert(null);
            onClose();
        }, 800);
    };

    /* ---------------------- UI ---------------------- */
    const selectedCount = selectedCalendarIds.length;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered backdrop="static" keyboard={!submitting}>
            <Modal.Header closeButton style={{ borderBottom: 'none' }}>
                <Modal.Title>Ajouter un motif</Modal.Title>
            </Modal.Header>

            <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                    {alert && <Alert variant={alert.type}>{alert.text}</Alert>}

                    {/* 🔹 Specialties Dropdown */}
                    <div className="mb-3 position-relative" ref={dropdownRef}>
                        <Form.Label>Spécialités</Form.Label>
                        <Button
                            variant="outline-secondary"
                            className="w-100 text-start"
                            onClick={() => setShowDropdown(!showDropdown)}
                        >
                            {selectedCount === 0
                                ? 'Sélectionnez les spécialités'
                                : `${selectedCount} spécialité(s) sélectionnée(s)`}
                        </Button>

                        {showDropdown && (
                            <div
                                className="shadow-sm rounded bg-white p-3"
                                style={{
                                    position: 'absolute',
                                    zIndex: 3000,
                                    width: '100%',
                                    maxHeight: '300px',
                                    overflowY: 'auto',
                                    marginTop: 6,
                                    border: '1px solid #eee',
                                }}
                            >
                                <InputGroup className="mb-2">
                                    <Form.Control
                                        placeholder="Rechercher une spécialité..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                    />
                                </InputGroup>

                                {loading ? (
                                    <div className="text-center py-3">
                                        <Spinner animation="border" size="sm" />
                                    </div>
                                ) : (
                                    Object.keys(filteredGroups).map((group) => (
                                        <div key={group} className="mb-3">
                                            <div className="fw-semibold mb-2">{group}</div>
                                            {filteredGroups[group].map((c) => (
                                                <Form.Check
                                                    key={c.id}
                                                    type="checkbox"
                                                    id={`cal-${c.id}`}
                                                    label={c.label}
                                                    checked={selectedCalendarIds.includes(c.id)}
                                                    onChange={() => toggleCalendar(c.id)}
                                                    className="py-1"
                                                />
                                            ))}
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                        {errors.calendarIds && (
                            <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.calendarIds.message}</div>
                        )}
                    </div>

                    {/* 🏷 Nom du motif */}
                    <div className="mb-3">
                        <Form.Label>Nom du motif</Form.Label>
                        <Form.Control placeholder="Eg. Consultation, suivi..." {...register('label')} />
                        {errors.label && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.label.message}</div>}
                    </div>

                    {/* 💧 Couleur */}
                    <div className="mb-3">
                        <Form.Label>Couleur</Form.Label>
                        <div className="d-flex align-items-center gap-2 mt-2 flex-wrap">
                            {colorPalette.map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => applyColor(p)}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        minWidth: 28,
                                        borderRadius: '50%',
                                        border: selectedColor === p ? '3px solid #6b2b2b' : '1px solid #e6dede',
                                        background: p,
                                        cursor: 'pointer',
                                    }}
                                />
                            ))}
                            <button
                                type="button"
                                onClick={() => setShowColorPicker(!showColorPicker)}
                                style={{
                                    width: 28,
                                    height: 28,
                                    minWidth: 28,
                                    borderRadius: '50%',
                                    border: '1px solid #e6dede',
                                    background: '#fff',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}
                            >
                                +
                            </button>
                        </div>

                        {showColorPicker && (
                            <div
                                ref={colorPickerRef}
                                className="shadow-sm rounded p-3 mt-2"
                                style={{
                                    position: 'relative',
                                    zIndex: 3000,
                                    background: '#fff',
                                    width: '100%',
                                    maxWidth: '360px',
                                    border: '1px solid #eee',
                                }}
                            >
                                <Nav variant="tabs" activeKey={pickerTab} onSelect={(k) => setPickerTab(k as any)} className="mb-3">
                                    <Nav.Item><Nav.Link eventKey="default">Par défaut</Nav.Link></Nav.Item>
                                    <Nav.Item><Nav.Link eventKey="personal">Personnalisée</Nav.Link></Nav.Item>
                                </Nav>
                                {pickerTab === 'default' && (
                                    <div className="d-flex flex-column gap-2">
                                        {COLOR_GRID.map((row, idx) => (
                                            <div key={idx} className="d-flex justify-content-between">
                                                {row.map((c) => (
                                                    <div
                                                        key={c}
                                                        onClick={() => { applyDefaultColor(c) }}
                                                        style={{
                                                            width: 26, height: 26, background: c, borderRadius: 4, cursor: 'pointer',
                                                            border: selectedColor === c ? '2px solid #6b2b2b' : '1px solid #e6dede',
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {pickerTab === 'personal' && (
                                    <div className="d-flex flex-column gap-3">
                                        <HexColorPicker color={customColor} onChange={setCustomColor} style={{ width: '100%' }} />
                                        <Form.Control value={customColor} onChange={(e) => setCustomColor(e.target.value)} />
                                        <div style={{ height: 30, width: '100%', background: customColor, border: '1px solid #e6dede' }} />
                                        <div className="d-flex justify-content-end gap-2">
                                            <Button size="sm" variant="light" onClick={() => setShowColorPicker(false)}>Annuler</Button>
                                            <Button size="sm" variant="primary" onClick={applyCustomColor}>Appliquer</Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        {errors.color && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.color.message}</div>}
                    </div>

                    {/* 🩺 Types */}
                    <div className="mb-3">
                        <Form.Label>Types</Form.Label>
                        <div className="d-flex flex-column flex-sm-row gap-2 gap-sm-3 mt-2">
                            <Form.Check inline label="Cabinet" type="radio" value="CABINET" {...register('type')} />
                            <Form.Check inline label="Visites" type="radio" value="VISITES" {...register('type')} />
                            <Form.Check inline label="Consultation vidéo" type="radio" value="VIDEO" {...register('type')} />
                        </div>
                        {errors.type && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.type.message}</div>}
                    </div>

                    {/* 🔔 Notifications */}
                    <div className="mb-3">
                        <Controller
                            control={control}
                            name="isSendingNotificationsDisabled"
                            render={({ field }) => {
                                const checked = !field.value;
                                return (
                                    <Form.Check
                                        type="switch"
                                        id="notif-switch"
                                        label="Envoyer des notifications pour ce motif ?"
                                        checked={checked}
                                        onChange={(e) => field.onChange(!e.target.checked)}
                                    />
                                );
                            }}
                        />
                    </div>

                    {/* 👥 Applicabilité */}
                    <div className="mb-3">
                        <Form.Label>Peut être attribué à</Form.Label>
                        <Form.Select {...register('patientApplicability')}>
                            <option value="both">Patients nouveaux et existants</option>
                            <option value="existing">Patients existants seulement</option>
                            <option value="new">Nouveaux patients uniquement</option>
                        </Form.Select>
                        {errors.patientApplicability && <div className="text-danger mt-1" style={{ fontSize: '0.875rem' }}>{errors.patientApplicability.message}</div>}
                    </div>

                    {/* ⏱ Durées */}
                    <div className="mb-3">
                        <div className="row g-3">
                            {(patientApplicability === 'both' || patientApplicability === 'new') && (
                                <div className="col-12 col-lg-6">
                                    <div className="fw-bold mb-2">Nouveaux patients</div>
                                    <div className="d-flex flex-column gap-2">
                                        <Form.Select {...register('newPatientDuration')}>
                                            {[10, 15, 20, 30, 45, 60].map((d) => (
                                                <option key={d} value={d}>{d} min</option>
                                            ))}
                                        </Form.Select>
                                        <Controller
                                            control={control}
                                            name="newPatientOnline"
                                            render={({ field }) => (
                                                <Form.Check
                                                    type="switch"
                                                    label="Autoriser la prise en ligne"
                                                    checked={!!field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            )}

                            {(patientApplicability === 'both' || patientApplicability === 'existing') && (
                                <div className="col-12 col-lg-6">
                                    <div className="fw-bold mb-2">Patients existants</div>
                                    <div className="d-flex flex-column gap-2">
                                        <Form.Select {...register('existingPatientDuration')}>
                                            {[10, 15, 20, 30, 45, 60].map((d) => (
                                                <option key={d} value={d}>{d} min</option>
                                            ))}
                                        </Form.Select>
                                        <Controller
                                            control={control}
                                            name="existingPatientOnline"
                                            render={({ field }) => (
                                                <Form.Check
                                                    type="switch"
                                                    label="Autoriser la prise en ligne"
                                                    checked={!!field.value}
                                                    onChange={(e) => field.onChange(e.target.checked)}
                                                />
                                            )}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer style={{ borderTop: 'none', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <Button variant="link" onClick={onClose} disabled={submitting} style={{ minWidth: 'auto' }}>
                        Annuler
                    </Button>
                    <Button variant="primary" type="submit" disabled={submitting}>
                        {submitting ? (
                            <>
                                <Spinner as="span" animation="border" size="sm" /> Enregistrement...
                            </>
                        ) : (
                            'Ajouter un motif'
                        )}
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}