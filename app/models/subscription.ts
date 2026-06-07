import { z } from "zod";

import { Z_SubscriptionNested } from "./subscriptionNested";

export const Z_Subscription = Z_SubscriptionNested.merge(z.object({}));

export type T_Subscription = z.infer<typeof Z_Subscription>;
