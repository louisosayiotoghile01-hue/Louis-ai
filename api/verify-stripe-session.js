import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {

    if (req.method !== "GET") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    const sessionId = req.query.session_id;

    if (!sessionId) {
        return res.status(400).json({
            success: false,
            message: "Stripe session ID is required"
        });
    }

    try {

        const session = await stripe.checkout.sessions.retrieve(
            sessionId,
            {
                expand: ["line_items.data.price"]
            }
        );

        const priceId =
            session.line_items?.data?.[0]?.price?.id;

        if (
    session.payment_status !== "paid" ||
    session.mode !== "subscription" ||
    priceId !== "price_1UNYXa8p9xrArmZiLSkKG9Ia"
) {
    return res.status(400).json({
        success: false,
        message: "Stripe payment could not be verified"
    });
}

return res.status(200).json({
    success: true,
    message: "Stripe payment verified successfully",
    sessionId: session.id,
    customerId: session.customer,
    subscriptionId: session.subscription
});

        return res.status(200).json({
            success: true,
            message: "Stripe payment verified successfully",
            sessionId: session.id,
            customerId: session.customer,
            subscriptionId: session.subscription
        });

    } catch (error) {

        console.error(
            "Stripe verification error:",
            error
        );

        return res.status(500).json({
            success: false,
            message: "Server error while verifying Stripe payment"
        });
    }
          }
