import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getContacts,
  getContactDetail,
  createContact,
  updateContact,
  deleteContact,
  getCustomerGroups,
  createCustomerGroup,
  updateCustomerGroup,
  deleteCustomerGroup,
  importContacts,
} from "../services/pos.service";
import type { ContactWritePayload } from "../types/pos";

export function useContacts(
  type: "customer" | "supplier",
  page: number,
  search: string,
  customerGroup?: number,
) {
  return useQuery({
    queryKey: ["pos", "contacts", type, page, search, customerGroup],
    queryFn: () => getContacts(page, type, search || undefined, customerGroup),
  });
}

export function useContactDetail(id: number | null) {
  return useQuery({
    queryKey: ["pos", "contacts", "detail", id],
    queryFn: () => getContactDetail(id as number),
    enabled: id !== null,
  });
}

export function useCreateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ContactWritePayload) => createContact(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "contacts"] });
    },
  });
}

export function useUpdateContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<ContactWritePayload>;
    }) => updateContact(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "contacts"] });
    },
  });
}

export function useDeleteContact() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "contacts"] });
    },
  });
}

export function useCustomerGroups() {
  return useQuery({
    queryKey: ["pos", "customer-groups"],
    queryFn: getCustomerGroups,
  });
}

export function useCreateCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; description?: string }) =>
      createCustomerGroup(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "customer-groups"] });
    },
  });
}

export function useUpdateCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<{ name: string; description: string; is_active: boolean }>;
    }) => updateCustomerGroup(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "customer-groups"] });
    },
  });
}

export function useDeleteCustomerGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCustomerGroup(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "customer-groups"] });
      queryClient.invalidateQueries({ queryKey: ["pos", "contacts"] });
    },
  });
}

export function useImportContacts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => importContacts(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pos", "contacts"] });
    },
  });
}
