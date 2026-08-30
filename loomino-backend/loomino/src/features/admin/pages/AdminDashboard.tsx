import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  AlertCircle,
  Package,
  Users,
  Layers,
  CalendarClock,
  LayoutGrid,
} from "lucide-react";

import { formatPrice, formatDate, getMediaUrl } from "@/lib/utils";
import { useAdminAuth } from "../hooks/useAdminAuth";
import StatCard from "../components/StatCard";
import StatusBadge from "../components/StatusBadge";
import { listCategories } from "../services/catalog.service";
import {
  useDashboardStats,
  useDashboardOrders,
} from "../hooks/useDashboard";

function AdminDashboard() {
  const { user } = useAdminAuth();
  const { data: stats, isLoading: statsLoading } =
    useDashboardStats();
  const { data: orders, isLoading: ordersLoading } =
    useDashboardOrders();
  const {
    data: categories,
    isLoading: categoriesLoading,
  } = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: listCategories,
  });

  const recentOrders = (orders ?? []).slice(0, 5);

  return (
    <div className="font-loomino">
      {/* Heading */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-[26px] font-bold text-[#2C2418]">
            Dashboard
          </h1>
          <p className="text-[14px] text-[#8A7C64]">
            Welcome back,{" "}
            {user?.first_name ?? "Loomino"} 👋
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-[#EDF7ED] px-3 py-1 text-[12px] font-medium text-[#2F7D4F]">
          <span className="h-2 w-2 rounded-full bg-[#2F7D4F]" />
          Live
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Earnings"
          hint="vs. last year"
          icon={<TrendingUp size={20} />}
          value={
            statsLoading
              ? "…"
              : formatPrice(stats?.total_sales ?? 0)
          }
        />
        <StatCard
          label="Today's Sales"
          hint={
            statsLoading
              ? undefined
              : `${stats?.today_orders ?? 0} order${
                  stats?.today_orders === 1 ? "" : "s"
                } today`
          }
          accent="#3F9E7A"
          icon={<CalendarClock size={20} />}
          value={
            statsLoading
              ? "…"
              : formatPrice(stats?.today_sales ?? 0)
          }
        />
        <StatCard
          label="Completed Orders"
          hint="Delivered"
          accent="#C9A227"
          icon={<DollarSign size={20} />}
          value={
            statsLoading ? "…" : stats?.completed_orders ?? 0
          }
        />
        <StatCard
          label="Total Orders"
          hint="All time"
          accent="#5A7FB0"
          icon={<ShoppingCart size={20} />}
          value={statsLoading ? "…" : stats?.total_orders ?? 0}
        />
        <StatCard
          label="Pending Orders"
          hint="Needs attention"
          accent="#C97A3A"
          icon={<AlertCircle size={20} />}
          value={
            statsLoading ? "…" : stats?.pending_orders ?? 0
          }
        />
        <StatCard
          label="Total Products"
          hint="In catalog"
          accent="#3F9E7A"
          icon={<Package size={20} />}
          value={statsLoading ? "…" : stats?.total_products ?? 0}
        />
        <StatCard
          label="Customers"
          hint="Registered users"
          accent="#C15B8A"
          icon={<Users size={20} />}
          value={statsLoading ? "…" : stats?.total_users ?? 0}
        />
      </div>

      {/* Welcome banner */}
      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl bg-[#211B12] p-6 md:flex-row md:items-center">
        <div className="flex items-start gap-3">
          <span className="text-[26px]">👋</span>
          <div>
            <p className="text-[16px] font-semibold text-white">
              Good day, {user?.first_name ?? "Loomino"}!
            </p>
            <p className="text-[13px] text-[#C9BCA3]">
              Here's a summary of what's happening in your
              store today.
              {stats?.pending_orders
                ? ` You have ${stats.pending_orders} pending orders that need your attention.`
                : ""}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            to="/admin/orders"
            className="rounded-lg bg-[#A88548] px-4 py-2 text-[13px] font-medium text-white"
          >
            View Orders
          </Link>
          <Link
            to="/admin/products"
            className="rounded-lg border border-[#4A4132] px-4 py-2 text-[13px] font-medium text-white"
          >
            Products
          </Link>
        </div>
      </div>

      {/* Recent orders */}
      <div className="mt-6 rounded-2xl border border-[#EFE9DE] bg-white">
        <div className="flex items-center justify-between border-b border-[#EFE9DE] px-6 py-4">
          <div className="flex items-center gap-2">
            <Layers size={18} className="text-[#A88548]" />
            <div>
              <p className="text-[15px] font-semibold text-[#2C2418]">
                Recent Orders
              </p>
              <p className="text-[12px] text-[#A89A80]">
                {(orders ?? []).length} total orders
              </p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="rounded-lg border border-[#E4DACA] px-3 py-1.5 text-[13px] text-[#6B5E48] hover:bg-[#F7F0E5]"
          >
            View All →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-[0.5px] text-[#A89A80]">
                <th className="px-6 py-3 font-medium">
                  Order Code
                </th>
                <th className="px-6 py-3 font-medium">
                  Customer
                </th>
                <th className="px-6 py-3 font-medium">
                  Total
                </th>
                <th className="px-6 py-3 font-medium">
                  Status
                </th>
                <th className="px-6 py-3 font-medium">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {ordersLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-8 text-center text-[14px] text-[#A89A80]"
                  >
                    Loading orders…
                  </td>
                </tr>
              )}

              {!ordersLoading &&
                recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-8 text-center text-[14px] text-[#A89A80]"
                    >
                      No orders yet.
                    </td>
                  </tr>
                )}

              {recentOrders.map((order) => (
                <tr
                  key={order.order_number}
                  className="border-t border-[#F1ECE2] text-[14px]"
                >
                  <td className="px-6 py-4 font-mono text-[12px] text-[#4C300D]">
                    #{order.order_number}
                  </td>
                  <td className="px-6 py-4 text-[#3A2E1B]">
                    {order.customer}
                  </td>
                  <td className="px-6 py-4 font-semibold text-[#2C2418]">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-6 py-4 text-[#8A7C64]">
                    {formatDate(order.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Categories */}
      <div className="mt-6 rounded-2xl border border-[#EFE9DE] bg-white">
        <div className="flex items-center justify-between border-b border-[#EFE9DE] px-6 py-4">
          <div className="flex items-center gap-2">
            <LayoutGrid size={18} className="text-[#A88548]" />
            <div>
              <p className="text-[15px] font-semibold text-[#2C2418]">
                Categories
              </p>
              <p className="text-[12px] text-[#A89A80]">
                {(categories ?? []).length} categories
              </p>
            </div>
          </div>
          <Link
            to="/admin/categories"
            className="rounded-lg border border-[#E4DACA] px-3 py-1.5 text-[13px] text-[#6B5E48] hover:bg-[#F7F0E5]"
          >
            Manage →
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-3 p-6 sm:grid-cols-3 xl:grid-cols-5">
          {categoriesLoading && (
            <p className="col-span-full py-4 text-center text-[14px] text-[#A89A80]">
              Loading categories…
            </p>
          )}

          {!categoriesLoading &&
            (categories ?? []).length === 0 && (
              <p className="col-span-full py-4 text-center text-[14px] text-[#A89A80]">
                No categories yet.
              </p>
            )}

          {(categories ?? []).map((cat) => (
            <Link
              key={cat.id}
              to={`/admin/categories`}
              className="flex items-center gap-3 rounded-xl border border-[#F1ECE2] p-3 transition hover:border-[#DDD3C0] hover:bg-[#FBF8F2]"
            >
              {cat.icon_image ? (
                <img
                  src={getMediaUrl(cat.icon_image) ?? ""}
                  alt={cat.name}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F0E9DA] text-[13px] font-semibold text-[#A88548]">
                  {cat.name[0]}
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-[13px] font-medium text-[#2C2418]">
                  {cat.name}
                </p>
                <p className="text-[12px] text-[#A89A80]">
                  {cat.product_count} product
                  {cat.product_count === 1 ? "" : "s"}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
