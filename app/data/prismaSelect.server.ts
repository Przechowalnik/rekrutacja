import { E_SubscriptionStatusServer } from "./models.server";

export const prismaSelectProductNested = {
  id: true,
  name: true,
  points_1: true,
  points_2_5: true,
  points_6_plus: true,
  price_1: true,
  price_2_5: true,
  price_6_plus: true,
} as const;

export const prismaSelectProduct = {
  ...prismaSelectProductNested,
} as const;

export const prismaSelectProducts = {
  ...prismaSelectProductNested,
} as const;

export const prismaSelectPlanNested = {
  description: true,
  enabledAt: true,
  id: true,
  interval: true,
  intervalCount: true,
  listingDurationMonths: true,
  maximumListingsInMonth: true,
  name: true,
  price: true,
  type: true,
} as const;

export const prismaSelectExchange = {
  enabledAt: true,
  id: true,
  name: true,
  points: true,
  subscriptionFreeDays: true,
} as const;

export const prismaSelectCompanyFreeTrial = {
  endDate: true,
  id: true,
  plan: {
    select: prismaSelectPlanNested,
  },
  startDate: true,
} as const;

const prismaSelectCouponNested = {
  amountOff: true,
  createdAt: true,
  durationInMonths: true,
  enabledAt: true,
  endDate: true,
  firstTimeTransaction: true,
  id: true,
  maxRedemptions: true,
  minimumAmount: true,
  name: true,
  percentOff: true,
  promotionCode: true,
  updatedAt: true,
} as const;

export const prismaSelectCoupon = {
  ...prismaSelectCouponNested,
  plans: {
    select: prismaSelectPlanNested,
  },
} as const;

export const prismaSelectCoupons = {
  ...prismaSelectCouponNested,
  plans: {
    select: prismaSelectPlanNested,
  },
} as const;

export const prismaSelectPlans = {
  ...prismaSelectPlanNested,
} as const;

export const prismaSelectPlan = {
  ...prismaSelectPlanNested,
  coupons: {
    select: prismaSelectCouponNested,
  },
} as const;

export const prismaSelectSubscription = {
  coupon: {
    select: prismaSelectCoupon,
  },
  endDate: true,
  endDateExchangeFreeDays: true,
  extraFreeDaysInCurrentPeriod: true,
  id: true,
  nextPaymentAttempt: true,
  plan: {
    select: prismaSelectPlanNested,
  },
  startDate: true,
  status: true,
} as const;

export const prismaSelectPlatformSetting = {
  freeTrialCompanyMonthsCount: true,
  freeTrialMaxListings: true,
  planFreeTrialCompany: {
    select: prismaSelectPlanNested,
  },
  pointsBigBug: true,
  pointsMediumBug: true,
  pointsReferralCompany: true,
  pointsReferralUser: true,
  pointsSmallBug: true,
} as const;

export const prismaSelectBug = {
  actionsBeforeError: true,
  answer: true,
  companyId: true,
  description: true,
  environment: true,
  errorMessage: true,
  expectedBehavior: true,
  id: true,
  images: true,
  isReproducible: true,
  pointsPaidAt: true,
  priority: true,
  status: true,
  timestamp: true,
  video: true,
} as const;

export const prismaSelectReport = {
  createdAt: true,
  description: true,
  id: true,
  listing: {
    select: {
      slug: true,
    },
  },
  listingId: true,
  targetCompany: {
    select: {
      id: true,
      name: true,
      workers: {
        select: {
          email: true,
          id: true,
        },
      },
    },
  },
  targetUser: {
    select: {
      email: true,
      id: true,
    },
  },
  type: true,
  user: true,
} as const;

export const prismaSelectBlogPost = {
  content: true,
  createdAt: true,
  description: true,
  descriptionSeo: true,
  id: true,
  slug: true,
  title: true,
  titleSeo: true,
  updatedAt: true,
} as const;

const prismaSelectCompanyWorkerNested = {
  avatar: true,
  blockedAt: true,
  email: true,
  firstName: true,
  id: true,
  lastName: true,
  role: true,
} as const;

export const prismaSelectWorker = {
  ...prismaSelectCompanyWorkerNested,
  emailVerification: {
    select: {
      verifiedAt: true,
    },
  },
  workerSettings: {
    select: {
      id: true,
      permissions: true,
    },
  },
} as const;

