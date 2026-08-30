import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getBrands,
  createBrand,
  updateBrand,
  deleteBrand,
  getTaxRates,
  createTaxRate,
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  getUnits,
} from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import type { ProductFilters, Category, Brand } from "../types/pos";

/** Units filter dropdown needs the full list, not one paginated page. */
export function useAllUnits() {
  return useQuery({
    queryKey: ["pos", "units", "all"],
    queryFn: () => fetchAllPages((p) => getUnits(p)),
  });
}

export function useCategories() {
  return useQuery({ queryKey: ["pos", "categories"], queryFn: getCategories });
}
export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; category_code?: string; description?: string; parent?: number | null }) =>
      createCategory(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "categories"] }),
  });
}
export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Category> }) =>
      updateCategory(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "categories"] }),
  });
}
export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "categories"] }),
  });
}

export function useBrands() {
  return useQuery({ queryKey: ["pos", "brands"], queryFn: getBrands });
}
export function useCreateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; note?: string }) => createBrand(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "brands"] }),
  });
}
export function useUpdateBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<Brand> }) =>
      updateBrand(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "brands"] }),
  });
}
export function useDeleteBrand() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteBrand(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "brands"] }),
  });
}

export function useTaxRates() {
  return useQuery({ queryKey: ["pos", "tax-rates"], queryFn: getTaxRates });
}
export function useCreateTaxRate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; rate: string }) => createTaxRate(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "tax-rates"] }),
  });
}

export function useProducts(page: number, filters: ProductFilters) {
  return useQuery({
    queryKey: ["pos", "products", page, filters],
    queryFn: () => getProducts(page, filters),
  });
}

export function useProductDetail(id: number | null) {
  return useQuery({
    queryKey: ["pos", "products", "detail", id],
    queryFn: () => getProductDetail(id as number),
    enabled: id !== null,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => createProduct(formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "products"] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: number; formData: FormData }) =>
      updateProduct(id, formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "products"] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "products"] }),
  });
}
