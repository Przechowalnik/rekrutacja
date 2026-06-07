import { z } from "zod";

import { Z_ReportNested } from "./reportNested";

export const Z_Report = Z_ReportNested.merge(z.object({}));

export type T_Report = z.infer<typeof Z_Report>;
