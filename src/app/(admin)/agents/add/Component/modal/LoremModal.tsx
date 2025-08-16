'use client';

import { ReactNode } from 'react';
import '@/assets/scss/components/_loremmodal.scss';

interface LoremModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export default function LoremModal({
  isOpen,
  onClose,
  title = 'Modal Title',
  children,
}: LoremModalProps) {
  if (!isOpen) return null;

  return (
    <div className="lorem-modal-overlay">
      <div className="lorem-modal-container">
        <div className="lorem-modal-header">
          <h3>{title}</h3>
          <button onClick={onClose} className="lorem-modal-close">
            &times;
          </button>
        </div>
        <div className="lorem-modal-body">{children}</div>
        <div className="lorem-modal-footer">
          <button className="save-btn" onClick={onClose}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
