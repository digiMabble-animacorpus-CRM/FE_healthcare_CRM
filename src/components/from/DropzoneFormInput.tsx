'use client';

import { Card, Col, FormLabel, FormText, Row } from 'react-bootstrap';
import Dropzone from 'react-dropzone';
import useFileUploader from '@/hooks/useFileUploader';
import IconifyIcon from '../wrappers/IconifyIcon';
import { DropzoneFormInputProps } from '@/types/component-props';

const DropzoneFormInput = ({
  label,
  labelClassName,
  helpText,
  iconProps,
  showPreview,
  className,
  text,
  textClassName,
  onFileUpload,
}: DropzoneFormInputProps) => {
  const { selectedFiles, handleAcceptedFiles, removeFile } = useFileUploader(showPreview);

  return (
    <>
      {label && <FormLabel className={labelClassName}>{label}</FormLabel>}

      <Dropzone
        onDrop={(acceptedFiles) => handleAcceptedFiles(acceptedFiles, onFileUpload)}
        maxFiles={5}
        accept={{
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'application/pdf': ['.pdf'],
        }}
      >
        {({ getRootProps, getInputProps }) => (
          <>
            <div className={`dropzone dropzone-custom ${className}`}>
              <div className="dz-message" {...getRootProps()}>
                <input {...getInputProps()} />
                <IconifyIcon icon={iconProps?.icon ?? 'bx:cloud-upload'} {...iconProps} />
                <h3 className={textClassName}>{text}</h3>
                {helpText && typeof helpText === 'string' ? (
                  <FormText>{helpText}</FormText>
                ) : (
                  helpText
                )}
              </div>
            </div>

            {showPreview && selectedFiles.length > 0 && (
              <div className="dz-preview mt-3">
                {selectedFiles.map((file, idx) => {
                  const ext = file.name?.split('.').pop()?.toUpperCase() || 'FILE';

                  return (
                    <Card className="mt-1 mb-0 shadow-none border" key={`${idx}-file`}>
                      <div className="p-2">
                        <Row className="align-items-center">
                          <Col xs="auto">
                            {file.preview ? (
                              <img
                                data-dz-thumbnail
                                className="avatar-sm rounded bg-light"
                                alt={file.name}
                                src={file.preview}
                              />
                            ) : (
                              <div className="avatar-sm">
                                <span className="avatar-title bg-primary rounded">{ext}</span>
                              </div>
                            )}
                          </Col>
                          <Col className="ps-0">
                            <span className="text-muted fw-bold">{file.name}</span>
                            <p className="mb-0">
                              <strong>{file.formattedSize}</strong>
                            </p>
                          </Col>
                          <Col className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-primary"
                              onClick={() => removeFile(file)}
                            >
                              Supprimer
                            </button>
                          </Col>
                        </Row>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </Dropzone>
    </>
  );
};

export default DropzoneFormInput;
