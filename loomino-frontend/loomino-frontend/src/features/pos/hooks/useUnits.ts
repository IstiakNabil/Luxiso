import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getUnits, createUnit, updateUnit, deleteUnit } from "../services/pos.service";
import type { UnitWritePayload } from "../types/pos";

export function useUnits(page: number, search: string) {
  return useQuery({
    queryKey: ["pos", "units", page, search],
    queryFn: () => getUnits(page, search || undefined),
  });
}

export function useCreateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UnitWritePayload) => createUnit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "units"] });
    },
  });
}

export function useUpdateUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<UnitWritePayload> }) =>
      updateUnit(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "units"] });
    },
  });
}

export function useDeleteUnit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteUnit(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "units"] });
    },
  });
}
