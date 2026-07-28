import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";

interface Customer {
  id: string;
  email: string;
  name: string;
  created_at: string;
  order_count: number;
}

export const Route = createFileRoute("/admin/customers")({
  component: AdminCustomers,
});

function AdminCustomers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function init() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (!res.ok) { navigate({ to: "/sign-in" }); return; }
        await fetchCustomers();
      } catch { navigate({ to: "/sign-in" }); }
    }
    init();
  }, [navigate]);

  async function fetchCustomers() {
    try {
      const res = await fetch("/api/admin/customers");
      if (res.ok) {
        const data = await res.json();
        setCustomers(data.customers);
      }
    } catch (err) {
      setError("Failed to load customers");
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
            <span className="text-sm font-semibold">Customers</span>
          </div>
          <button onClick={handleLogout} className="text-sm text-neutral-400 hover:text-white transition-colors">Logout</button>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-3xl font-bold text-neutral-800">Customers</h1>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-neutral-200 bg-white overflow-hidden">
          {customers.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Name</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-neutral-600">Orders</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-neutral-100 last:border-0">
                    <td className="px-4 py-3 font-medium text-neutral-800">{customer.name || "—"}</td>
                    <td className="px-4 py-3 text-neutral-600">{customer.email}</td>
                    <td className="px-4 py-3 text-neutral-600">{new Date(customer.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-neutral-700">{customer.order_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-neutral-500">No customers registered yet.</div>
          )}
        </div>
      </div>
    </div>
  );
}