export const prismaSelectWorkers = {
  ...prismaSelectCompanyWorkerNested,
  emailVerification: {
    select: {
      verifiedAt: true,
    },
  },
  workerSettings: {
    select: {
      id: true,
      permissions: true,
    },
  },
} as const;

const prismaSelectListingNested = {
  access: true,
  area: true,
  availableFrom: true,
  availableTo: true,
  category: true,
  comfortOptions: true,
  company: {
    select: {
      avatar: true,
      id: true,
      name: true,
      phone: {
        select: {
          countryCode: true,
          number: true,
          verifiedAt: true,
        },
      },
      slug: true,
    },
  },
  condition: true,
  containerType: true,
  contractType: true,
  createdAt: true,
  description: true,
  entryOptions: true,
  expiresAt: true,
  floorLevel: true,
  id: true,
  images: {
    orderBy: {
      isDefault: "desc",
    },
    select: {
      id: true,
      isDefault: true,
      url: true,
    },
  },
  location: {
    select: {
      city: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      cityCustom: true,
      country: true,
      district: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      flatNumber: true,
      lat: true,
      lng: true,
      nearestCity: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      postalCode: true,
      streetName: true,
      streetNumber: true,
    },
  },
  minimumRentalDays: true,
  negotiable: true,
  parkingType: true,
  plotType: true,
  price: true,
  securityOptions: true,
  slug: true,
  status: true,
  title: true,
  type: true,
  unitType: true,
  updatedAt: true,
  usageOptions: true,
  user: {
    select: {
      avatar: true,
      firstName: true,
      id: true,
      phone: {
        select: {
          countryCode: true,
          number: true,
          verifiedAt: true,
        },
      },
    },
  },
  utilityOptions: true,
} as const;

const prismaSelectListingOwnerNested = {
  access: true,
  area: true,
  availableFrom: true,
  availableTo: true,
  category: true,
  comfortOptions: true,
  company: {
    select: {
      avatar: true,
      id: true,
      name: true,
      phone: {
        select: {
          countryCode: true,
          number: true,
          verifiedAt: true,
        },
      },
      slug: true,
    },
  },
  condition: true,
  containerType: true,
  contractType: true,
  createdAt: true,
  description: true,
  entryOptions: true,
  expiresAt: true,
  floorLevel: true,
  id: true,
  images: {
    orderBy: {
      isDefault: "desc",
    },
    select: {
      id: true,
      isDefault: true,
      url: true,
    },
  },
  location: {
    select: {
      city: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      cityCustom: true,
      country: true,
      district: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      flatNumber: true,
      lat: true,
      lng: true,
      nearestCity: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      postalCode: true,
      streetName: true,
      streetNumber: true,
    },
  },
  minimumRentalDays: true,
  negotiable: true,
  parkingType: true,
  plotType: true,
  price: true,
  securityOptions: true,
  slug: true,
  status: true,
  title: true,
  type: true,
  unitType: true,
  updatedAt: true,
  usageOptions: true,
  user: {
    select: {
      avatar: true,
      firstName: true,
      id: true,
      lastName: true,
      phone: {
        select: {
          countryCode: true,
          number: true,
          verifiedAt: true,
        },
      },
    },
  },
  utilityOptions: true,
} as const;

export const prismaSelectCityNested = {
  districts: {
    select: {
      id: true,
      lat: true,
      lng: true,
      name: true,
      nameSearch: true,
    },
  },
  id: true,
  lat: true,
  lng: true,
  name: true,
  nameSearch: true,
  radiusKm: true,
  voivodeship: true,
};

export const prismaSelectCities = {
  ...prismaSelectCityNested,
};

export const prismaSelectCity = {
  ...prismaSelectCityNested,
};

export const prismaSelectListingPaymentNested = {
  createdAt: true,
  free: true,
  status: true,
  stripeCheckoutId: true,
  stripeCheckoutUrl: true,
  updatedAt: true,
};

export const prismaSelectListing = {
  ...prismaSelectListingNested,
} as const;

export const prismaSelectListingForOwner = {
  ...prismaSelectListingOwnerNested,
  payments: {
    orderBy: {
      createdAt: "desc",
    },
    select: prismaSelectListingPaymentNested,
    take: 5,
  },
} as const;

