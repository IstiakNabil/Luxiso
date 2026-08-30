import { useState } from "react";
import { Search } from "lucide-react";

import { usePOSAuth } from "../hooks/usePOSAuth";
import { useOnlineProducts } from "../hooks/useOnlineReports";
import { getOnlineProducts } from "../services/pos.service";
import { fetchAllPages } from "../utils/exportHelpers";
import DataTableShell from "../components/DataTableShell";
import { formatMoney } from "../utils/format";
import type { OnlineProductStockRow } from "../types/pos";

function POSOnlineProductsPage() {
  const { me } = usePOSAuth();
  const sym = me?.has_pos_access ? me.business.currency_symbol : "";

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [outOfStockOnly, setOutOfStockOnly] = useState(false);

  const filters = { ...(search ? { search } : {}), out_of_stock: outOfStockOnly };
  const listQuery = useOnlineProducts(page, filters);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-[20px] font-bold text-[#221F35]">Online Products &amp; Stock</h1>
        <p className="text-[13px] text-[#726C8C]">
          Read-only — this is the website's own stock pool, separate from POS stock.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 rounded-lg border border-[#E7E4F3] bg-white px-3 py-2 md:w-72">
          <Search size={14} className="text-[#8A84B8]" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search product or SKU…"
            className="w-full bg-transparent text-[13px] text-[#221F35] outline-none"
          />
        </div>
        <label className="flex items-center gap-2 text-[13px] text-[#221F35]">
          <input
            type="checkbox"
            checked={outOfStockOnly}
            onChange={(e) => { setOutOfStockOnly(e.target.checked); setPage(1); }}
            className="h-4 w-4 rounded border-[#C9C4E8] accent-[#7C6AE8]"
          />
          Out of stock only
        </label>
      </div>

      <DataTableShell<OnlineProductStockRow>
        title="Online Products"
        data={listQuery.data}
        isLoading={listQuery.isLoading}
        page={page}
        onPageChange={setPage}
        rowKey={(row) => row.id}
        emptyLabel="No matching products."
        filenameBase="online-products"
        fetchAll={() => fetchAllPages((p) => getOnlineProducts(p, filters))}
        columns={[
          { header: "Product", render: (row) => row.product_name },
          { header: "Category", render: (row) => row.category_name },
          { header: "Color", render: (row) => row.color_name },
          { header: "Size", render: (row) => row.size_name },
          { header: "SKU", render: (row) => row.sku },
          { header: "Stock", align: "right", render: (row) => String(row.stock) },
          { header: "Price", align: "right", render: (row) => formatMoney(row.price, sym) },
          {
            header: "Status",
            render: (row) => (
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  row.is_active ? "bg-[#E6F7EC] text-[#2E9E5B]" : "bg-[#F1F0F8] text-[#726C8C]"
                }`}
              >
                {row.is_active ? "Active" : "Inactive"}
              </span>
            ),
            exportValue: (row) => (row.is_active ? "Active" : "Inactive"),
          },
        ]}
      />
    </div>
  );
}

export default POSOnlineProductsPage;
