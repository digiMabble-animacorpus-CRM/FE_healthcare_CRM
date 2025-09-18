import logoLight from '@/assets/images/logo-light2.png';
import logoSm from '@/assets/images/logo-light23.png';
import Image from 'next/image';
import Link from 'next/link';

const LogoBox = () => {
  return (
    <div className="logo-box">
      <Link href="/dashboards/agent" className="logo-dark">
        <Image width={28} height={28} src={logoSm} className="logo-sm" alt="logo sm" />
        <Image width={120} height={150} src={logoLight} className="logo-lg" alt="logo dark" />
      </Link>
      <Link href="/dashboards/agent" className="logo-light">
        <Image width={28} height={28} src={logoSm} className="logo-sm" alt="logo sm" />
        <Image width={120} height={150} src={logoLight} className="logo-lg" alt="logo light" />
      </Link>
    </div>
  );
};

export default LogoBox;
