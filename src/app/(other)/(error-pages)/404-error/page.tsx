import React from 'react'
import Error404 from './components/Error404'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Page Not Found' }

const page = () => {
  return <Error404 />
}

export default page
