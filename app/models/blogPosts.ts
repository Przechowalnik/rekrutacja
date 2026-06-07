import { z } from "zod";

import { Z_BlogPostNested } from "./blogPostNested";

export const Z_BlogPosts = Z_BlogPostNested.merge(z.object({})).array();

export type T_BlogPosts = z.infer<typeof Z_BlogPosts>;
