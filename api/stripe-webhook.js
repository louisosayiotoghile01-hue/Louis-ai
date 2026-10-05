import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  const chunks = [];

  for await (const chunk of req) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed",
    });
  }

  const signature = req.headers["stripe-signature"];

  if (!signature) {
    return res.status(400).json({
      success: false,
      message: "Missing Stripe signature",
    });
  }

  try {
    const rawBody = await getRawBody(req);

    const event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("Stripe event received:", event.type);

    switch (event.type) {
      case "invoice.payment_failed":
        console.log("Invoice payment failed");
        break;

      case "checkout.session.completed":
        console.log("Checkout session completed");
        break;

      case "customer.subscription.created":
        console.log("Subscription created");
        break;

      case "customer.subscription.updated":
        console.log("Subscription updated");
        break;

      case "customer.subscription.deleted":
        console.log("Subscription cancelled");
        break;

      default:
        console.log("Unhandled Stripe event:", event.type);
    }

    return res.status(200).json({
      success: true,
      received: true,
      event: event.type,
    });

  } catch (error) {
    console.error("Stripe webhook error:", error.message);

    return res.status(400).json({
      success: false,
      message: "Webhook signature verification failed",
    });
  }
      }
