import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";
import { formatDate } from "@/lib/utils";
import ProfileField from "./ProfileField";
import { useProfile } from "../hooks/useProfile";
import { useUpdateProfile } from "../hooks/useUpdateProfile";
import {
  profileSchema,
  type ProfileFormValues,
} from "../schemas/profile.schemas";

function ProfileTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  // Populate the form once the profile loads.
  useEffect(() => {
    if (profile) {
      reset({
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone_number: profile.phone_number ?? "",
      });
    }
  }, [profile, reset]);

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      await updateProfile.mutateAsync({
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number || null,
      });
      toast.success("Profile updated.");
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          "Could not update your profile.",
        ),
      );
    }
  };

  if (isLoading || !profile) {
    return (
      <p className="text-[16px] text-[#606060]">
        Loading profile...
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="max-w-[560px]"
      noValidate
    >
      <div className="space-y-5">
        <ProfileField
          label="Email"
          value={profile.email}
          disabled
          readOnly
        />

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <ProfileField
            label="First Name"
            error={errors.first_name?.message}
            {...register("first_name")}
          />
          <ProfileField
            label="Last Name"
            error={errors.last_name?.message}
            {...register("last_name")}
          />
        </div>

        <ProfileField
          label="Phone Number"
          type="tel"
          placeholder="Add a phone number"
          error={errors.phone_number?.message}
          {...register("phone_number")}
        />

        <p className="text-[14px] text-[#606060]">
          Member since {formatDate(profile.date_joined)}
          {profile.is_email_verified
            ? " · Email verified"
            : " · Email not verified"}
        </p>
      </div>

      <button
        type="submit"
        disabled={updateProfile.isPending || !isDirty}
        className="mt-8 h-[48px] w-[200px] bg-[#343E32] text-[14px] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {updateProfile.isPending
          ? "Saving..."
          : "Save Changes"}
      </button>
    </form>
  );
}

export default ProfileTab;
