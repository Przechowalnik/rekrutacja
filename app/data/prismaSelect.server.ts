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
  availableFrom: true,
  category: true,
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
      workers: {
        select: {
          email: true,
        },
        take: 1,
        where: {
          role: "B2B_OWNER",
        },
      },
    },
  },
  createdAt: true,
  description: true,
  expiresAt: true,
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
  salaryFrom: true,
  salaryTo: true,
  showEmail: true,
  showPhone: true,
  slug: true,
  status: true,
  title: true,
  updatedAt: true,
  user: {
    select: {
      avatar: true,
      email: true,
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
  workMode: true,
} as const;

const prismaSelectListingOwnerNested = {
  availableFrom: true,
  category: true,
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
  createdAt: true,
  description: true,
  expiresAt: true,
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
  salaryFrom: true,
  salaryTo: true,
  showEmail: true,
  showPhone: true,
  slug: true,
  status: true,
  title: true,
  updatedAt: true,
  user: {
    select: {
      avatar: true,
      email: true,
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
  workMode: true,
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
  category: true,
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
  salaryFrom: true,
  salaryTo: true,
  slug: true,
  title: true,
  workMode: true,
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
  loginPasswordAt: true,
  twoFactorAuthenticationEnabledAt: true,
} as const;

const prismaSelectCompanyPhone = {
  countryCode: true,
  countryCodeToConfirm: true,
  number: true,
  numberToConfirm: true,
  verifiedAt: true,
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
      id: true,
      name: true,
      phone: {
        select: prismaSelectCompanyPhone,
      },
      settings: {
        select: prismaSelectCompanySettings,
      },
      slug: true,
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
  role: true,
  sessionVersion: true,
  workerSettings: {
    select: {
      id: true,
      permissions: true,
    },
  },
} as const;
