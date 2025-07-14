"use client";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import type { StaffRoleType } from "@/types/data";
import StaffForm from "@/app/(admin)/staffs/staffs-form/staffForm";
import StaffRoleForm from "../staffRoleForm";

const CreateStaffRolePage = () => {
  const router = useRouter();

  const handleCreate = async (data: Omit<StaffRoleType, "_id">) => {
    try {
      // 🔧 Replace with your actual API call here:
      console.log("Creating StaffRole...", data);
      // await createStaffRoleAPI(data);

      toast.success("StaffRole created successfully!");
      // router.push("/StaffRoles");
    } catch (error) {
      toast.error("Failed to create StaffRole.");
    }
  };

  return <StaffRoleForm onSubmitHandler={handleCreate} />;
};

export default CreateStaffRolePage;
