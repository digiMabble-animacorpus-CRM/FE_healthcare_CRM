"use client";

import { useState } from "react";
import { Button, Modal } from "react-bootstrap";
import { ControllerRenderProps } from "react-hook-form";

interface Props {
  field: ControllerRenderProps<any, any>;
  error?: string;
  single?: boolean;
}

const DocumentUploadCard = ({ field, error, single = false }: Props) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewFile, setPreviewFile] = useState<File | null>(null);

  const handleView = (file: File) => {
    setPreviewFile(file);
    setShowPreview(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const selectedFiles = Array.from(files);
    field.onChange(single ? selectedFiles[0] : [...(field.value || []), ...selectedFiles]);
  };

  const handleDelete = (index: number) => {
    if (single) {
      field.onChange(null);
    } else {
      const updated = [...field.value];
      updated.splice(index, 1);
      field.onChange(updated);
    }
  };

  const files = single
    ? field.value
      ? [field.value]
      : []
    : Array.isArray(field.value)
    ? field.value
    : [];

  return (
    <>
      <input
        type="file"
        className="form-control"
        accept=".pdf,.doc,.docx"
        multiple={!single}
        onChange={handleChange}
      />
      {files.map((file, idx) => (
        <div
          key={idx}
          className="mt-2 d-flex align-items-center justify-content-between border p-2 rounded bg-light"
        >
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-secondary">
              {file.name.split(".").pop()?.toUpperCase()}
            </span>
            <div>
              <strong>{file.name}</strong>
              <div style={{ fontSize: "0.75rem", color: "#666" }}>
                {(file.size / 1024).toFixed(2)} KB
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <Button size="sm" variant="outline-primary" onClick={() => handleView(file)}>
              View
            </Button>
            <Button size="sm" variant="outline-danger" onClick={() => handleDelete(idx)}>
              Delete
            </Button>
          </div>
        </div>
      ))}

      {error && <small className="text-danger">{error}</small>}

      <Modal show={showPreview} onHide={() => setShowPreview(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Document Preview</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ height: "70vh" }}>
          {previewFile?.type === "application/pdf" ? (
            <iframe
              src={URL.createObjectURL(previewFile)}
              width="100%"
              height="100%"
              style={{ border: "none" }}
            />
          ) : (
            <p>Preview not supported for this file type.</p>
          )}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default DocumentUploadCard;
