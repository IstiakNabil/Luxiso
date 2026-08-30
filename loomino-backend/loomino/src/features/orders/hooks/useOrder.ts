import { useQuery } from "@tanstack/react-query";

import { getOrder } from "../services/order.service";

export function useOrder(orderNumber: string | undefined) {
  return useQuery({
    queryKey: ["order", orderNumber],
    queryFn: () => getOrder(orderNumber as string),
    enabled: !!orderNumber,
  });
}
