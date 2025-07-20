"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { BranchType } from "@/types/data";
import { getBranchById } from "@/helpers/branch";
import BranchForm, { BranchFormValues } from "../../branchForm";

interface Props {
  params: { id?: string };
}

const EditBranchPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<BranchFormValues>>({});
  const isEditMode = Boolean(params.id);

  useEffect(() => {
    if (!params.id) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        const { data } = await getBranchById(params.id);
        const branch = Array.isArray(data) ? data[0] : data;
        if (branch?._id) {
          setDefaultValues({
            name: branch.name,
            code: branch.code || "",
            email: branch.email || "",
            phoneNumber: branch.phoneNumber || "",
            address: {
              line1: branch.address?.line1 || "",
              line2: branch.address?.line2 || "",
              city: branch.address?.city || "",
              zipCode: branch.address?.zipCode || "",
              country: branch.address?.country || "",
            },
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const onSubmitHandler = async (data: BranchFormValues) => {
    try {
      console.log("Branch updated", data);
      // await updateBranch(params.id as string, data);
      router.push("/branches");
    } catch {
      console.error("Error updating branch");
    }
  };

  if (loading) return <div>Loading branch details...</div>;

  return (
    <BranchForm
      defaultValues={defaultValues}
      isEditMode
      onSubmitHandler={onSubmitHandler}
    />
  );
};

export default EditBranchPage;
