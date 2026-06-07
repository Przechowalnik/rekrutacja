import dayjs from "dayjs";
import { TFunction } from "i18next";
import type Stripe from "stripe";

import { links } from "~/constants/links";
import { namespaces } from "~/constants/namespaces";
import { E_Routes, getRoute } from "~/constants/routes";
import i18next from "~/localization/i18n.server";

import { database } from "./database.server";
import {
  sendCheckoutListingPaymentFailed,
  sendInvoice,
  sendSubscriptionDeleted,
  sendSubscriptionPaymentFailed,
  sendSubscriptionUpcoming,
} from "./emailsGenerator.server";
import { environment } from "./environment.server";
import { createInvoice, getInvoice } from "./fakturownia.server";
import { logger } from "./logger.server";
import { fireMetaPurchaseEvent } from "./metaCapi.server";
import {
  E_ListingPaymentStatusServer,
  E_ListingStatusServer,
  E_RolesServer,
  E_SubscriptionStatusServer,
} from "./models.server";
import { client } from "./redis.server";
import { responseOnSuccess } from "./response.server";
import { formatAmountOnlyNumber, stripe } from "./stripe.server";

type T_PaymentIntentSource = "checkout" | "manual" | "subscription";

const detectPaymentIntentSource = async (
  paymentIntent: Stripe.PaymentIntent,
): Promise<T_PaymentIntentSource> => {
  try {
    if (paymentIntent.invoice) {
      const invoiceId =
        typeof paymentIntent.invoice === "string"
          ? paymentIntent.invoice
          : paymentIntent.invoice.id;
      const invoice = await stripe.invoices.retrieve(invoiceId);

      if (invoice.subscription) {
        return "subscription";
      }
    }

    if (paymentIntent.metadata?.context === "checkout") {
      return "checkout";
    }

    if (
      paymentIntent.metadata?.checkout_session_id ||
      paymentIntent.description?.includes("Checkout")
    ) {
      return "checkout";
    }

    return "manual";
  } catch (error) {
    console.error("Failed to detect payment intent source:", error);
    return "manual";
  }
};

const WEBHOOK_IDEMPOTENCY_TTL = 86_400; // 24h

async function isWebhookAlreadyProcessed(eventId: string): Promise<boolean> {
  try {
    const key = `stripe_webhook:${eventId}`;
    const existing = await client.get(key);
    if (existing) {
      return true;
    }
    await client.set(key, "1");
    await client.expire(key, WEBHOOK_IDEMPOTENCY_TTL);
    return false;
  } catch {
    // If Redis is down, allow processing (Stripe signature already verified)
    return false;
  }
}

