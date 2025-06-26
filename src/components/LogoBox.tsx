import logoDark from '@/assets/images/logo-light2.png'
import logoLight from '@/assets/images/logo-light2.png'
import logoSm from '@/assets/images/logo-sm.png'
import Image from 'next/image'
import Link from 'next/link'

const LogoBox = () => {
  return (
    <div className="logo-box">
      <Link href="/dashboards/analytics" className="logo-dark">
        <Image width={28} height={28} src={logoSm} className="logo-sm" alt="logo sm" />
        <Image width={200} height={150} src={logoDark} className="logo-lg" alt="logo dark" />
      </Link>
      <Link href="/dashboards/analytics" className="logo-light">
        <Image width={28} height={28} src={logoSm} className="logo-sm" alt="logo sm" />
        <Image width={200} height={150} src={logoLight} className="logo-lg" alt="logo light" />
      </Link>
    </div>
  )
}

export default LogoBox
