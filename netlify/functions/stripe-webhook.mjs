import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2024-06-20" });
const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function handler(event) {
  const sig = event.headers["stripe-signature"];
  let evt;
  try { evt = stripe.webhooks.constructEvent(event.body, sig, secret); }
  catch (e) { return { statusCode: 400, body: `Webhook Error: ${e.message}` }; }

  if (evt.type === "checkout.session.completed") {
    console.log("Donation completed:", evt.data.object.id);
  }
  return { statusCode: 200, body: "ok" };
}
