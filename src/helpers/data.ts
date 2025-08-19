import {
  agentData,
  customerData,
  customerEnquiriesData,
  customerReviewsData,
  dataTableRecords,
  pricingData,
  projectsData,
  propertyData,
  therapistData,
  timelineData,
  transactionData,
  userData,
} from '@/assets/data/other';
import { sellersData } from '@/assets/data/product';
import { emailsData, socialGroupsData } from '@/assets/data/social';
import { staffData } from '@/assets/data/staffData';
import { todoData } from '@/assets/data/task';
import { notificationsData } from '@/assets/data/topbar';
import {
  AgentType,
  CustomerReviewsType,
  CustomerType,
  PatientType,
  EmailCountType,
  Employee,
  GroupType,
  NotificationType,
  PricingType,
  ProjectType,
  PropertyType,
  TimelineType,
  TodoType,
  TransactionType,
  UserType,
  TherapistType,
  StaffType,
} from '@/types/data';
import { db } from '@/utils/firebase';
import { sleep } from '@/utils/promise';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import * as yup from 'yup';

export const getNotifications = async (): Promise<NotificationType[]> => {
  return notificationsData;
};

export const getAllUsers = async (): Promise<UserType[]> => {
  return userData;
};

export const getAllProperty = async (): Promise<PropertyType[]> => {
  return propertyData;
};

export const getAllTransaction = async (): Promise<TransactionType[]> => {
  const data = transactionData.map((item) => {
    const user = userData.find((user) => user.id === item.userId);
    const property = propertyData.find((property) => property.id == item.propertyId);
    return {
      ...item,
      user,
      property,
    };
  });
  await sleep();
  return data;
};

export const getAllTimeline = async (): Promise<TimelineType> => {
  await sleep();
  return timelineData;
};

export const getAllAgent = async (): Promise<AgentType[]> => {
  const data = agentData.map((item) => {
    const user = userData.find((user) => user.id == item.userId);
    return {
      ...item,
      user,
    };
  });
  await sleep();
  return data;
};

export const getAllPricingPlans = async (): Promise<PricingType[]> => {
  await sleep();
  return pricingData;
};

export const getAllCustomer = async (): Promise<CustomerType[]> => {
  const data = customerData.map((item) => {
    const user = userData.find((user) => user.id == item.userId);
    return {
      ...item,
      user,
    };
  });
  await sleep();
  return data;
};

// Patients Api Call
export const getAllPatients = async (
  page: number = 1,
  limit: number = 10,
  branch?: string,
  from?: string,
  to?: string,
  search?: string,
): Promise<{ data: PatientType[]; totalCount: number }> => {
  await sleep();

  let filteredData = customerEnquiriesData;

  // Branch Filter
  if (branch) {
    filteredData = filteredData.filter((item) => item.branch === branch);
  }

  // Date Range Filter
  if (from && to) {
    const fromDate = new Date(from);
    const toDate = new Date(to);
    filteredData = filteredData.filter((item) => {
      const itemDate = new Date(item.lastUpdated);
      return itemDate >= fromDate && itemDate <= toDate;
    });
  }

  // Search Filter
  if (search) {
    const lowerSearch = search.toLowerCase();
    filteredData = filteredData.filter(
      (item) =>
        item.name.toLowerCase().includes(lowerSearch) ||
        item.email.toLowerCase().includes(lowerSearch) ||
        item.number.toLowerCase().includes(lowerSearch),
    );
  }

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedData = filteredData.slice(start, end);

  return {
    data: paginatedData,
    totalCount: filteredData.length,
  };
};

// export const getAllTherapists = async (
//   page: number = 1,
//   limit: number = 10,
//   branch?: string,
//   from?: string,
//   to?: string,
//   search?: string,
// ): Promise<{ data: TherapistType[]; totalCount: number }> => {
//   await sleep();

//   let filteredData = therapistData;

//   // Branch filter → if backend has team/branch mapping, we can use center_address or team fields
//   if (branch) {
//     filteredData = filteredData.filter(
//       (item) =>
//         item.center_address?.toLowerCase().includes(branch.toLowerCase()) ||
//         item.team_namur_1?.toLowerCase().includes(branch.toLowerCase()) ||
//         item.team_namur_2?.toLowerCase().includes(branch.toLowerCase()),
//     );
//   }

//   // Date Range Filter → use appointment_start or appointment_end as proxy
//   if (from && to) {
//     const fromDate = new Date(from);
//     const toDate = new Date(to);
//     filteredData = filteredData.filter((item) => {
//       if (!item.appointment_start) return false;
//       const itemDate = new Date(item.appointment_start);
//       return itemDate >= fromDate && itemDate <= toDate;
//     });
//   }

