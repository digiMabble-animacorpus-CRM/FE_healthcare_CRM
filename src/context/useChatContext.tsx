'use client'
import { createContext, useContext, useEffect, useState } from 'react'

import { getUserById } from '@/helpers/data'
import type { ChildrenType } from '@/types/component-props'
import type { ChatContextType, ChatOffcanvasStatesType, OffcanvasControlType } from '@/types/context'
import type { UserType } from '@/types/data'

const ChatContext = createContext<ChatContextType | undefined>(undefined)

export const useChatContext = () => {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useChatContext can only be used within ChatProvider')
  }
  return context
}

export const ChatProvider = ({ children }: ChildrenType) => {
  const [activeChat, setActiveChat] = useState<UserType>()
  const [offcanvasStates, setOffcanvasStates] = useState<ChatOffcanvasStatesType>({
    showChatList: false,
    showUserProfile: false,
    showVoiceCall: false,
    showVideoCall: false,
    showUserSetting: false,
  })

  const changeActiveChat = async (userId: UserType['id']) => {
    const user = await getUserById(userId)
    if (user) setActiveChat(user)
  }

  const toggleChatList: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showChatList: !offcanvasStates.showChatList })
  }

  const toggleUserProfile: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showUserProfile: !offcanvasStates.showUserProfile })
  }

  const toggleUserSetting: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showUserSetting: !offcanvasStates.showUserSetting })
  }

  const toggleVoiceCall: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showVoiceCall: !offcanvasStates.showVoiceCall })
  }

  const toggleVideoCall: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showVideoCall: !offcanvasStates.showVideoCall })
  }

  const chatList: ChatContextType['chatList'] = {
    open: offcanvasStates.showChatList,
    toggle: toggleChatList,
  }

  const chatProfile: ChatContextType['chatProfile'] = {
    open: offcanvasStates.showUserProfile,
    toggle: toggleUserProfile,
  }

  const voiceCall: ChatContextType['voiceCall'] = {
    open: offcanvasStates.showVoiceCall,
    toggle: toggleVoiceCall,
  }

  const videoCall: ChatContextType['videoCall'] = {
    open: offcanvasStates.showVideoCall,
    toggle: toggleVideoCall,
  }

  const chatSetting: ChatContextType['chatSetting'] = {
    open: offcanvasStates.showUserSetting,
    toggle: toggleUserSetting,
  }

  useEffect(() => {
    changeActiveChat('101')
  }, [])

  return (
    <ChatContext.Provider
      value={{
        chatSetting,
        activeChat,
        changeActiveChat,
        chatList,
        chatProfile,
        videoCall,
        voiceCall,
      }}>
      {children}
    </ChatContext.Provider>
  )
}
