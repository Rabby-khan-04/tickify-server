import status from "http-status";
import Stripe from "stripe";
import Booking from "../models/booking.model.js";
import ApiResponce from "../utils/ApiResponse.js";

const stripeInstance = new Stripe(process.env.STRIPE_SK);

const stripeWebhooks = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripeInstance.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_KEY
    );
  } catch (error) {
    console.error("Webhook signature verification failed:", error.message);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;

        const sessionList = await stripeInstance.checkout.sessions.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        const session = sessionList.data[0];
        if (!session) {
          console.error("No Checkout session found for this PaymentIntent");
          return res.status(404).send("Session not found");
        }

        const { bookingId } = session.metadata;

        if (!bookingId) {
          console.error("No bookingId found in session metadata");
          return res.status(400).send("Missing bookingId in metadata");
        }

        // Update booking status
        await Booking.findByIdAndUpdate(bookingId, {
          paymentStatus: "paid",
          paymentLink: "",
        });

        console.log(`Booking ${bookingId} marked as paid.`);
        break;

      default:
        console.log("Unhandled event type:", event.type);
    }

    // Step 3: Respond to Stripe
    res.status(200).send("Received");
  } catch (error) {
    console.error("Error handling webhook:", error);
    res.status(500).send("Internal Server Error");
  }
};

export default stripeWebhooks;
