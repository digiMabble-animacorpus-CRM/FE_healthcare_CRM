"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { StaffType } from "@/types/data";
import StaffForm from "../../staffForm";
import { getDefaultStaffById } from "@/helpers/staff";

interface Props {
  params: { id?: string };
}

const EditStaffPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<StaffType>>({});
  const isEditMode = Boolean(params.id);

  useEffect(() => {
    if (isEditMode && params.id) {
      const fetchData = async () => {
        try {
          const { data } = await getDefaultStaffById(params.id);
          const staff = Array.isArray(data) ? data[0] : data;

          if (!staff || !staff._id) {
            console.error("Invalid staff response");
            return;
          }

          setDefaultValues(staff);
        } catch (error) {
          console.error("Failed to fetch staff data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [isEditMode, params.id]);

  const onSubmitHandler = async (data: StaffType) => {
    try {
      if (params.id) {
        // await updateStaff(params.id, data);
        console.log("Staff updated successfully");
        // router.push("/staffs"); // redirect after success
      }
    } catch (error) {
      console.error("Error updating staff:", error);
    }
  };
  console.log(defaultValues, "defaultValues");

  return (
    <div className="container mt-4">
      {loading ? (
        <div>Loading staff details...</div>
      ) : (
        <StaffForm
          defaultValues={defaultValues}
          isEditMode
          onSubmitHandler={onSubmitHandler}
        />
      )}
    </div>
  );
};

export default EditStaffPage;
