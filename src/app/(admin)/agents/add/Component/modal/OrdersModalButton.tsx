'use client'

import { useState } from 'react'
import LoremModal from '@/app/(admin)/agents/add/Component/modal/LoremModal'
import { Button } from 'react-bootstrap'

export default function OrdersModalButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button variant="primary" onClick={() => setOpen(true)}>Open Modal</Button>
      <LoremModal isOpen={open} onClose={() => setOpen(false)}>
        <p>Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.

Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.

Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus auctor fringilla.</p>
      </LoremModal>
    </>
  )
}
