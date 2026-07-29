require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Stripe = require("stripe");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app = express();
app.use(cors());

// In-memory "database" of orders for demo purposes.
// Key = Stripe checkout session id, value = { status, amount, ... }
const orders = {};

// ---------- Webhook route: MUST use raw body, so it's mounted BEFORE express.json() ----------
app.post("/api/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      orders[session.id] = {
        status: "paid",
        amountTotal: session.amount_total,
        currency: session.currency,
        customerEmail: session.customer_details?.email,
      };
      console.log(`✅ Payment succeeded for session ${session.id}`);
      // In a real app: update the user's subscription/order status in Postgres/Mongo here.
      break;
    }
    case "checkout.session.async_payment_failed": {
      const session = event.data.object;
      orders[session.id] = { status: "failed" };
      console.log(`❌ Payment failed for session ${session.id}`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
});

// ---------- Normal JSON body parsing for everything else ----------
app.use(express.json());

// ---------- Create a Checkout Session ----------
app.post("/api/create-checkout-session", async (req, res) => {
  const { productName, amount, currency = "usd" } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency,
            product_data: { name: productName || "Growfinix Product" },
            unit_amount: amount || 1999, // amount in cents
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create checkout session", details: err.message });
  }
});

// ---------- Check order/payment status (frontend polls this on the success page) ----------
app.get("/api/order-status/:sessionId", (req, res) => {
  const order = orders[req.params.sessionId];
  if (!order) return res.json({ status: "pending" }); // webhook may not have arrived yet
  res.json(order);
});

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`Stripe backend running on port ${PORT}`));
