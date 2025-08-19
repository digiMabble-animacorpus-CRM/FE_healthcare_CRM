// 'use client';

// import { FormProvider, useForm } from 'react-hook-form';
// import { yupResolver } from '@hookform/resolvers/yup';
// import * as yup from 'yup';
// import { Button, Card, CardBody, CardHeader, CardTitle } from 'react-bootstrap';
// import { useRouter } from 'next/navigation';
// import { useEffect, useState } from 'react';

// import type { StaffType, StaffRoleType } from '@/types/data';
// import PersonalInfo from './components/personalInfo';
// import ProfessionalInfo from './components/professionalInfo';
// import BranchSection from './components/branchSection';
// import ContactInfo from './components/contactInfo';
// import AvailabilitySection from './components/availabilitySection';
// import PermissionsSection from './components/permissionSection';
// import { getAllRoles } from '@/helpers/staff';

// // ------------------------
// // Validation Schema
// // ------------------------
// const schema: yup.ObjectSchema<any> = yup.object().shape({
//   name: yup.string().required('Name is required'),
//   email: yup.string().email().required('Email is required'),
//   phoneNumber: yup.string().required('Phone number is required'),
//   gender: yup.string().required('Gender is required'),
//   dob: yup.string().required('Date of birth is required'),
//   description: yup.string(),
//   roleId: yup.string().required('Role is required'),
//   accessLevelId: yup.string().required('Access Level is required'),
//   branches: yup
//     .array()
//     .of(
//       yup.object().shape({
//         id: yup.string().required('Branch ID is required'),
//         isPrimary: yup.boolean().optional(),
//       }),
//     )
//     .min(1, 'Select at least one branch')
//     .required(),
//   selectedBranch: yup.string().required('Select primary branch'),
//   address: yup.object().shape({
//     street: yup.string().required('Address Line 1 is required'),
//     city: yup.string().required('City is required'),
//     zip_code: yup.string().required('Zip Code is required'),
//     country: yup.string().required('Country is required'),
//   }),
//   languages: yup.array().min(1, 'At least one language is required').required(),
//   availability: yup.array().of(
//     yup.object().shape({
//       day: yup.string().required('Day is required'),
//       from: yup.string().required('Start time is required'),
//       to: yup.string().required('End time is required'),
//     }),
//   ),
//   permissions: yup.array().of(
//     yup.object().shape({
//       _id: yup.string().required('Permission ID is required'),
//       enabled: yup.boolean().required(),
//     }),
//   ),
// });

// interface Props {
//   defaultValues?: Partial<StaffType>;
//   isEditMode?: boolean;
//   onSubmitHandler: (data: StaffType) => Promise<void>;
// }

// const StaffForm = ({ defaultValues, isEditMode, onSubmitHandler }: Props) => {
//   const methods = useForm<StaffType>({
//     resolver: yupResolver(schema),
//     mode: 'onTouched',
//     defaultValues: defaultValues || {},
//   });

//   const { watch, getValues, reset, handleSubmit } = methods;
//   const router = useRouter();

//   useEffect(() => {
//     if (defaultValues && Object.keys(defaultValues).length > 0) {
//       reset({ ...defaultValues });
//       console.log(' Form reset with defaultValues', defaultValues);
//     }
//   }, [defaultValues, reset]);

//   //  Load role and determine if availability is required
//   const roleId = watch('roleId') || '';
//   const [selectedRole, setSelectedRole] = useState<StaffRoleType | null>(null);

//   useEffect(() => {
//     const fetchRole = async () => {
//       const roles = await getAllRoles();
//       const matchedRole = roles.find((r) => r._id === roleId);
//       setSelectedRole(matchedRole || null);
//     };

//     if (roleId) {
//       fetchRole();
//     }
//   }, [roleId]);

//   //  Debug submit errors
//   const onSubmitError = (formErrors: any) => {
//     console.error(' Form validation errors:', formErrors);
//     console.debug('🧾 Form values at time of error:', getValues());
//   };

//   return (
//     <FormProvider {...methods}>
//       <form onSubmit={handleSubmit(onSubmitHandler, onSubmitError)}>
//         <Card>
//           <CardHeader>
//             <CardTitle as="h5">{isEditMode ? 'Edit Staff Details' : 'Create New Staff'}</CardTitle>
//           </CardHeader>
//           <CardBody>
//             <PersonalInfo />
//             <ProfessionalInfo />
//             <BranchSection />
//             <ContactInfo />
//             {selectedRole?.requiresAvailability && <AvailabilitySection />}
//             <PermissionsSection />

//             <div className="mt-4 d-flex gap-3 justify-content-end">
//               <Button type="submit" variant="primary">
//                 {isEditMode ? 'Update' : 'Create'} Staff
//               </Button>
//               <Button variant="secondary" onClick={() => router.back()}>
//                 Cancel
//               </Button>
//             </div>
//           </CardBody>
//         </Card>
//       </form>
//     </FormProvider>
//   );
// };

// export default StaffForm;
