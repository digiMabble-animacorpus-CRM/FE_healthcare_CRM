'use client';

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import StaffForm from "../../staffForm";
import { decryptAES } from "@/utils/encryption";
import type { StaffType } from "@/types/data";
import { updateStaff  } from "@/helpers/staff";


interface Props {
  params: { id?: string };
}
const transformToBackendDto = (formData: StaffType) => {
  let accessLevel: "staff" | "branch-admin" | "super-admin" | undefined;

  switch (formData.accessLevelId) {
    case "al-001":
      accessLevel = "staff";
      break;
    case "al-002":
      accessLevel = "branch-admin";
      break;
    case "al-003":
      accessLevel = "super-admin";
      break;
  }

  return {
    ...formData,
    role_id: Number(formData.roleId),
    access_level: accessLevel,
    branches: formData.branches
      .map((b) => Number(b.id))
      .filter((id) => !isNaN(id)),
    selected_branch: Number(formData.selectedBranch),
    permissions: formData.permissions
      .filter((p) => p.enabled)
      .map((p) => {
        const [action, resource] = p._id.split("-");
        return {
          action,
          resource,
          enabled: true,
        };
      }),
    updatedBy: [
      {
        staffId: String(localStorage.getItem("staff_id") || ""),
        updatedAt: new Date().toISOString(),
      },
    ],
  };
};



const EditStaffPage = ({ params }: Props) => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [defaultValues, setDefaultValues] = useState<Partial<StaffType>>({});

  //  Decrypt ID from URL param
  const decryptedId = useMemo(() => {
      if (!params?.id) return null;
    try {
      if (!params?.id) return null;
      const decoded = decodeURIComponent(params.id);
      const result = decryptAES(decoded);
      console.log(" Decrypted ID:", result);
      return result;
    } catch (e) {
      console.error(" Error decrypting ID:", e);
      return null;
    }
  }, [params.id]);

  // Load staff data from sessionStorage
  useEffect(() => {
    if (!decryptedId) return;

    const storedStaff = sessionStorage.getItem("selectedStaff");
    if (storedStaff) {
      try {
        const parsed = JSON.parse(storedStaff) as StaffType;

        if (String(parsed.id) === String(decryptedId)) {
          setDefaultValues(parsed);
        } else {
          console.warn(" Staff ID mismatch in sessionStorage.");
        }
      } catch (err) {
        console.error(" Error parsing staff from sessionStorage:", err);
      }
    } else {
      console.warn(" No staff data found in sessionStorage.");
    }

    setLoading(false);
  }, [decryptedId]);

  
  //  Submit updated form
  const onSubmitHandler = async (formData: StaffType) => {
    try {
      if (!decryptedId) throw new Error("Missing decrypted staff ID");

      const dto = transformToBackendDto(formData);
      console.log(" Final DTO to send:", dto);

      const success = await updateStaff(decryptedId, dto);

      if (success) {
        console.log(" Staff updated!");
        router.push("/staffs/staffs-list");
      } else {
        console.error(" Update failed.");
        alert("Failed to update staff. Please try again.");
      }
    } catch (err) {
      console.error(" Error during update:", err);
      alert("Something went wrong during update.");
    }
  };

  return (
    <div className="container mt-4">
      {loading ? (
        <div>Loading staff details...</div>
      ) : (
        <StaffForm
          key={JSON.stringify(defaultValues)} // Ensures re-render on change
          defaultValues={defaultValues}
          isEditMode={true}
          onSubmitHandler={onSubmitHandler}
        />
      )}
    </div>
  );
};

export default EditStaffPage;
