import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/apiError";

interface CrudApi<T, P> {
  list: () => Promise<T[]>;
  create: (payload: P) => Promise<T>;
  update: (id: number, payload: P) => Promise<T>;
  remove: (id: number) => Promise<void>;
}

/**
 * Generic list + create/update/delete for an admin entity.
 * Handles query invalidation and success/error toasts.
 */
export function useCrud<T, P>(
  key: string,
  api: CrudApi<T, P>,
  label: string,
) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", key];

  const query = useQuery({
    queryKey,
    queryFn: api.list,
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey });

  const createMutation = useMutation({
    mutationFn: (payload: P) => api.create(payload),
    onSuccess: () => {
      invalidate();
      toast.success(`${label} created.`);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, `Couldn't create ${label}.`),
      ),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: P }) =>
      api.update(id, payload),
    onSuccess: () => {
      invalidate();
      toast.success(`${label} updated.`);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, `Couldn't update ${label}.`),
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.remove(id),
    onSuccess: () => {
      invalidate();
      toast.success(`${label} deleted.`);
    },
    onError: (e) =>
      toast.error(
        getApiErrorMessage(e, `Couldn't delete ${label}.`),
      ),
  });

  return {
    query,
    createMutation,
    updateMutation,
    deleteMutation,
  };
}