//   // Search Filter → match by name, email, phone, specialization
//   if (search) {
//     const lowerSearch = search.toLowerCase();
//     filteredData = filteredData.filter(
//       (item) =>
//         item.full_name?.toLowerCase().includes(lowerSearch) ||
//         item.first_name?.toLowerCase().includes(lowerSearch) ||
//         item.last_name?.toLowerCase().includes(lowerSearch) ||
//         item.center_email?.toLowerCase().includes(lowerSearch) ||
//         item.contact_email?.toLowerCase().includes(lowerSearch) ||
//         item.center_phone_number?.toLowerCase().includes(lowerSearch) ||
//         item.contact_phone?.toLowerCase().includes(lowerSearch) ||
//         item.specialization_1?.toLowerCase().includes(lowerSearch) ||
//         item.specialization_2?.toLowerCase().includes(lowerSearch),
//     );
//   }

//   // Pagination
//   const start = (page - 1) * limit;
//   const end = start + limit;
//   const paginatedData = filteredData.slice(start, end);

//   return {
//     data: paginatedData,
//     totalCount: filteredData.length,
//   };
// };

// export const getStaffById = async (id?: string): Promise<{ data: StaffType[] }> => {
//   await sleep();

//   if (!id) {
//     return { data: [] };
//   }

//   const result = staffData.filter((p) => p._id === id);

//   return { data: result };
// };

// export const getCustomerEnquiriesById = async (id?: string): Promise<{ data: PatientType[] }> => {
//   await sleep();

//   if (!id) {
//     return { data: [] };
//   }

//   const result = customerEnquiriesData.filter((p) => p._id === id);

//   return { data: result };
// };

// export const getTherapistById = async (id?: string): Promise<{ data: TherapistType[] }> => {
//   await sleep();

//   if (!id) {
//     return { data: [] };
//   }

//   const result = therapistData.filter((p) => p.id_pro.toString() === id);

//   return { data: result };
// };

export const getAllReview = async (): Promise<CustomerReviewsType[]> => {
  const data = customerReviewsData.map((item) => {
    const user = userData.find((user) => user.id === item.userId);
    const property = propertyData.find((property) => property.id == item.propertyId);
    return {
      ...item,
      user,
      property,
    };
  });
  await sleep();
  return data;
};

export const getUserById = async (id: UserType['id']): Promise<UserType | void> => {
  const user = userData.find((user) => user.id === id);
  if (user) {
    await sleep();
    return user;
  }
};

export const getJoinedGroups = async (): Promise<GroupType[]> => {
  return socialGroupsData;
};

export const getEmailsCategoryCount = async (): Promise<EmailCountType> => {
  const mailsCount: EmailCountType = {
    inbox: 0,
    starred: 0,
    draft: 0,
    sent: 0,
    deleted: 0,
    important: 0,
  };
  mailsCount.inbox = emailsData.filter((email) => email.toId === '101').length;
  mailsCount.starred = emailsData.filter((email) => email.starred).length;
  mailsCount.draft = emailsData.filter((email) => email.draft).length;
  mailsCount.sent = emailsData.filter((email) => email.fromId === '101').length;
  mailsCount.important = emailsData.filter((email) => email.important).length;
  await sleep();
  return mailsCount;
};

export const getAllProjects = async (): Promise<ProjectType[]> => {
  await sleep();
  return projectsData;
};

export const getAllTasks = async (): Promise<TodoType[]> => {
  const data = todoData.map((task) => {
    const employee = sellersData.find((seller) => seller.id === task.employeeId);
    return {
      ...task,
      employee,
    };
  });
  await sleep();
  return data;
};

export const getAllFriends = async (): Promise<UserType[]> => {
  const data = userData.filter((user) => !user?.hasRequested);
  await sleep();
  return data;
};

export const serverSideFormValidate = async (data: unknown): Promise<unknown> => {
  const formSchema = yup.object({
    fName: yup
      .string()
      .min(3, 'First name should have at least 3 characters')
      .max(50, 'First name should not be more than 50 characters')
      .required('First name is required'),
    lName: yup
      .string()
      .min(3, 'Last name should have at least 3 characters')
      .max(50, 'Last name should not be more than 50 characters')
      .required('Last name is required'),
    username: yup
      .string()
      .min(3, 'Username should have at least 3 characters')
      .max(20, 'Username should not be more than 20 characters')
      .required('Username is required'),
    city: yup
      .string()
      .min(3, 'City should have at least 3 characters')
      .max(20, 'City should not be more than 20 characters')
      .required('City is required'),
    state: yup
      .string()
      .min(3, 'State should have at least 3 characters')
      .max(20, 'State should not be more than 20 characters')
      .required('State is required'),
    zip: yup.number().required('ZIP is required'),
  });

  try {
    const validatedObj = await formSchema.validate(data, { abortEarly: false });
    return validatedObj;
  } catch (error) {
    return error;
  }
};

export const getAllDataTableRecords = async (): Promise<Employee[]> => {
  await sleep();
  return dataTableRecords;
};
