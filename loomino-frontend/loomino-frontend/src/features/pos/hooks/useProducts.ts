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
  getStorefrontCategories,
  createStorefrontCategory,
  getStorefrontTypes,
  createStorefrontType,
  getColors,
  createColor,
  updateColor,
  deleteColor,
  getSizes,
  createSize,
  updateSize,
  deleteSize,
  getProducts,
  getProductDetail,
  createProduct,
  updateProduct,
  deleteProduct,
  getVariations,
  createVariation,
  updateVariation,
  deleteVariation,
  getUnits,
} from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import type { ProductFilters, Category, Brand, VariationWritePayload } from "../types/pos";

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

/** Storefront lookups -- shared with the website, used to publish a
 * POS product online with a real category/type/color/size. */
export function useStorefrontCategories() {
  return useQuery({
    queryKey: ["pos", "storefront-categories"],
    queryFn: getStorefrontCategories,
  });
}
export function useCreateStorefrontCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => createStorefrontCategory(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "storefront-categories"] }),
  });
}

export function useStorefrontTypes(categoryId?: number) {
  return useQuery({
    queryKey: ["pos", "storefront-types", categoryId ?? null],
    queryFn: () => getStorefrontTypes(categoryId),
  });
}
export function useCreateStorefrontType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; categories?: number[] }) => createStorefrontType(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "storefront-types"] }),
  });
}

export function useColors() {
  return useQuery({ queryKey: ["pos", "colors"], queryFn: getColors });
}
export function useCreateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; hex_code: string }) => createColor(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "colors"] }),
  });
}
export function useUpdateColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<{ name: string; hex_code: string; is_active: boolean }>;
    }) => updateColor(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "colors"] }),
  });
}
export function useDeleteColor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteColor(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "colors"] }),
  });
}

export function useSizes() {
  return useQuery({ queryKey: ["pos", "sizes"], queryFn: getSizes });
}
export function useCreateSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string; display_order?: number }) => createSize(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "sizes"] }),
  });
}
export function useUpdateSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: Partial<{ name: string; display_order: number; is_active: boolean }>;
    }) => updateSize(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "sizes"] }),
  });
}
export function useDeleteSize() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteSize(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "sizes"] }),
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

// --- Variations -------------------------------------------------------

export function useVariations(productId: number | null) {
  return useQuery({
    queryKey: ["pos", "variations", productId],
    queryFn: () => getVariations(productId as number),
    enabled: productId !== null,
  });
}

export function useCreateVariation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: VariationWritePayload) => createVariation(payload),
    onSuccess: (_, payload) =>
      qc.invalidateQueries({ queryKey: ["pos", "variations", payload.product] }),
  });
}

export function useUpdateVariation(productId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<VariationWritePayload> }) =>
      updateVariation(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "variations", productId] }),
  });
}

export function useDeleteVariation(productId: number | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVariation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pos", "variations", productId] }),
  });
}
