import { E_ListingStatus } from "~/models/enums";

import { database } from "./database.server";
import { cleanOldDraftFiles } from "./images.server";

export const updateCron = async () => {
  try {
    const { count } = await database.listing.updateMany({
      data: {
        status: E_ListingStatus.EXPIRED,
      },
      where: {
        expiresAt: {
          lte: new Date(),
        },
        status: E_ListingStatus.ACTIVE,
      },
    });

    console.warn(`Cron updated: ${count} listings`);

    const cleanupReport = await cleanOldDraftFiles();
    console.warn(
      `Cron draft files cleanup: ${cleanupReport.deletedCount} files deleted, ${cleanupReport.errors.length} errors`,
    );

    return {
      cleanupReport,
      count,
      success: true,
    };
  } catch (error) {
    return {
      error,
      success: false,
    };
  }
};
