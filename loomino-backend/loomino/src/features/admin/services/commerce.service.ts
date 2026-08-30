import api from "@/lib/api";

import type {
  AdminProduct,
  AdminProductDetail,
  ProductPayload,
  AdminBrand,
  VariantPayload,
  AdminVariant,
  AdminReview,
  AdminOrder,
  AdminCoupon,
  AdminMail,
  AdminSubscriber,
} from "../types/commerce";

function unwrap<T>(data: unknown): T[] {
  if (Array.isArray(data)) return data as T[];
  const paged = data as { results?: T[] };
  return paged.results ?? [];
}

/* Products */
export async function listProducts(): Promise<AdminProduct[]> {
  const res = await api.get("/products/admin/");
  return unwrap<AdminProduct>(res.data);
}
export async function deleteProduct(id: number): Promise<void> {
  await api.delete(`/products/admin/${id}/`);
}
export async function getProduct(
  id: number,
): Promise<AdminProductDetail> {
  const res = await api.get(`/products/admin/${id}/`);
  return res.data;
}

export async function createProduct(
  payload: ProductPayload,
): Promise<AdminProductDetail> {
  const res = await api.post("/products/admin/", payload);
  return res.data;
}

export async function updateProduct(
  id: number,
  payload: Partial<ProductPayload>,
): Promise<AdminProductDetail> {
  const res = await api.patch(
    `/products/admin/${id}/`,
    payload,
  );
  return res.data;
}

export async function listBrands(): Promise<AdminBrand[]> {
  const res = await api.get("/products/brands/");
  return unwrap<AdminBrand>(res.data);
}

export async function toggleProductActive(
  id: number,
  is_active: boolean,
): Promise<AdminProduct> {
  const res = await api.patch(`/products/admin/${id}/`, {
    is_active,
  });
  return res.data;
}

/* Variants */
export async function listVariantsForProduct(
  productId: number,
): Promise<AdminVariant[]> {
  const res = await api.get("/products/variants/admin/", {
    params: { product: productId },
  });
  return unwrap<AdminVariant>(res.data);
}

export async function listVariants(): Promise<AdminVariant[]> {
  const res = await api.get("/products/variants/admin/");
  return unwrap<AdminVariant>(res.data);
}
export async function createVariant(
  payload: VariantPayload,
): Promise<AdminVariant> {
  const res = await api.post(
    "/products/variants/admin/",
    payload,
  );
  return res.data;
}

export async function updateVariant(
  id: number,
  payload: Partial<VariantPayload>,
): Promise<AdminVariant> {
  const res = await api.patch(
    `/products/variants/admin/${id}/`,
    payload,
  );
  return res.data;
}

export async function deleteVariant(id: number): Promise<void> {
  await api.delete(`/products/variants/admin/${id}/`);
}

/* Reviews */
export async function listReviews(): Promise<AdminReview[]> {
  const res = await api.get("/reviews/admin/");
  return unwrap<AdminReview>(res.data);
}
export async function updateReviewStatus(
  id: number,
  status: string,
): Promise<AdminReview> {
  const res = await api.patch(`/reviews/admin/${id}/`, {
    status,
  });
  return res.data;
}
export async function deleteReview(id: number): Promise<void> {
  await api.delete(`/reviews/admin/${id}/`);
}

/* Orders */
export async function listOrders(): Promise<AdminOrder[]> {
  const res = await api.get("/orders/admin/");
  return unwrap<AdminOrder>(res.data);
}
export async function updateOrder(
  orderNumber: string,
  payload: Record<string, string>,
): Promise<AdminOrder> {
  const res = await api.patch(
    `/orders/admin/${orderNumber}/`,
    payload,
  );
  return res.data;
}

/* Coupons */
export async function listCoupons(): Promise<AdminCoupon[]> {
  const res = await api.get("/coupons/admin/");
  return unwrap<AdminCoupon>(res.data);
}
export async function createCoupon(
  payload: Partial<AdminCoupon>,
): Promise<AdminCoupon> {
  const res = await api.post("/coupons/admin/", payload);
  return res.data;
}
export async function updateCoupon(
  id: number,
  payload: Partial<AdminCoupon>,
): Promise<AdminCoupon> {
  const res = await api.patch(`/coupons/admin/${id}/`, payload);
  return res.data;
}
export async function deleteCoupon(id: number): Promise<void> {
  await api.delete(`/coupons/admin/${id}/`);
}
export async function toggleCouponActive(
  id: number,
): Promise<AdminCoupon> {
  const res = await api.post(
    `/coupons/admin/${id}/toggle-active/`,
    {},
  );
  return res.data;
}

/* Contact mails */
export async function listMails(): Promise<AdminMail[]> {
  const res = await api.get("/contact/messages/");
  return unwrap<AdminMail>(res.data);
}
export async function deleteMail(id: number): Promise<void> {
  await api.delete(`/contact/messages/${id}/`);
}

/* Newsletter */
export async function listSubscribers(): Promise<
  AdminSubscriber[]
> {
  const res = await api.get("/newsletter/subscribers/");
  return unwrap<AdminSubscriber>(res.data);
}
export async function deleteSubscriber(
  id: number,
): Promise<void> {
  await api.delete(`/newsletter/subscribers/${id}/`);
}
