import { Check, X } from "lucide-react";

import { useRolesReference } from "../hooks/useUserManagement";
import RoleBadge from "../components/RoleBadge";

function POSRolesPage() {
  const { data, isLoading } = useRolesReference();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Roles</h1>
        <p className="text-[13px] text-[#726C8C]">
          Roles are fixed for this system. To change what a role can do, ask your
          developer — this page is reference only.
        </p>
      </div>

      {isLoading ? (
        <p className="text-[13px] text-[#A8A2C9]">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {data?.map((roleRef) => (
            <div
              key={roleRef.role}
              className="rounded-2xl border border-[#E7E4F3] bg-white p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <RoleBadge role={roleRef.role} label={roleRef.role_display} />
              </div>
              <div className="flex flex-col gap-2">
                {roleRef.permissions.map((perm) => (
                  <div key={perm.key} className="flex items-center justify-between">
                    <span className="text-[13px] text-[#3A3560]">{perm.label}</span>
                    {perm.granted ? (
                      <Check size={16} className="text-[#2E9E5B]" />
                    ) : (
                      <X size={16} className="text-[#D3CFE8]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default POSRolesPage;
