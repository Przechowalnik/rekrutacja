import { z } from "zod";

import { Z_PlanNested } from "./planNested";

export const Z_Plans = Z_PlanNested.merge(z.object({})).array();

export type T_Plans = z.infer<typeof Z_Plans>;
