import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2024-04-10",
});

const http = httpRouter();

http.route({
  path: "/stripe",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature") as string;

    const event = await stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case "checkout.session.completed":
        // Handle successful payment
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;