'use client'

import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import type { StaffType } from '@/types/data'
import dynamic from 'next/dynamic'

// Dynamically import StaffForm to avoid SSR errors
const StaffForm = dynamic(() => import('../staffForm'), { ssr: false })

const CreateStaffPage = () => {
  const router = useRouter()

  const handleCreate = async (data: StaffType) => {
    try {
      console.log('Creating staff...', data)
      toast.success('Staff created successfully!')
      // router.push('/staffs')
    } catch (error) {
      toast.error('Failed to create staff.')
    }
  }

  return <StaffForm onSubmitHandler={handleCreate} />
}

export default CreateStaffPage
