'use client'
import { createContext, useContext, useState } from 'react'

import type { ChildrenType } from '@/types/component-props'
import type { EmailContextType, EmailOffcanvasStatesType, OffcanvasControlType } from '@/types/context'
import type { EmailLabelType, EmailType } from '@/types/data'

const EmailContext = createContext<EmailContextType | undefined>(undefined)

export const useEmailContext = () => {
  const context = useContext(EmailContext)
  if (!context) {
    throw new Error('useEmailContext can only be used within EmailProvider')
  }
  return context
}

export const EmailProvider = ({ children }: ChildrenType) => {
  const [activeLabel, setActiveLabel] = useState<EmailLabelType>('Primary')
  const [activeMail, setActiveMail] = useState<EmailType['id']>('2001')
  const [offcanvasStates, setOffcanvasStates] = useState<EmailOffcanvasStatesType>({
    showNavigationMenu: false,
    showEmailDetails: false,
    showComposeEmail: false,
  })

  const changeActiveLabel: EmailContextType['changeActiveLabel'] = (newLabel) => {
    setActiveLabel(newLabel)
  }

  const changeActiveMail: EmailContextType['changeActiveMail'] = (newMail) => {
    setActiveMail(newMail)
    toggleEmailDetails()
  }

  const toggleNavigationMenu: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showNavigationMenu: !offcanvasStates.showNavigationMenu })
  }

  const toggleEmailDetails: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showEmailDetails: !offcanvasStates.showEmailDetails })
  }

  const toggleComposeEmail: OffcanvasControlType['toggle'] = () => {
    setOffcanvasStates({ ...offcanvasStates, showComposeEmail: !offcanvasStates.showComposeEmail })
  }

  const navigationBar: EmailContextType['navigationBar'] = {
    open: offcanvasStates.showNavigationMenu,
    toggle: toggleNavigationMenu,
  }

  const emailDetails: EmailContextType['emailDetails'] = {
    open: offcanvasStates.showEmailDetails,
    toggle: toggleEmailDetails,
  }

  const composeEmail: EmailContextType['composeEmail'] = {
    open: offcanvasStates.showComposeEmail,
    toggle: toggleComposeEmail,
  }

  return (
    <EmailContext.Provider
      value={{
        activeLabel,
        changeActiveLabel,
        activeMail,
        changeActiveMail,
        navigationBar,
        emailDetails,
        composeEmail,
      }}>
      {children}
    </EmailContext.Provider>
  )
}
