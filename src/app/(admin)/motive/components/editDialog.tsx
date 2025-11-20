'use client';

import React, { useEffect, useState } from 'react';
import { Modal, Button, Form, Nav } from 'react-bootstrap';
import { HexColorPicker } from 'react-colorful';
import { MotiveDto } from '../helpers/motive';

type Props = {
  show: boolean;
  motive: any;
  onClose: () => void;
  onSave: (id: string, payload: Partial<MotiveDto>) => void;
};

// Default pastel palette
const PALETTE = [
  '#F7F2CF', '#EADBD2', '#EADAE7', '#DBECF0', '#DDEBD6', '#F4F2D9', '#EDEBE0', '#FFEB3B',
];

// Grid for default colors (like reference screenshot)
const COLOR_GRID = [
  ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff'],
  ['#ff0080', '#ff8080', '#ffbf00', '#bfff00', '#00ff40', '#00ffbf', '#40ffff', '#4080ff', '#8000ff', '#ff00ff'],
  ['#ff4d4d', '#ff9933', '#ffcc00', '#ccff33', '#99ff33', '#33ff99', '#33ffff', '#3399ff', '#9933ff', '#ff33ff'],
  ['#cc0000', '#cc6600', '#cccc00', '#66cc00', '#00cc66', '#00cccc', '#0066cc', '#0000cc', '#6600cc', '#cc00cc']
];

export default function EditPatternModal({ show, motive, onClose, onSave }: Props) {
  const [label, setLabel] = useState(motive.label || '');
  const [color, setColor] = useState(motive.color || PALETTE[0]);
  const [isSendingNotificationsDisabled, setIsSendingNotificationsDisabled] = useState(
    !!motive.isSendingNotificationsDisabled
  );

  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'default' | 'personalized'>('default');
  const [customColor, setCustomColor] = useState('#fa8c16');

  useEffect(() => {
    setLabel(motive.label || '');
    setColor(motive.color || PALETTE[0]);
    setIsSendingNotificationsDisabled(!!motive.isSendingNotificationsDisabled);
  }, [motive]);

  const submit = () => {
    const payload: Partial<MotiveDto> = {
      label,
      color,
      isSendingNotificationsDisabled,
    };
    onSave(motive.id, payload);
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Change the pattern</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Pattern name input */}
        <Form.Group className="mb-3">
          <Form.Label>Pattern name</Form.Label>
          <Form.Control
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Enter pattern name"
          />
        </Form.Group>

        {/* Color palette section */}
        <div className="mb-3">
          <div className="mb-2">Choose color</div>
          <div className="d-flex align-items-center flex-wrap gap-2 position-relative">
            {PALETTE.map((p) => (
              <button
                key={p}
                onClick={() => {
                  setColor(p);
                  setShowColorPicker(false);
                }}
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  border: color === p ? '3px solid #6b2b2b' : '1px solid #ccc',
                  background: p,
                  cursor: 'pointer',
                }}
                aria-label={`color-${p}`}
              />
            ))}

            {/* + Button to open color picker */}
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                border: '1px solid #ccc',
                background: '#fff',
                color: '#6b2b2b',
                fontWeight: 'bold',
                fontSize: 18,
                lineHeight: 1,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              aria-label="add-custom-color"
              title="Choose custom color"
            >
              +
            </button>

            {/* Popover Color Picker */}
            {showColorPicker && (
              <div
                className="shadow-lg p-3 bg-white rounded position-absolute"
                style={{
                  top: 40,
                  left: 0,
                  zIndex: 100,
                  width: 300,
                  maxHeight: 400,
                  overflowY: 'auto',
                }}
              >
                <Nav
                  variant="tabs"
                  activeKey={pickerTab}
                  onSelect={(k) => setPickerTab(k as 'default' | 'personalized')}
                  className="mb-3"
                >
                  <Nav.Item>
                    <Nav.Link eventKey="default">Default</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="personalized">Personalized</Nav.Link>
                  </Nav.Item>
                </Nav>

                {/* Default Tab */}
                {pickerTab === 'default' && (
                  <div className="d-flex flex-column gap-2">
                    {COLOR_GRID.map((row, rowIndex) => (
                      <div key={rowIndex} className="d-flex justify-content-between">
                        {row.map((c) => (
                          <div
                            key={c}
                            onClick={() => {
                              setColor(c);
                              setCustomColor(c);
                              setShowColorPicker(false);
                            }}
                            style={{
                              width: 24,
                              height: 24,
                              background: c,
                              borderRadius: 4,
                              cursor: 'pointer',
                              border: color === c ? '2px solid #6b2b2b' : '1px solid #ccc',
                            }}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* Personalized Tab */}
                {pickerTab === 'personalized' && (
                  <div className="d-flex flex-column align-items-start gap-3">
                    <HexColorPicker color={customColor} onChange={setCustomColor} />
                    <Form.Control
                      type="text"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      placeholder="#fa8c16"
                    />
                    <div
                      className="mt-2 rounded"
                      style={{
                        background: customColor,
                        width: '100%',
                        height: 30,
                        border: '1px solid #ccc',
                      }}
                    ></div>
                    <div className="d-flex justify-content-end w-100 gap-2">
                      <Button
                        variant="light"
                        size="sm"
                        onClick={() => setShowColorPicker(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          setColor(customColor);
                          setShowColorPicker(false);
                        }}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Notification switch */}
        <div className="mb-3">
          <Form.Check
            type="switch"
            id="notifications-switch"
            label="Send notifications for this reason?"
            checked={!isSendingNotificationsDisabled}
            onChange={(e) => setIsSendingNotificationsDisabled(!e.target.checked)}
          />
          <div className="text-muted" style={{ fontSize: 12 }}>
            Notifications are necessary for video consultations and cannot be disabled for this reason.
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={submit}>
          Apply to all calendars
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