export const prismaSelectListings = {
  ...prismaSelectListingNested,
} as const;

const prismaSelectListingMapNested = {
  area: true,
  contractType: true,
  id: true,
  images: {
    orderBy: {
      isDefault: "desc",
    },
    select: {
      id: true,
      isDefault: true,
      url: true,
    },
    take: 1,
  },
  location: {
    select: {
      city: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      cityCustom: true,
      country: true,
      district: {
        select: {
          id: true,
          name: true,
          nameSearch: true,
        },
      },
      flatNumber: true,
      lat: true,
      lng: true,
      postalCode: true,
      streetName: true,
      streetNumber: true,
    },
  },
  negotiable: true,
  price: true,
  slug: true,
  title: true,
  type: true,
} as const;

export const prismaSelectListingsMap = {
  ...prismaSelectListingMapNested,
} as const;

//////////////////// USER SESSION
//////////////////// USER SESSION
//////////////////// USER SESSION
//////////////////// USER SESSION
//////////////////// USER SESSION
//////////////////// USER SESSION
//////////////////// USER SESSION
//////////////////// USER SESSION

const prismaSelectCompanySettings = {
  loginFacebookAt: true,
  loginGoogleAt: true,
  loginPasswordAt: true,
  twoFactorAuthenticationEnabledAt: true,
} as const;

export const prismaSelectCompanyInvoiceData = {
  city: true,
  companyName: true,
  country: true,
  flatNumber: true,
  postalCode: true,
  streetName: true,
  streetNumber: true,
  taxCountry: true,
  taxNumber: true,
} as const;

const prismaSelectCompanyPhone = {
  countryCode: true,
  countryCodeToConfirm: true,
  number: true,
  numberToConfirm: true,
  verifiedAt: true,
} as const;

const prismaSelectPoints = {
  balance: true,
} as const;

export const prismaSelectReferral = {
  code: true,
  countCompanies: true,
  countUsers: true,
} as const;

const prismaSelectCompanyStripe = {
  accountId: true,
  accountOnboardingActiveAt: true,
  costumerCardLast4Numbers: true,
  customerCardId: true,
  customerId: true,
} as const;

export const prismaSelectUserConsents = {
  newsletterAt: true,
  opinionAt: true,
} as const;

export const prismaSelectCompanyProfile = {
  avatar: true,
  description: true,
  urlFacebook: true,
  urlInstagram: true,
  urlTiktok: true,
} as const;

export const prismaSelectUserSession = {
  authenticator2FA: {
    select: {
      enabledAt: true,
    },
  },
  authenticatorEmailOTP: {
    select: {
      enabledAt: true,
    },
  },
  avatar: true,
  blockedAt: true,
  company: {
    select: {
      _count: {
        select: {
          workers: true,
        },
      },
      avatar: true,
      bannerHero: true,
      blockedAt: true,
      createdAt: true,
      freeTrial: {
        select: prismaSelectCompanyFreeTrial,
      },
      id: true,
      name: true,
      phone: {
        select: prismaSelectCompanyPhone,
      },
      points: {
        select: prismaSelectPoints,
      },
      settings: {
        select: prismaSelectCompanySettings,
      },
      slug: true,
      stripe: {
        select: prismaSelectCompanyStripe,
      },
      subscriptions: {
        orderBy: {
          createdAt: "asc",
        },
        select: prismaSelectSubscription,
        where: {
          status: {
            not: E_SubscriptionStatusServer.CANCELLED,
          },
        },
      },
    },
  },
  createdAt: true,
  email: true,
  emailVerification: {
    select: {
      verifiedAt: true,
    },
  },
  firstName: true,
  id: true,
  isPasswordSet: true,
  lang: true,
  lastName: true,
  phone: {
    select: {
      countryCode: true,
      countryCodeToConfirm: true,
      number: true,
      numberToConfirm: true,
      verifiedAt: true,
    },
  },
  points: {
    select: prismaSelectPoints,
  },
  role: true,
  sessionVersion: true,
  workerSettings: {
    select: {
      id: true,
      permissions: true,
    },
  },
} as const;

export const prismaSelectInvoice = {
  company: true,
  createdAt: true,
  id: true,
  subscription: {
    select: prismaSelectSubscription,
  },
} as const;
