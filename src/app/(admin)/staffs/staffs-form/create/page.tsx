// staffs/create/page.tsx
'use client'

import { toast } from 'react-toastify'
import { useRouter } from 'next/navigation'
import type { StaffType } from '@/types/data'
import StaffForm from '../staffForm'

const CreateStaffPage = () => {
  const router = useRouter()

  const handleCreate = async (data: StaffType) => {
    try {
      // 🔁 Replace with actual API call
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