export const stripeWebhook = async ({ request }: { request: Request }) => {
  let event: Stripe.Event;

  const secret = environment("STRIPE_WEBHOOK_SECRET");
  const sig = request.headers.get("stripe-signature");
  if (!sig) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }
  const payload = await request.text();

  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (error) {
    const validError: { message?: string } = error as { message?: string };
    logger.warn("Stripe webhook signature verification failed", {
      error: validError?.message,
    });
    return new Response("Webhook signature verification failed", {
      status: 400,
    });
  }

  // Idempotency: skip if this event was already processed
  const alreadyProcessed = await isWebhookAlreadyProcessed(event.id);
  if (alreadyProcessed) {
    logger.info("Stripe webhook event already processed, skipping", {
      eventId: event.id,
      eventType: event.type,
    });
    return new Response("Already processed", { status: 200 });
  }

  const permittedEvents: string[] = [
    "invoice.payment_failed",
    "invoice.paid",
    "invoice.upcoming",
    "customer.subscription.deleted",
    "payment_intent.payment_failed",
    "payment_intent.canceled",
    "payment_intent.succeeded",
    "checkout.session.async_payment_failed",
    "checkout.session.completed",
    "checkout.session.expired",
    // "customer.subscription.create",
    // "customer.subscription.update",
    // "customer.subscription.trial_will_end",
  ];

  if (permittedEvents.includes(event.type)) {
    try {
      switch (event.type) {
        case "payment_intent.succeeded": {
          const source = await detectPaymentIntentSource(event.data.object);

          switch (source) {
            case "subscription": {
              return await responseOnSuccess({
                data: {
                  isSubscription: true,
                  received: true,
                },
                request,
                status: 200,
              });
            }
            case "checkout": {
              return await responseOnSuccess({
                data: {
                  isCheckout: true,
                  received: true,
                },
                request,
                status: 200,
              });
            }
            case "manual": {
              return await checkoutPaymentIntentPaid(
                event.data.object,
                request,
              );
            }
            default: {
              return new Response("Bad event", {
                status: 400,
              });
            }
          }
        }

        case "payment_intent.payment_failed": {
          const source = await detectPaymentIntentSource(event.data.object);

          switch (source) {
            case "subscription": {
              return await responseOnSuccess({
                data: {
                  isSubscription: true,
                  received: true,
                },
                request,
                status: 200,
              });
            }
            case "checkout": {
              return await responseOnSuccess({
                data: {
                  isCheckout: true,
                  received: true,
                },
                request,
                status: 200,
              });
            }
            case "manual": {
              return await paymentIntentPaymentFailed(
                event.data.object,
                request,
              );
            }
            default: {
              return new Response("Bad event", {
                status: 400,
              });
            }
          }
        }

        case "payment_intent.canceled": {
          const source = await detectPaymentIntentSource(event.data.object);

          switch (source) {
            case "subscription": {
              return await responseOnSuccess({
                data: {
                  isSubscription: true,
                  received: true,
                },
                request,
                status: 200,
              });
            }
            case "checkout": {
              return await responseOnSuccess({
                data: {
                  isCheckout: true,
                  received: true,
                },
                request,
                status: 200,
              });
            }
            case "manual": {
              return await paymentIntentCanceled(event.data.object, request);
            }
            default: {
              return new Response("Bad event", {
                status: 400,
              });
            }
          }
        }

        case "invoice.upcoming": {
          const dataStripe = event.data.object;
          return dataStripe.subscription
            ? await subscriptionUpcoming(dataStripe, request)
            : new Response("Bad event", {
                status: 400,
              });
        }

        case "invoice.paid": {
          const dataStripe = event.data.object;
          return dataStripe.subscription
            ? await paymentSubscriptionPaid(dataStripe, request)
            : new Response("Bad event", {
                status: 400,
              });
        }

        case "invoice.payment_failed": {
          const dataStripe = event.data.object;
          return dataStripe.subscription
            ? await invoicePaymentSubscriptionFailed(dataStripe, request)
            : new Response("Bad event", {
                status: 400,
              });
        }

        case "customer.subscription.deleted": {
          return await subscriptionDeleted(event.data.object, request);
        }

        case "checkout.session.completed": {
          return await checkoutSessionPaid(event.data.object, request);
        }

        case "checkout.session.async_payment_failed": {
          return await checkoutPaymentFailed(event.data.object, request);
        }

        case "checkout.session.expired": {
          return await checkoutPaymentExpired(event.data.object, request);
        }

        // case "customer.subscription.trial_will_end": {
        //   return await subscriptionTrialWillEnd(
        //     event.data.object as Stripe.Subscription,
        //     request,
        //   );
        // }

        default: {
          return new Response("Bad event", {
            status: 400,
          });
        }
      }
    } catch {
      return new Response("Something went wrong", {
        status: 400,
      });
    }
  } else {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
};

