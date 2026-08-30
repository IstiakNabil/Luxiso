import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  searchAccounts,
  getStaffList,
  getStaffDetail,
  createStaff,
  updateStaff,
  deleteStaff,
  getRolesReference,
} from "../services/pos.service";
import type { CreateStaffPayload, UpdateStaffPayload } from "../types/pos";

export function useAccountSearch(q: string, page = 1) {
  return useQuery({
    queryKey: ["pos", "accounts", "search", q, page],
    queryFn: () => searchAccounts(q, page),
    enabled: q.trim().length >= 2,
  });
}

export function useStaffList(page: number, search: string) {
  return useQuery({
    queryKey: ["pos", "users", page, search],
    queryFn: () => getStaffList(page, search || undefined),
  });
}

export function useStaffDetail(id: number | null) {
  return useQuery({
    queryKey: ["pos", "users", "detail", id],
    queryFn: () => getStaffDetail(id as number),
    enabled: id !== null,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) => createStaff(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "users"] });
      queryClient.invalidateQueries({ queryKey: ["pos", "accounts", "search"] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: UpdateStaffPayload }) =>
      updateStaff(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "users"] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "users"] });
      queryClient.invalidateQueries({ queryKey: ["pos", "accounts", "search"] });
    },
  });
}

export function useRolesReference() {
  return useQuery({
    queryKey: ["pos", "roles-reference"],
    queryFn: getRolesReference,
    staleTime: 10 * 60 * 1000,
  });
}
