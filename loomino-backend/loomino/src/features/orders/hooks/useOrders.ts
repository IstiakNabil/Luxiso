import {
  keepPreviousData,
  useQuery,
} from "@tanstack/react-query";

import { getOrders } from "../services/order.service";

export function useOrders(page: number) {
  return useQuery({
    queryKey: ["orders", page],
    queryFn: () => getOrders(page),
    placeholderData: keepPreviousData,
  });
}
