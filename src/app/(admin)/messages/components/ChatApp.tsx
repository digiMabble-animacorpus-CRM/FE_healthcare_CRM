'use client'
import { useEffect, useState } from 'react'
import { Col, Offcanvas } from 'react-bootstrap'

import { getAllUsers, getUserById } from '@/helpers/data'
import type { UserType } from '@/types/data'
import ChatArea from './ChatArea'
import ChatLeftSidebar from './ChatLeftSidebar'
import { useChatContext } from '@/context/useChatContext'

const fetchSingleUser = async (id: UserType['id']) => {
  const data = await getUserById(id)
  if (data) return data
}

const fetchUsers = async () => {
  const data = await getAllUsers()
  if (data) return data
}

const ChatApp = () => {
  const [selectedUser, setSelectedUser] = useState<UserType>()
  const [users, setUsers] = useState<UserType[]>()
  const { chatList } = useChatContext()

  useEffect(() => {
    const fetchInitial = async () => {
      setSelectedUser(await fetchSingleUser('1'))
      setUsers(await fetchUsers())
    }
    fetchInitial()
  }, [])

  const onUserChange = async (user: UserType) => {
    setSelectedUser(await fetchSingleUser(user.id))
  }

  return (
    <>
      {/* <Col xxl={3}>
        {users && selectedUser && (
          <>
            <Offcanvas
              show={chatList.open}
              onHide={chatList.toggle}
              className="offcanvas-xxl offcanvas-start h-100"
              tabIndex={-1}
              id="Contactoffcanvas"
              aria-labelledby="ContactoffcanvasLabel">
              <ChatLeftSidebar users={users} onUserSelect={onUserChange} selectedUser={selectedUser} />
            </Offcanvas>
            <div className="d-none d-xxl-block">
              <ChatLeftSidebar users={users} onUserSelect={onUserChange} selectedUser={selectedUser} />
            </div>
          </>
        )}
      </Col> */}

      <Col xxl={12}>{selectedUser && <ChatArea selectedUser={selectedUser} />}</Col>
    </>
  )
}

export default ChatApp
