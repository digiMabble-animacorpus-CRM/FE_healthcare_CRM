"use client";

import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import BranchForm, { BranchFormValues } from "../branchForm";

const CreateBranchPage = () => {
  const router = useRouter();

  const handleCreate = async (data: BranchFormValues) => {
    try {
      console.log("Creating Branch...", data);
      // await createBranchAPI(data);
      toast.success("Branch created successfully!");
      router.push("/branches");
    } catch (error) {
      toast.error("Failed to create Branch.");
    }
  };

  return <BranchForm onSubmitHandler={handleCreate} />;
};

export default CreateBranchPage;
