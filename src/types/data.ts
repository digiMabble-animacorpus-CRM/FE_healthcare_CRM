import { StaticImageData } from 'next/image'
import { BootstrapVariantType } from './component-props'

export type IdType = string

export type EmailLabelType = 'Primary' | 'Social' | 'Promotions' | 'Updates' | 'Forums'

export type EmailType = {
  id: IdType
  fromId: UserType['id']
  from?: UserType
  toId: UserType['id']
  to?: UserType
  subject?: string
  content?: string
  attachments?: FileType[]
  label?: EmailLabelType
  starred?: boolean
  important?: boolean
  draft?: boolean
  deleted?: boolean
  read?: boolean
  createdAt: Date
}

export type ReviewType = {
  count: number
  stars: number
}
export type Employee = {
  id: IdType
  name: string
  email: string
  position: string
  company: string
  country: string
}

export type NotificationType = {
  from: string
  content: string
  icon?: StaticImageData
}

export type UserType = {
  id: IdType
  name: string
  avatar: StaticImageData
  email: string
  mutualCount: number
  contact: string
  activityStatus: 'typing' | 'online' | 'offline'
  languages: string[]
  status?: 'Active' | 'Inactive'
  address?: string
  message?: string
  time: Date
  hasRequested?: boolean
  chatIcon?: string
  location: string
  emailMessage?: string
}

export type AgentType = {
  id: IdType
  address: string
  userId: UserType['id']
  user?: UserType
  experience: number
  properties: number
  date: Date
}

export type TransactionType = {
  id: IdType
  invoiceNumber: string
  purchaseDate: Date
  description: string
  status: 'Cr' | 'Dr'
  userId: UserType['id']
  user?: UserType
  propertyId: PropertyType['id']
  property?: PropertyType
  amount: string
  paymentType: 'Mastercard' | 'Visa' | 'Paypal'
  paymentStatus: 'Completed' | 'Cancel' | 'Pending'
  orderId: string
  agentName: string
  amountStatus: 'Paid' | 'Unpaid' | 'Pending'
  investedProperty: string
  paymentMethod: {
    card: StaticImageData
    name: string
  }
}

export type PropertyType = {
  id: IdType
  icon: string
  image: StaticImageData
  name: string
  propertyType: string
  location: string
  beds: number
  bath: number
  flor: number
  size: number
  price: string
  country: string
  type: 'Rent' | 'Sold' | 'Sale'
  variant: string
  save?: boolean
}

export type CustomerType = {
  id: IdType
  propertyType: string
  userId: UserType['id']
  user?: UserType
  interestedProperties: string
  customerStatus: 'Interested' | 'Under Review' | 'Follow-up'
  date: Date
  status: 'Available' | 'Unavailable'
  propertyView: number
  propertyOwn: number
  invest: string
}

export type CustomerReviewsType = {
  id: IdType
  rating: number
  userId: UserType['id']
  user?: UserType
  propertyId: PropertyType['id']
  property?: PropertyType
  review: {
    title: string
    description: string
  }
  reviewStatus: 'Published' | 'Pending'
  date: Date
}

// export type SocialUserType = {
//   id: IdType
//   avatar: StaticImageData
//   name: string
//   activityStatus: 'typing' | 'online' | 'offline'
//   email: string
//   phone: string
//   languages: string[]
//   location: string
//   mutualCount: number
//   hasRequested?: boolean
//   message?: string
//   time: Date
//   status?: string
// }

export type FileType = Partial<File> & {
  preview?: string
}

export type ChatMessageType = {
  id: IdType
  from: UserType
  to: UserType
  message: {
    type: 'file' | 'text'
    value: FileType[] | string
  }
  sentOn?: Date
}

export type ActivityType = {
  title: string
  icon?: string
  variant?: BootstrapVariantType
  status?: 'completed' | 'latest'
  files?: FileType[]
  time: Date
  type?: 'task' | 'design' | 'achievement'
  content?: string
}

export type SocialEventType = {
  id: IdType
  title: string
  venue: string
  type: 'togetherness' | 'celebration' | 'professional'
  image: StaticImageData
  startsAt: Date
}

export type GroupType = {
  id: IdType
  name: string
  description: string
  time: Date
  groupName: string
  change?: number
  variant: string
}

export type EmailCountType = {
  inbox: number
  starred: number
  draft: number
  sent: number
  deleted: number
  important: number
}

export type TimelineType = {
  [key: string]: {
    title: string
    description: string
    important?: boolean
  }[]
}

export type PricingType = {
  id: IdType
  name: string
  price: number
  features: string[]
  isPopular?: boolean
  subscribed?: boolean
}

export type ProjectType = {
  id: IdType
  projectName: string
  client: string
  teamMembers: StaticImageData[]
  deadlineDate: Date
  progressValue: number
  variant: string
}

export type TodoType = {
  id: IdType
  task: string
  createdAt: Date
  dueDate: Date
  status: 'Pending' | 'In-Progress' | 'Completed'
  priority: 'High' | 'Medium' | 'Low'
  employeeId: SellerType['id']
  employee?: SellerType
}

export type SellerType = {
  id: IdType
  name: string
  image: StaticImageData
  storeName: string
  review: ReviewType
  productsCount: number
  walletBalance: number
  createdAt: Date
  revenue: number
}
