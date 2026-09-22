import { createFileRoute } from "@tanstack/react-router";
import { getStripe } from "~/lib/stripe";
import { sql } from "~/db";

export const Route = createFileRoute("/api/affiliate/conversion")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const sessionId = url.searchParams.get("session_id");
        if (!sessionId) {
          return Response.json({ error: "Missing session_id" }, { status: 400 });
        }

        const stripe = getStripe();
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        if (session.payment_status !== "paid") {
          return Response.json({ error: "Payment not confirmed" }, { status: 409 });
        }

        const rows = await sql()`
          SELECT id, total_cents
          FROM orders
          WHERE stripe_session_id = ${sessionId}
          LIMIT 1
        `;
        if (rows.length === 0) {
          return Response.json({ error: "Order not found" }, { status: 404 });
        }

        const order = rows[0] as any;
        return Response.json({
          number: String(order.id),
          total: Number(order.total_cents) / 100,
        });
      },
    },
  },
});
