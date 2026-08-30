import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getBusinessSettings,
  updateBusinessSettings,
  getBusinessLocations,
  createBusinessLocation,
  updateBusinessLocation,
  deleteBusinessLocation,
  getDocumentPrefixes,
  updateDocumentPrefix,
} from "../services/pos.service";
import type { BusinessLocation } from "../types/pos";

export function useBusinessSettings() {
  return useQuery({ queryKey: ["pos", "settings", "business"], queryFn: getBusinessSettings });
}

export function useUpdateBusinessSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => updateBusinessSettings(formData),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["pos", "settings", "business"] });
      qc.invalidateQueries({ queryKey: ["pos", "me"] });
    },
  });
}

export function useBusinessLocations() {
  return useQuery({ queryKey: ["pos", "settings", "locations"], queryFn: getBusinessLocations });
}

function invalidateLocations(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["pos", "settings", "locations"] });
  qc.invalidateQueries({ queryKey: ["pos", "locations"] });
}

export function useCreateBusinessLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<BusinessLocation>) => createBusinessLocation(payload),
    onSuccess: () => invalidateLocations(qc),
  });
}

export function useUpdateBusinessLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<BusinessLocation> }) =>
      updateBusinessLocation(id, payload),
    onSuccess: () => invalidateLocations(qc),
  });
}

export function useDeleteBusinessLocation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBusinessLocation(id),
    onSuccess: () => invalidateLocations(qc),
  });
}

export function useDocumentPrefixes() {
  return useQuery({ queryKey: ["pos", "settings", "prefixes"], queryFn: getDocumentPrefixes });
}

export function useUpdateDocumentPrefix() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ documentType, prefix }: { documentType: string; prefix: string }) =>
      updateDocumentPrefix(documentType, prefix),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "settings", "prefixes"] }),
  });
}
