// import type { EmailLabelType, EmailType, UserType } from './data'

import { EmailLabelType, EmailType, UserType } from './data'

export type ThemeType = 'light' | 'dark'

export type OffcanvasControlType = {
  open: boolean
  toggle: () => void
}

export type MenuType = {
  theme: ThemeType
  size: 'default' | 'condensed' | 'hidden' | 'sm-hover-active' | 'sm-hover'
}

export type LayoutState = {
  theme: ThemeType
  topbarTheme: ThemeType
  menu: MenuType
}

export type LayoutOffcanvasStatesType = {
  showThemeCustomizer: boolean
  showActivityStream: boolean
  showBackdrop: boolean
}

export type LayoutType = LayoutState & {
  themeMode: ThemeType
  changeTheme: (theme: ThemeType) => void
  changeTopbarTheme: (theme: ThemeType) => void
  changeMenu: {
    theme: (theme: MenuType['theme']) => void
    size: (size: MenuType['size']) => void
  }
  themeCustomizer: OffcanvasControlType
  activityStream: OffcanvasControlType
  toggleBackdrop: () => void
  resetSettings: () => void
}

export type ChatOffcanvasStatesType = {
  showChatList: boolean
  showUserProfile: boolean
  showVoiceCall: boolean
  showVideoCall: boolean
  showUserSetting: boolean
}

export type EmailOffcanvasStatesType = {
  showNavigationMenu: boolean
  showEmailDetails: boolean
  showComposeEmail: boolean
}

export type ChatContextType = {
  activeChat?: UserType
  changeActiveChat: (userId: UserType['id']) => Promise<void>
  voiceCall: OffcanvasControlType
  videoCall: OffcanvasControlType
  chatList: OffcanvasControlType
  chatProfile: OffcanvasControlType
  chatSetting: OffcanvasControlType
}

export type EmailContextType = {
  activeLabel: EmailLabelType
  changeActiveLabel: (label: EmailLabelType) => void
  activeMail: EmailType['id']
  changeActiveMail: (newMail: EmailType['id']) => void
  navigationBar: OffcanvasControlType
  emailDetails: OffcanvasControlType
  composeEmail: OffcanvasControlType
}
