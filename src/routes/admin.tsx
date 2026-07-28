import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  productsSold: number;
  recentOrders: Array<{
    id: string;
    date: string;
    email: string;
    product: string;
    amount: number;
    status: string;
  }>;
}

export const Route = createFileRoute("/admin")({
  component: AdminDashboard,
});

function AdminDashboard() {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (!res.ok) {
          navigate({ to: "/sign-in" });
          return;
        }
        const data = await res.json();
        setAdmin(data.admin);
        await fetchStats();
      } catch {
        navigate({ to: "/sign-in" });
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [navigate]);

  async function fetchStats() {
    try {
      const res = await fetch("/api/admin/stats");
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      setError("Failed to load stats");
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    navigate({ to: "/" });
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <p className="text-neutral-500">Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Admin Header */}
      <header className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-neutral-400 hover:text-white transition-colors">← Back to site</Link>
            <span className="text-sm font-semibold">Admin Dashboard</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-400">{admin?.email}</span>
            <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white transition-colors">Logout</button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-neutral-800">Dashboard</h1>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Stats Grid */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total Orders" value={stats?.totalOrders ?? 0} />
          <StatCard label="Total Revenue" value={`$${((stats?.totalRevenue ?? 0) / 100).toLocaleString()}`} />
          <StatCard label="Total Customers" value={stats?.totalCustomers ?? 0} />
          <StatCard label="Products Sold" value={stats?.productsSold ?? 0} />
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <Link
            to="/admin/orders"
            className="rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-sm"
          >
            <h3 className="font-semibold text-neutral-800">Orders →</h3>
            <p className="mt-1 text-sm text-neutral-500">View and manage all customer orders</p>
          </Link>
          <Link
            to="/admin/customers"
            className="rounded-lg border border-neutral-200 bg-white p-6 transition-all hover:border-brand-200 hover:shadow-sm"
          >
            <h3 className="font-semibold text-neutral-800">Customers →</h3>
            <p className="mt-1 text-sm text-neutral-500">View registered customer accounts</p>
          </Link>
        </div>

        {/* Recent Orders */}
        <section className="mt-10">
          <h2 className="text-xl font-bold text-neutral-800">Recent Orders</h2>
          <div className="mt-4 rounded-lg border border-neutral-200 bg-white overflow-hidden">
            {stats?.recentOrders && stats.recentOrders.length > 0 ? (
              <table className="w-full text-sm">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Date</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Customer</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Amount</th>
                    <th className="text-left px-4 py-3 font-medium text-neutral-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-neutral-100 last:border-0">
                      <td className="px-4 py-3 text-neutral-600">{new Date(order.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-neutral-700">{order.email}</td>
                      <td className="px-4 py-3 text-neutral-700">{order.product}</td>
                      <td className="px-4 py-3 font-medium text-neutral-800">${(order.amount / 100).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          order.status === "paid" ? "bg-green-100 text-green-700" :
                          order.status === "pending" ? "bg-amber-100 text-amber-700" :
                          "bg-neutral-100 text-neutral-600"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-8 text-center text-neutral-500">No orders yet.</div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-6">
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-neutral-800">{value}</p>
    </div>
  );
}
