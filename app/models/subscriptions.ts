import { z } from "zod";

import { Z_SubscriptionNested } from "./subscriptionNested";

export const Z_Subscriptions = Z_SubscriptionNested.merge(z.object({})).array();

export type T_Subscriptions = z.infer<typeof Z_Subscriptions>;
