'use client'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'

import type { ChildrenType } from '@/types/component-props'
import FallbackLoading from '../FallbackLoading'

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { status } = useSession()
  const { push } = useRouter()
  const pathname = usePathname()
  const [checkingAuth, setCheckingAuth] = useState(true)

//   if (status == 'unauthenticated') {
//     push(`/auth/sign-in?redirectTo=${pathname}`)
//     return <FallbackLoading />
//   }

//   return <Suspense>{children}</Suspense>
// }

 useEffect(() => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null
  if (!token) {
    push(`/auth/sign-in?redirectTo=${pathname}`)
  } else {
    setCheckingAuth(false)
  }
}, [pathname, push])


  if (status === 'loading' || checkingAuth) {
    return <FallbackLoading />
  }

  return <Suspense>{children}</Suspense>
}


export default AuthProtectionWrapper
