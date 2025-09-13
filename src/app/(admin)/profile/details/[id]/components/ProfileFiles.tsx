import IconifyIcon from '@/components/wrappers/IconifyIcon';
import { CardTitle } from 'react-bootstrap';

type FileType = { name: string; size: string; icon: string; variant: string };
type Props = { files?: FileType[] };

const PatientFiles = ({ files = [] }: Props) => {
  return (
    <>
      <CardTitle as={'h4'} className="mt-4">
        Files / Reports:
      </CardTitle>
      <div className="mt-3 d-flex flex-wrap gap-2">
        {files.map((file, idx) => (
          <div
            className="d-flex p-2 gap-2 bg-light-subtle align-items-center text-start position-relative border rounded"
            key={idx}
          >
            <IconifyIcon icon={file.icon} className={`text-${file.variant} fs-24`} />
            <div>
              <h4 className="fs-14 mb-1">{file.name}</h4>
              <p className="fs-12 mb-0">{file.size}</p>
            </div>
            <IconifyIcon icon="ri:download-cloud-line" className=" fs-20 text-muted" />
          </div>
        ))}
      </div>
    </>
  );
};

export default PatientFiles;
