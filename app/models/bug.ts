import { z } from "zod";

import { Z_BugNested } from "./bugNested";

export const Z_Bug = Z_BugNested.merge(z.object({}));

export type T_Bug = z.infer<typeof Z_Bug>;
