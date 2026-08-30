import { useMemo, useState } from "react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { usePOSLocations } from "../hooks/useDashboard";
import { useCategories, useBrands, useAllUnits } from "../hooks/useProducts";
import { useTrendingProducts } from "../hooks/useReports";
import SimpleBarChart from "../components/SimpleBarChart";
import { formatMoney } from "../utils/format";

function POSTrendingProductsPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [locationId, setLocationId] = useState<number | "">("");
  const [categoryId, setCategoryId] = useState<number | "">("");
  const [subcategoryId, setSubcategoryId] = useState<number | "">("");
  const [brandId, setBrandId] = useState<number | "">("");
  const [unitId, setUnitId] = useState<number | "">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [numberOfProducts, setNumberOfProducts] = useState("5");
  const [productType, setProductType] = useState<"" | "single" | "variable">("");
  const [appliedFilters, setAppliedFilters] = useState({});

  const locationsQuery = usePOSLocations();
  const categoriesQuery = useCategories();
  const brandsQuery = useBrands();
  const unitsQuery = useAllUnits();

  const subcategoryOptions = useMemo(
    () => (categoriesQuery.data ?? []).filter((c) => c.parent === categoryId),
    [categoriesQuery.data, categoryId],
  );

  const reportQuery = useTrendingProducts(appliedFilters);

  const handleApply = () => {
    setAppliedFilters({
      ...(locationId ? { location: locationId } : {}),
      ...(categoryId ? { category: categoryId } : {}),
      ...(subcategoryId ? { subcategory: subcategoryId } : {}),
      ...(brandId ? { brand: brandId } : {}),
      ...(unitId ? { unit: unitId } : {}),
      ...(dateFrom ? { date_from: dateFrom } : {}),
      ...(dateTo ? { date_to: dateTo } : {}),
      ...(productType ? { product_type: productType } : {}),
      number_of_products: Number(numberOfProducts) || 5,
    });
  };

  const rows = reportQuery.data ?? [];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-bold text-[#221F35]">Trending Products</h1>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-3 text-[13px] font-semibold text-[#221F35]">Filters</h3>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Business Location</span>
            <select
              value={locationId}
              onChange={(e) => setLocationId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All locations</option>
              {locationsQuery.data?.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Category</span>
            <select
              value={categoryId}
              onChange={(e) => {
                setCategoryId(e.target.value === "" ? "" : Number(e.target.value));
                setSubcategoryId("");
              }}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {(categoriesQuery.data ?? []).filter((c) => c.parent === null).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Sub category</span>
            <select
              value={subcategoryId}
              onChange={(e) => setSubcategoryId(e.target.value === "" ? "" : Number(e.target.value))}
              disabled={!categoryId || subcategoryOptions.length === 0}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8] disabled:bg-[#F5F4FA]"
            >
              <option value="">All</option>
              {subcategoryOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Brand</span>
            <select
              value={brandId}
              onChange={(e) => setBrandId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {brandsQuery.data?.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Unit</span>
            <select
              value={unitId}
              onChange={(e) => setUnitId(e.target.value === "" ? "" : Number(e.target.value))}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              {unitsQuery.data?.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Date Range</span>
            <div className="flex gap-1">
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full rounded-lg border border-[#E7E4F3] px-2 py-2 text-[12px] outline-none focus:border-[#7C6AE8]"
              />
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full rounded-lg border border-[#E7E4F3] px-2 py-2 text-[12px] outline-none focus:border-[#7C6AE8]"
              />
            </div>
          </label>
          <label className="block">
            <span className="mb-1.5 flex items-center gap-1 text-[12px] font-medium text-[#4A4470]">
              Number of products
            </span>
            <input
              type="number"
              min={1}
              max={50}
              value={numberOfProducts}
              onChange={(e) => setNumberOfProducts(e.target.value)}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-medium text-[#4A4470]">Product Type</span>
            <select
              value={productType}
              onChange={(e) => setProductType(e.target.value as "" | "single" | "variable")}
              className="w-full rounded-lg border border-[#E7E4F3] px-2.5 py-2 text-[13px] outline-none focus:border-[#7C6AE8]"
            >
              <option value="">All</option>
              <option value="single">Single</option>
              <option value="variable">Variable</option>
            </select>
          </label>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={handleApply}
            className="rounded-lg bg-[#7C6AE8] px-5 py-2 text-[13px] font-semibold text-white hover:bg-[#6C5AD8]"
          >
            Apply Filters
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
        <h3 className="mb-4 text-[15px] font-semibold text-[#221F35]">Top Trending Products</h3>
        {reportQuery.isLoading ? (
          <p className="py-10 text-center text-[13px] text-[#A8A2C9]">Loading…</p>
        ) : (
          <SimpleBarChart
            data={rows.map((r) => ({ label: r.name, value: r.total_sales }))}
            currencySymbol={sym}
          />
        )}
      </div>

      {rows.length > 0 && (
        <div className="rounded-2xl border border-[#E7E4F3] bg-white p-5">
          <table className="w-full text-left text-[13px]">
            <thead>
              <tr className="border-b border-[#EDEBFA] text-[#726C8C]">
                <th className="py-2 pr-4 font-medium">Product</th>
                <th className="py-2 pr-4 text-right font-medium">Total Sales</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.product_id} className="border-b border-[#F5F4FA]">
                  <td className="py-2.5 pr-4 text-[#221F35]">{r.name}</td>
                  <td className="py-2.5 pr-4 text-right">{formatMoney(r.total_sales, sym)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default POSTrendingProductsPage;
