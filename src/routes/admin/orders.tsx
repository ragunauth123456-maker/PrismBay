import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface Order {
  id: string;
  date: string;
  email: string;
  product: string;
  amount: number;
  status: string;
}

export const Route = createFileRoute("/admin/orders")({
  component: AdminOrders,
});

function AdminOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (!res.ok) { navigate({ to: "/sign-in" }); return; }
        await fetchOrders();
      } catch { navigate({ to: "/sign-in" }); }
    }
    init();
  }, [navigate]);

  async function fetchOrders() {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
      }
    } catch (err) {
      setError("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/auth/logout", { method: "POST" });
    navigate({ to: "/" });
  }

  if (loading) {
    return <div className="min-h-screen bg-neutral-50 flex items-center justify-center"><p className="text-neutral-500">Loading...</p></div>;
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-neutral-900 text-white">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="text-sm text-neutral-400 hover:text-white transition-colors">← Dashboard</Link>
            <span className="text-sm font-semibold">Orders</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white transition-colors">Logout</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-neutral-800">Orders</h1>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          {orders.length > 0 ? (
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
                {orders.map((order) => (
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
            <div className="p-8 text-center text-neutral-500">No orders found.</div>
          )}
        </div>
      </div>
    </div>
  );
}
