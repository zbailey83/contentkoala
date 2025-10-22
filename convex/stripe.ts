import { action } from "./_generated/server";
import { Stripe } from "stripe";
import { v } from "convex/values";

export const pay = action({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, { priceId }) => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    });

    const session = await stripe.checkout.sessions.create({
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "payment",
      success_url: `${process.env.VITE_APP_URL!}/success`,
      cancel_url: `${process.env.VITE_APP_URL!}/cancel`,
    });

    return session.url;
  },
});