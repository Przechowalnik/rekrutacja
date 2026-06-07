import { z } from "zod";

import { Z_BlogPostNested } from "./blogPostNested";

export const Z_BlogPost = Z_BlogPostNested.merge(z.object({}));

export type T_BlogPost = z.infer<typeof Z_BlogPost>;
