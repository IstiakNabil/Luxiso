import { useQuery } from "@tanstack/react-query";
import { getProductBySlug } from "@/services/product.service";

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ["product", slug],
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  });
}