import { useQuery } from "@tanstack/react-query";

import { getOnSaleProducts } from "@/services/product.service";

export function useOnSale() {
  return useQuery({
    queryKey: ["on-sale"],
    queryFn: getOnSaleProducts,
  });
}
