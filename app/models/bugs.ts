import { z } from "zod";

import { Z_BugNested } from "./bugNested";

export const Z_Bugs = Z_BugNested.merge(z.object({})).array();

export type T_Bugs = z.infer<typeof Z_Bugs>;