async function paymentSubscriptionPaid(
  dataStripe: Stripe.Invoice,
  request: Request,
) {
  try {
    const companyId = dataStripe.subscription_details?.metadata?.companyId;
    const subscriptionId = dataStripe.subscription as string;

    const foundSubscription = await database.subscription.findUnique({
      select: {
        extraFreeDaysInCurrentPeriod: true,
        id: true,
      },
      where: {
        companyId: companyId,
        status: {
          notIn: [
            E_SubscriptionStatusServer.CANCELLED,
            E_SubscriptionStatusServer.TO_BE_CANCELLED,
          ],
        },
        stripeSubscriptionId: subscriptionId,
      },
    });

    if (!foundSubscription) {
      return new Response("Not found subscription", {
        status: 422,
      });
    }

    if (!companyId || !subscriptionId) {
      return new Response("No companyId or subscriptionId", {
        status: 422,
      });
    }

    if (!dataStripe.payment_intent) {
      if (foundSubscription.extraFreeDaysInCurrentPeriod) {
        return await responseOnSuccess({
          data: {
            isExtraFreeDaysInCurrentPeriod: true,
            received: true,
          },
          request,
          status: 200,
        });
      }

      return new Response("No found stripe payment intent", {
        status: 400,
      });
    }

    const upcomingInvoice = await stripe.invoices.retrieveUpcoming({
      subscription: subscriptionId,
    });

    const nextPaymentAttempt = upcomingInvoice.next_payment_attempt
      ? dayjs.unix(upcomingInvoice.next_payment_attempt).local().toISOString()
      : null;

    await database.subscription.update({
      data: {
        endDateExchangeFreeDays: null,
        extraFreeDaysInCurrentPeriod: 0,
        nextPaymentAttempt,
        status: E_SubscriptionStatusServer.ACTIVE,
      },
      select: {
        id: true,
      },
      where: {
        companyId: companyId,
        status: {
          notIn: [
            E_SubscriptionStatusServer.CANCELLED,
            E_SubscriptionStatusServer.TO_BE_CANCELLED,
          ],
        },
        stripeSubscriptionId: subscriptionId,
      },
    });

    const foundCompany = await database.company.findUnique({
      select: {
        invoiceData: {
          select: {
            city: true,
            companyName: true,
            country: true,
            flatNumber: true,
            postalCode: true,
            streetName: true,
            streetNumber: true,
            taxCountry: true,
            taxNumber: true,
          },
        },
      },
      where: {
        id: companyId,
      },
    });

    if (!foundCompany) {
      return new Response("No found company", {
        status: 400,
      });
    }

    const foundOwner = await database.user.findFirst({
      select: {
        email: true,
        id: true,
        lang: true,
        role: true,
      },
      where: {
        companyId: companyId,
        role: E_RolesServer.B2B_OWNER,
      },
    });

    if (!foundOwner) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    if (!foundOwner || !foundCompany?.invoiceData) {
      return new Response("No found invoice data", {
        status: 400,
      });
    }

    console.warn(`💰 invoice.paid: ${dataStripe.status}`);

    const countFoundInvoiceWithStripePaymentIntentId =
      await database.invoice.count({
        where: {
          stripePaymentIntentId: dataStripe.payment_intent as string,
        },
      });

    if (countFoundInvoiceWithStripePaymentIntentId > 0) {
      return new Response("Found invoice with stripe payment intent id", {
        status: 400,
      });
    }

    const newInvoice = await database.invoice.create({
      data: {
        companyId: companyId,
        stripePaymentIntentId: dataStripe.payment_intent as string,
        subscriptionId: foundSubscription.id,
      },
      select: {
        id: true,
      },
    });

    const t: TFunction<"invoice", undefined> = await i18next.getFixedT(
      foundOwner.lang.toLowerCase(),
      namespaces.invoice,
    );

    const mapPositions = dataStripe.lines.data.map(item => {
      let allDiscountAmounts: number = 0;
      if (item.discount_amounts) {
        for (const itemDiscount of item.discount_amounts) {
          allDiscountAmounts = allDiscountAmounts + itemDiscount.amount;
        }
      }

      return {
        discount:
          allDiscountAmounts === 0
            ? undefined
            : formatAmountOnlyNumber(allDiscountAmounts),
        name: item.plan?.nickname
          ? `${t("subscription")} ${item.plan?.nickname}`
          : t("subscription"),
        quantity: item.quantity ?? 1,
        tax: 23,
        total_price_gross: formatAmountOnlyNumber(item.amount),
      };
    });

    const invoice = await createInvoice({
      buyer_email: foundOwner.email,
      buyer_name: foundCompany?.invoiceData?.companyName.toUpperCase(),
      buyer_tax_no: `${Number(foundCompany.invoiceData.taxNumber)}`,
      // buyer_tax_no: `${foundCompany.invoiceData.taxCountry}${Number(foundCompany.invoiceData.taxNumber)}`,
      positions: mapPositions,
    });

    const countFoundFakturowniaInvoiceId = await database.invoice.count({
      where: {
        fakturowniaInvoiceId: invoice.id.toString(),
      },
    });

    if (countFoundFakturowniaInvoiceId > 0) {
      return new Response("Found fakturownia invoice id", {
        status: 400,
      });
    }

    await database.invoice.update({
      data: {
        fakturowniaInvoiceId: invoice.id.toString(),
      },
      where: {
        id: newInvoice.id,
      },
    });

    const invoiceBuffer = await getInvoice({
      invoiceId: invoice.id.toString(),
    });

    await sendInvoice({
      pdfBuffer: invoiceBuffer,
      request,
      toEmail: foundOwner.email,
      userLanguage: foundOwner.lang,
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

async function invoicePaymentSubscriptionFailed(
  dataStripe: Stripe.Invoice,
  request: Request,
) {
  try {
    console.warn(`❗invoice.payment_failed`);
    const companyId = dataStripe.subscription_details?.metadata?.companyId;
    const subscriptionId = dataStripe.subscription as string;

    if (!companyId || !subscriptionId) {
      return new Response("No found companyId or subscriptionId", {
        status: 400,
      });
    }

    const nextPaymentAttempt = dataStripe.next_payment_attempt
      ? dayjs.unix(dataStripe.next_payment_attempt).local().toISOString()
      : null;

    await database.subscription.update({
      data: {
        nextPaymentAttempt,
        status: E_SubscriptionStatusServer.UNPAID,
      },
      where: {
        companyId: companyId,
        stripeSubscriptionId: subscriptionId,
      },
    });

    const foundOwner = await database.user.findFirst({
      select: {
        email: true,
        lang: true,
      },
      where: {
        companyId: companyId,
        role: E_RolesServer.B2B_OWNER,
      },
    });

    if (!foundOwner) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    if (dataStripe.next_payment_attempt) {
      await sendSubscriptionPaymentFailed({
        nextPaymentAttempt: dataStripe.next_payment_attempt
          ? dayjs
              .unix(dataStripe.next_payment_attempt)
              .format("YYYY-MM-DD HH:mm")
          : "",
        request,
        toEmail: foundOwner.email,
        userLanguage: foundOwner.lang,
      });
    }

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

async function subscriptionDeleted(
  dataStripe: Stripe.Subscription,
  request: Request,
) {
  try {
    console.warn(`❌ customer.subscription.deleted`);
    const companyId = dataStripe?.metadata?.companyId;
    const subscriptionId = dataStripe.id;

    if (!companyId || !subscriptionId) {
      return new Response("Not found companyId or subscriptionId", {
        status: 400,
      });
    }

    await database.subscription.update({
      data: {
        endDate: dayjs().toDate(),
        endDateExchangeFreeDays: null,
        nextPaymentAttempt: null,
        status: E_SubscriptionStatusServer.CANCELLED,
      },
      where: {
        companyId: companyId,
        stripeSubscriptionId: subscriptionId,
      },
    });

    const foundOwner = await database.user.findFirst({
      select: {
        email: true,
        lang: true,
      },
      where: {
        companyId: companyId,
        role: E_RolesServer.B2B_OWNER,
      },
    });

    if (!foundOwner) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    await sendSubscriptionDeleted({
      request,
      toEmail: foundOwner.email,
      userLanguage: foundOwner.lang,
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

// NOSONAR
// async function subscriptionTrialWillEnd(
//   dataStripe: Stripe.Subscription,
//   request: Request,
// ) {
//   console.warn("😐 customer.subscription.trial_will_end");
//   const companyId = dataStripe?.metadata?.companyId;
//   const subscriptionId = dataStripe.id;
//   const latestInvoiceId = dataStripe.latest_invoice as string;
//   if (latestInvoiceId) {
//     return await responseOnSuccess({
//       data: {
//         isExtraFreeDaysInCurrentPeriod: true,
//         received: true,
//       },
//       status: 200,
//     });
//   }
//   if (!companyId || !subscriptionId) {
//     return new Response("Not found companyId or subscriptionId", {
//       status: 400,
//     });
//   }
//   await database.subscription.update({
//     data: {
//       status: E_SubscriptionStatusServer.PENDING,
//     },
//     where: {
//       companyId: companyId,
//       stripeSubscriptionId: subscriptionId,
//     },
//   });
//   const foundOwner = await database.user.findFirst({
//     select: {
//       email: true,
//     },
//     where: {
//       companyId: companyId,
//       role: E_RolesServer.B2B_OWNER,
//     },
//   });
//   if (!foundOwner) {
//     return new Response("Not found owner", {
//       status: 400,
//     });
//   }
//   await sendSubscriptionTrialEndingWithBilling({
//     nextPaymentAttempt: dayjs
//       .unix(dataStripe.current_period_end)
//       .format("YYYY-MM-DD HH:mm"),
//     request,
//     toEmail: foundOwner.email,
//     context
//   });
//   return await responseOnSuccess({
//     data: {
//       received: true,
//     },
//     status: 200,
//   });
// }

async function subscriptionUpcoming(
  dataStripe: Stripe.Invoice,
  request: Request,
) {
  console.warn("🧐 invoice.upcoming");
  const companyId = dataStripe?.subscription_details?.metadata?.companyId;
  const subscriptionId = dataStripe.subscription;

  if (!companyId || !subscriptionId) {
    return new Response("Not found companyId or subscriptionId", {
      status: 400,
    });
  }

  const stripeSubscriptionId =
    typeof subscriptionId === "string" ? subscriptionId : subscriptionId.id;

  const countFoundSubscription = await database.subscription.count({
    where: {
      companyId: companyId,
      stripeSubscriptionId,
    },
  });

  if (countFoundSubscription === 0) {
    return new Response("Not found subscription", {
      status: 400,
    });
  }

  const foundOwner = await database.user.findFirst({
    select: {
      email: true,
      lang: true,
    },
    where: {
      companyId: companyId,
      role: E_RolesServer.B2B_OWNER,
    },
  });

  if (!foundOwner) {
    return new Response("Not found owner", {
      status: 400,
    });
  }

  if (!dataStripe.next_payment_attempt) {
    return new Response("Not found next payment attempt", {
      status: 400,
    });
  }

  await sendSubscriptionUpcoming({
    nextPaymentAttempt: dayjs
      .unix(dataStripe.next_payment_attempt)
      .format("YYYY-MM-DD HH:mm"),
    request,
    toEmail: foundOwner.email,
    userLanguage: foundOwner.lang,
  });

  return await responseOnSuccess({
    data: {
      received: true,
    },
    request,
    status: 200,
  });
}

async function checkoutSessionPaid(
  dataStripe: Stripe.Checkout.Session,
  request: Request,
) {
  try {
    const userId = dataStripe?.metadata?.userId;
    const companyId = dataStripe?.metadata?.companyId;
    const checkoutId = dataStripe.id;
    const paymentIntentId = dataStripe.payment_intent;

    if (!companyId && !userId) {
      return new Response("No userId or companyId", {
        status: 422,
      });
    }

    if (!checkoutId) {
      return new Response("No checkout id", {
        status: 422,
      });
    }

    const foundListingPayment = await database.listingPayment.findFirst({
      select: {
        id: true,
        listing: {
          select: {
            expiresAt: true,
          },
        },
        listingId: true,
        monthsToAdd: true,
      },
      where: {
        listing: {
          ...(companyId
            ? {
                companyId: companyId,
              }
            : {
                userId: userId,
              }),
        },
        stripeCheckoutId: checkoutId,
      },
    });

    if (!foundListingPayment?.listing) {
      return new Response("Not found listing payment", {
        status: 422,
      });
    }

    const foundCompany = companyId
      ? await database.company.findUnique({
          select: {
            invoiceData: {
              select: {
                city: true,
                companyName: true,
                country: true,
                flatNumber: true,
                postalCode: true,
                streetName: true,
                streetNumber: true,
                taxCountry: true,
                taxNumber: true,
              },
            },
          },
          where: {
            id: companyId,
          },
        })
      : null;

    if (companyId && !foundCompany) {
      return new Response("No found company", {
        status: 400,
      });
    }

    const foundUser = await database.user.findFirst({
      select: {
        email: true,
        firstName: true,
        id: true,
        lang: true,
        lastName: true,
        role: true,
      },
      where: {
        ...(companyId
          ? {
              companyId: companyId,
              role: E_RolesServer.B2B_OWNER,
            }
          : {
              id: userId,
            }),
      },
    });

    if (!foundUser) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    const isListingCurrentlyActive = foundListingPayment?.listing?.expiresAt
      ? dayjs(foundListingPayment.listing.expiresAt).isAfter(dayjs())
      : false;

    const validOldDate = isListingCurrentlyActive
      ? dayjs(foundListingPayment?.listing?.expiresAt)
      : dayjs();

    const newDateExpiresAt = validOldDate
      .add(foundListingPayment?.monthsToAdd ?? 0, "month")
      .toDate();

    await database.listingPayment.update({
      data: {
        expiresAtAfterAdd: newDateExpiresAt,
        expiresAtBeforeAdd: foundListingPayment?.listing?.expiresAt,
        status: E_ListingPaymentStatusServer.PAID,
        stripeCheckoutUrl: null,
      },
      where: {
        id: foundListingPayment.id,
      },
    });

    await database.listing.update({
      data: {
        expiresAt: newDateExpiresAt,
        status: E_ListingStatusServer.ACTIVE,
      },
      where: {
        id: foundListingPayment.listingId,
      },
    });

    console.warn(`💰 checkout.session.completed: ${dataStripe.status}`);

    const newInvoice = await database.invoice.create({
      data: {
        ...(companyId
          ? {
              companyId: companyId,
            }
          : {
              userId: userId,
            }),
        listingPayments: {
          connect: {
            id: foundListingPayment.id,
          },
        },
        stripeCheckoutId: checkoutId,
        stripePaymentIntentId: paymentIntentId as string,
      },
      select: {
        id: true,
      },
    });

    const t: TFunction<"invoice", undefined> = await i18next.getFixedT(
      foundUser.lang.toLowerCase(),
      namespaces.invoice,
    );

    const lineItems = await stripe.checkout.sessions.listLineItems(checkoutId, {
      limit: 20,
    });

    const mapPositions = lineItems?.data?.map(item => {
      return {
        discount: undefined,
        name: item.description ?? t("listing"),
        quantity: item.quantity ?? 1,
        tax: 23,
        total_price_gross: formatAmountOnlyNumber(item.amount_total),
      };
    });

    const invoice = await createInvoice({
      buyer_email: foundUser.email,
      buyer_name: companyId
        ? (foundCompany?.invoiceData?.companyName.toUpperCase() ?? "")
        : `${foundUser.firstName} ${foundUser.lastName}`,
      buyer_tax_no: companyId
        ? `${Number(foundCompany?.invoiceData?.taxNumber)}`
        : null,
      // buyer_tax_no: `${foundCompany.invoiceData.taxCountry}${Number(foundCompany.invoiceData.taxNumber)}`,
      positions: mapPositions,
    });

    const countFoundFakturowniaInvoiceId = await database.invoice.count({
      where: {
        fakturowniaInvoiceId: invoice.id.toString(),
      },
    });

    if (countFoundFakturowniaInvoiceId > 0) {
      return new Response("Found fakturownia invoice id", {
        status: 400,
      });
    }

    await database.invoice.update({
      data: {
        fakturowniaInvoiceId: invoice.id.toString(),
      },
      where: {
        id: newInvoice.id,
      },
    });

    const invoiceBuffer = await getInvoice({
      invoiceId: invoice.id.toString(),
    });

    await sendInvoice({
      pdfBuffer: invoiceBuffer,
      request,
      toEmail: foundUser.email,
      userLanguage: foundUser.lang,
    });

    fireMetaPurchaseEvent({
      amount: dataStripe.amount_total ?? 0,
      currency: dataStripe.currency,
      email: foundUser.email,
      eventSourceUrl: `${links.baseUrl}${getRoute({ route: E_Routes.accountListings })}`,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      listingId: foundListingPayment.listingId,
      request,
      userId: foundUser.id,
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

async function checkoutPaymentIntentPaid(
  dataStripe: Stripe.PaymentIntent,
  request: Request,
) {
  try {
    const userId = dataStripe?.metadata?.userId;
    const companyId = dataStripe?.metadata?.companyId;
    const paymentIntentId = dataStripe.id;

    if (!companyId && !userId) {
      return new Response("No userId or companyId", {
        status: 422,
      });
    }

    if (!paymentIntentId) {
      return new Response("No checkout id", {
        status: 422,
      });
    }

    const foundListingPayment = await database.listingPayment.findFirst({
      select: {
        id: true,
        listing: {
          select: {
            expiresAt: true,
          },
        },
        listingId: true,
        monthsToAdd: true,
      },
      where: {
        listing: {
          ...(companyId
            ? {
                companyId: companyId,
              }
            : {
                userId: userId,
              }),
        },
        stripePaymentIntentId: paymentIntentId,
      },
    });

    if (!foundListingPayment?.listing) {
      return new Response("Not found listing payment", {
        status: 422,
      });
    }

    const foundCompany = companyId
      ? await database.company.findUnique({
          select: {
            invoiceData: {
              select: {
                city: true,
                companyName: true,
                country: true,
                flatNumber: true,
                postalCode: true,
                streetName: true,
                streetNumber: true,
                taxCountry: true,
                taxNumber: true,
              },
            },
          },
          where: {
            id: companyId,
          },
        })
      : null;

    if (companyId && !foundCompany) {
      return new Response("No found company", {
        status: 400,
      });
    }

    const foundUser = await database.user.findFirst({
      select: {
        email: true,
        firstName: true,
        id: true,
        lang: true,
        lastName: true,
        role: true,
      },
      where: {
        ...(companyId
          ? {
              companyId: companyId,
              role: E_RolesServer.B2B_OWNER,
            }
          : {
              id: userId,
            }),
      },
    });

    if (!foundUser) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    const isListingCurrentlyActive = foundListingPayment?.listing?.expiresAt
      ? dayjs(foundListingPayment.listing.expiresAt).isAfter(dayjs())
      : false;

    const validOldDate = isListingCurrentlyActive
      ? dayjs(foundListingPayment?.listing?.expiresAt)
      : dayjs();

    const newDateExpiresAt = validOldDate
      .add(foundListingPayment?.monthsToAdd ?? 0, "month")
      .toDate();

    await database.listingPayment.update({
      data: {
        expiresAtAfterAdd: newDateExpiresAt,
        expiresAtBeforeAdd: foundListingPayment?.listing?.expiresAt,
        status: E_ListingPaymentStatusServer.PAID,
        stripeCheckoutUrl: null,
      },
      where: {
        id: foundListingPayment.id,
      },
    });

    await database.listing.update({
      data: {
        expiresAt: newDateExpiresAt,
        status: E_ListingStatusServer.ACTIVE,
      },
      where: {
        id: foundListingPayment.listingId,
      },
    });

    console.warn(`💰 payment_intent.succeeded: ${dataStripe.status}`);

    const newInvoice = await database.invoice.create({
      data: {
        ...(companyId
          ? {
              companyId: companyId,
            }
          : {
              userId: userId,
            }),
        listingPayments: {
          connect: {
            id: foundListingPayment.id,
          },
        },
        stripePaymentIntentId: paymentIntentId,
      },
      select: {
        id: true,
      },
    });

    const t: TFunction<"invoice", undefined> = await i18next.getFixedT(
      foundUser.lang.toLowerCase(),
      namespaces.invoice,
    );

    const invoice = await createInvoice({
      buyer_email: foundUser.email,
      buyer_name: companyId
        ? (foundCompany?.invoiceData?.companyName.toUpperCase() ?? "")
        : `${foundUser.firstName} ${foundUser.lastName}`,
      buyer_tax_no: companyId
        ? `${Number(foundCompany?.invoiceData?.taxNumber)}`
        : null,
      // buyer_tax_no: `${foundCompany.invoiceData.taxCountry}${Number(foundCompany.invoiceData.taxNumber)}`,
      positions: [
        {
          discount: undefined,
          name: t("listing"),
          quantity: 1,
          tax: 23,
          total_price_gross: formatAmountOnlyNumber(dataStripe.amount),
        },
      ],
    });

    const countFoundFakturowniaInvoiceId = await database.invoice.count({
      where: {
        fakturowniaInvoiceId: invoice.id.toString(),
      },
    });

    if (countFoundFakturowniaInvoiceId > 0) {
      return new Response("Found fakturownia invoice id", {
        status: 400,
      });
    }

    await database.invoice.update({
      data: {
        fakturowniaInvoiceId: invoice.id.toString(),
      },
      where: {
        id: newInvoice.id,
      },
    });

    const invoiceBuffer = await getInvoice({
      invoiceId: invoice.id.toString(),
    });

    await sendInvoice({
      pdfBuffer: invoiceBuffer,
      request,
      toEmail: foundUser.email,
      userLanguage: foundUser.lang,
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

async function checkoutPaymentFailed(
  dataStripe: Stripe.Checkout.Session,
  request: Request,
) {
  try {
    console.warn(`❗checkout.session.async_payment_failed`);
    const userId = dataStripe?.metadata?.userId;
    const companyId = dataStripe?.metadata?.companyId;
    const checkoutId = dataStripe.id;

    if ((!companyId && !userId) || !checkoutId) {
      return new Response("No found companyId / userId or checkoutId", {
        status: 400,
      });
    }

    const foundOwner = await database.user.findFirst({
      select: {
        email: true,
        lang: true,
      },
      where: {
        ...(companyId
          ? {
              companyId: companyId,
              role: E_RolesServer.B2B_OWNER,
            }
          : {
              id: userId,
            }),
      },
    });

    if (!foundOwner) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    await sendCheckoutListingPaymentFailed({
      request,
      toEmail: foundOwner.email,
      userLanguage: foundOwner.lang,
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

async function paymentIntentPaymentFailed(
  dataStripe: Stripe.PaymentIntent,
  request: Request,
) {
  try {
    console.warn(`❗payment_intent.payment_failed`);
    const userId = dataStripe?.metadata?.userId;
    const companyId = dataStripe?.metadata?.companyId;
    const paymentIntentId = dataStripe.id;

    if ((!companyId && !userId) || !paymentIntentId) {
      return new Response("No found companyId / userId or paymentIntentId", {
        status: 400,
      });
    }

    const foundOwner = await database.user.findFirst({
      select: {
        email: true,
        lang: true,
      },
      where: {
        ...(companyId
          ? {
              companyId: companyId,
              role: E_RolesServer.B2B_OWNER,
            }
          : {
              id: userId,
            }),
      },
    });

    if (!foundOwner) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    await sendCheckoutListingPaymentFailed({
      request,
      toEmail: foundOwner.email,
      userLanguage: foundOwner.lang,
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

async function checkoutPaymentExpired(
  dataStripe: Stripe.Checkout.Session,
  request: Request,
) {
  try {
    console.warn(`⚠️ checkout.session.expired`);
    const userId = dataStripe?.metadata?.userId;
    const companyId = dataStripe?.metadata?.companyId;
    const checkoutId = dataStripe.id;

    if ((!companyId && !userId) || !checkoutId) {
      return new Response("No found companyId / userId or checkoutId", {
        status: 400,
      });
    }

    const foundOwner = await database.user.findFirst({
      select: {
        email: true,
        lang: true,
      },
      where: {
        ...(companyId
          ? {
              companyId: companyId,
              role: E_RolesServer.B2B_OWNER,
            }
          : {
              id: userId,
            }),
      },
    });

    if (!foundOwner) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    await database.listingPayment.updateMany({
      data: {
        status: E_ListingPaymentStatusServer.EXPIRED,
        stripeCheckoutUrl: null,
      },
      where: {
        stripeCheckoutId: checkoutId,
        ...(companyId
          ? {
              companyId: companyId,
            }
          : {
              userId: userId,
            }),
      },
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}

async function paymentIntentCanceled(
  dataStripe: Stripe.PaymentIntent,
  request: Request,
) {
  try {
    console.warn(`⚠️ payment_intent.canceled`);
    const userId = dataStripe?.metadata?.userId;
    const companyId = dataStripe?.metadata?.companyId;
    const paymentIntentId = dataStripe.id;

    if ((!companyId && !userId) || !paymentIntentId) {
      return new Response("No found companyId / userId or paymentIntentId", {
        status: 400,
      });
    }

    const foundOwner = await database.user.findFirst({
      select: {
        email: true,
        lang: true,
      },
      where: {
        ...(companyId
          ? {
              companyId: companyId,
              role: E_RolesServer.B2B_OWNER,
            }
          : {
              id: userId,
            }),
      },
    });

    if (!foundOwner) {
      return new Response("Not found owner", {
        status: 400,
      });
    }

    await database.listingPayment.updateMany({
      data: {
        status: E_ListingPaymentStatusServer.EXPIRED,
        stripeCheckoutUrl: null,
      },
      where: {
        stripePaymentIntentId: paymentIntentId,
        ...(companyId
          ? {
              companyId: companyId,
            }
          : {
              userId: userId,
            }),
      },
    });

    return await responseOnSuccess({
      data: {
        received: true,
      },
      request,
      status: 200,
    });
  } catch {
    return new Response("Something went wrong", {
      status: 400,
    });
  }
}
