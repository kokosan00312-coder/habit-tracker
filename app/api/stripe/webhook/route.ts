import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const error = err as Error;
    console.error("Webhook signature error:", error.message);
    return NextResponse.json({
      error: "Invalid signature",
      detail: error.message,
      sigHeader: signature.substring(0, 30) + "...",
      bodyLength: body.length,
    }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.subscription && session.customer) {
        const sub = await stripe.subscriptions.retrieve(
          session.subscription as string
        ) as unknown as Stripe.Subscription & { current_period_end: number };
        const periodEnd = sub.current_period_end
          ? new Date(sub.current_period_end * 1000)
          : null;
        await prisma.subscription.update({
          where: { stripeCustomerId: session.customer as string },
          data: {
            stripeSubscriptionId: sub.id,
            stripePriceId: sub.items.data[0].price.id,
            status: "active",
            stripeCurrentPeriodEnd: periodEnd,
          },
        });
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription & { current_period_end?: number };
      const periodEnd = sub.current_period_end
        ? new Date(sub.current_period_end * 1000)
        : null;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: {
          status: sub.status === "active" ? "active" : String(sub.status),
          stripeCurrentPeriodEnd: periodEnd,
        },
      });
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await prisma.subscription.update({
        where: { stripeSubscriptionId: sub.id },
        data: { status: "canceled" },
      });
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice & { subscription?: string | null };
      if (invoice.subscription) {
        await prisma.subscription.update({
          where: { stripeSubscriptionId: invoice.subscription },
          data: { status: "past_due" },
        });
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
