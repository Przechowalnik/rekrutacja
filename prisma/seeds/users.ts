import bcryptjs from "bcryptjs";
import dayjs from "dayjs";

import { Prisma, PrismaClient } from "../../generated/prisma/client";

const seedDate = dayjs().toDate();

const userData: (Omit<Prisma.UserCreateInput, "password"> & {
  rawPassword: string;
})[] = [
  {
    authenticatorEmailOTP: {
      create: {
        code: null,
        createdAt: seedDate,
        enabledAt: seedDate,
        expiresAt: seedDate,
      },
    },
    consent: {
      create: {
        newsletterAt: seedDate,
        opinionAt: seedDate,
        regulationAt: seedDate,
      },
    },
    createdAt: seedDate,
    email: "przechowalnik.pl@gmail.com",
    emailVerification: {
      create: {
        createdAt: seedDate,
        verifiedAt: seedDate,
      },
    },
    firstName: "Admin",
    lang: "PL",
    lastName: "Admin",
    phone: {
      create: {
        countryCode: 48,
        createdAt: seedDate,
        number: 515_873_009,
        verifiedAt: seedDate,
      },
    },
    points: {
      create: {
        balance: 0,
      },
    },
    rawPassword: "Algorytm123!",
    role: "ADMIN",
    sessionVersion: 1,
  },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const { rawPassword, ...u } of userData) {
    const password = await bcryptjs.hash(rawPassword, 15);
    await prisma.user.create({ data: { ...u, password } });
  }
}
