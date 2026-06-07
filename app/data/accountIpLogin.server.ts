import dayjs from "dayjs";

import { database } from "~/data/database.server";

import { getEncryptedIp } from "./ip.server";

export async function upsertLoginIpForUser({
  request,
  userId,
}: {
  request: Request;
  userId: string;
}) {
  const encryptedIp = getEncryptedIp({ request });
  const newExpiresAt = dayjs().add(1, "year").toDate();

  await database.userIp.upsert({
    create: {
      expiresAt: newExpiresAt,
      userId,
      value: encryptedIp,
    },
    update: {
      expiresAt: newExpiresAt,
    },
    where: {
      userId_value: { userId, value: encryptedIp },
    },
  });

  return encryptedIp;
}
