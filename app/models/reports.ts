import { z } from "zod";

import { Z_ReportNested } from "./reportNested";

export const Z_Reports = Z_ReportNested.merge(z.object({})).array();

export type T_Reports = z.infer<typeof Z_Reports>;
