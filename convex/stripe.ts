import { action, internalMutation, httpAction } from "./_generated/server";
import { Stripe } from "stripe";
import { v, ConvexError } from "convex/values";
import { CREDIT_PACKAGES } from "./creditCosts";
import { internal } from "./_generated/api";

export const pay = action({
  args: {
    priceId: v.string(),
  },
  handler: async (ctx, { priceId }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("You must be logged in to purchase credits.");
    }

    const user = await ctx.runQuery(api.users.getUser, {});
    if (!user) {
      throw new ConvexError("User not found.");
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2024-04-10",
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${process.env.VITE_APP_URL}/dashboard`,
      cancel_url: `${process.env.VITE_APP_URL}/dashboard`,
      metadata: {
        userId: user._id,
      },
      expand: ["line_items"],
    });

    return session.url;
  },
});

export const fulfill = internalMutation(
  async (
    { db },
    { userId, priceId }: { userId: string; priceId: string }
  ) => {
    const user = await db.get(userId as any);

    if (!user) {
      throw new Error("User not found");
    }

    const credits = CREDIT_PACKAGES[priceId as keyof typeof CREDIT_PACKAGES];

    if (!credits) {
      throw new Error("Invalid price ID");
    }

    await db.patch(user._id, {
      credits: user.credits + credits,
    });
  }
);

/**
 * Handles the Stripe webhook to fulfill credit purchases.
 * This httpAction is configured as the webhook endpoint in the Stripe dashboard.
 * When a user successfully completes a checkout session, Stripe sends a `checkout.session.completed` event to this endpoint.
 * The handler verifies the event, extracts the user ID and price ID from the session metadata,
 * and then calls the `fulfill` internal mutation to add the purchased credits to the user's account.
 */
export const handleWebhook = httpAction(async (ctx, request) => {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: "2024-04-10",
  });

  const signature = request.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      await request.text(),
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error(err);
    return new Response("Webhook Error", { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const userId = session.metadata!.userId!;
    const priceId = session.line_items!.data[0].price.id;

    await ctx.runMutation(internal.stripe.fulfill, { userId, priceId });
  }

  return new Response(null, { status: 200 });
});