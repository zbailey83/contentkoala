import { action } from "./_generated/server";
import { Stripe } from "stripe";
import { v } from "convex/values";


export const fulfill = internalMutation(
  async (
    { db },
    { userId, priceId }: { userId: string; priceId: string }
  ) => {
    const user = await db.get(userId as any);

    if (!user) {
      throw new Error("User not found");
    }

    const credits = creditPrices[priceId];

    if (!credits) {
      throw new Error("Invalid price ID");
    }

    await db.patch(user._id, {
      credits: user.credits + credits,
    });
  }
);

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