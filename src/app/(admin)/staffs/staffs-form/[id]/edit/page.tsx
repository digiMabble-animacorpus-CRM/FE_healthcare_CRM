"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getStaffById } from "@/helpers/data";
import type { StaffType } from "@/types/data";
import StaffForm from "../../staffForm";

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
          const response = await getStaffById(params.id);
          const data = response.data;
          console.log(data, "edit details");

          if (Array.isArray(data) && data.length > 0) {
            const staff: StaffType = data[0];
            setDefaultValues(staff);
          } else {
            console.error("Staff not found or data format incorrect");
          }
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

  return (
    <div className="container mt-4">
      {!loading && (
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
