-- CreateEnum
CREATE TYPE "ListingAccess" AS ENUM ('ACCESS_24H', 'LIMITED_HOURS', 'ON_REQUEST_ACCESS');

-- CreateEnum
CREATE TYPE "ListingSecurityOption" AS ENUM ('MONITORING', 'SECURITY', 'ELECTRONIC_LOCK', 'MANUAL_GATE', 'AUTOMATIC_GATE', 'PADLOCK', 'ALARM', 'DOOR_LOCK', 'BARRIER', 'REMOTE_CONTROL');

-- CreateEnum
CREATE TYPE "ListingCondition" AS ENUM ('NEEDS_RENOVATION', 'PARTIALLY_FINISHED', 'FINISHED', 'NEW', 'RAW');

-- CreateEnum
CREATE TYPE "ListingUtilityOption" AS ENUM ('ELECTRICITY', 'SEWAGE', 'WATER');

-- CreateEnum
CREATE TYPE "ListingComfortOption" AS ENUM ('HEATED', 'LIGHTING', 'PARKING', 'VENTILATION');

-- CreateEnum
CREATE TYPE "ListingEntryOption" AS ENUM ('ELEVATOR', 'STAIRCASE', 'STREET_ENTRANCE');

-- CreateEnum
CREATE TYPE "ListingUsageOptions" AS ENUM ('CAR_ACCESS', 'TIR_ACCESS');

-- CreateEnum
CREATE TYPE "ListingPlotType" AS ENUM ('PARKING', 'STORAGE', 'SERVICE', 'AGRICULTURAL');

-- CreateEnum
CREATE TYPE "ListingUnitType" AS ENUM ('WAREHOUSE', 'RETAIL', 'SERVICE', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "ListingParkingType" AS ENUM ('DETACHED', 'UNDERGROUND', 'MULTILEVEL_LIFT', 'GROUND_PLACE');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('SALE', 'RENT');

-- CreateEnum
CREATE TYPE "ListingContractType" AS ENUM ('SHORT_TERM', 'LONG_TERM');

-- CreateEnum
CREATE TYPE "ListingPaymentStatus" AS ENUM ('PAID', 'REJECTED', 'EXPIRED', 'UNPAID', 'FREE', 'PENDING');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ARCHIVED', 'REJECTED', 'EXPIRED', 'DELETED', 'UNPAID');

-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('PARKING', 'STORAGE_UNIT', 'ATTIC', 'BASEMENT', 'WAREHOUSE', 'ROOM', 'PLOT', 'UNIT', 'CONTAINER');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PENDING', 'CANCELLED', 'TRIALING', 'UNPAID', 'TO_BE_CANCELLED');

-- CreateEnum
CREATE TYPE "PlanType" AS ENUM ('TRIAL', 'BASIC', 'STANDARD', 'PREMIUM', 'ULTIMATE');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('B2B_WORKER', 'B2B_OWNER', 'USER', 'ADMIN');

-- CreateEnum
CREATE TYPE "CompanyWorkerPermission" AS ENUM ('MANAGE_WORKERS', 'MANAGE_LISTINGS');

-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('PL', 'EN');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('POLAND');

-- CreateEnum
CREATE TYPE "TaxCountry" AS ENUM ('PL');

-- CreateEnum
CREATE TYPE "PlanInterval" AS ENUM ('DAY', 'WEEK', 'MONTH', 'YEAR');

-- CreateEnum
CREATE TYPE "BugPriority" AS ENUM ('SMALL', 'MEDIUM', 'BIG');

-- CreateEnum
CREATE TYPE "BugEnvironment" AS ENUM ('DESKTOP_CHROME', 'DESKTOP_FIREFOX', 'DESKTOP_EDGE', 'DESKTOP_OTHER', 'PHONE_ANDROID', 'PHONE_IOS', 'PHONE_OTHER');

-- CreateEnum
CREATE TYPE "BugStatus" AS ENUM ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE');

-- CreateEnum
CREATE TYPE "Cities" AS ENUM ('WARSAW', 'CRACOW', 'GDANSK', 'GDYNIA', 'SOPOT', 'WROCLAW', 'LODZ', 'POZNAN', 'SZCZECIN', 'BYDGOSZCZ');

-- CreateTable
CREATE TABLE "Authenticator2FA" (
    "id" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "tempSecret" TEXT,
    "secret" TEXT,
    "backupCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Authenticator2FA_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthenticatorEmailOTP" (
    "id" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthenticatorEmailOTP_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "code" TEXT,
    "oldEmail" TEXT,
    "oldEmailBackupCode" TEXT,
    "oldEmailBackupCodeExpiresAt" TIMESTAMP(3),
    "newEmailToVerified" TEXT,
    "newEmailToVerifiedCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVerification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountRecovery" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AccountRecovery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Consent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "newsletterAt" TIMESTAMP(3),
    "marketingAt" TIMESTAMP(3),
    "opinionAt" TIMESTAMP(3),
    "shareAt" TIMESTAMP(3),
    "regulationAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Consent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPhone" (
    "id" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "number" BIGINT,
    "countryCode" INTEGER,
    "code" TEXT,
    "numberToConfirm" BIGINT,
    "countryCodeToConfirm" INTEGER,
    "codeExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserNotifications" (
    "id" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "userId" TEXT NOT NULL,
    "pwa" TEXT,
    "native" TEXT,

    CONSTRAINT "UserNotifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSocials" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "googleId" TEXT,
    "googleAccessToken" TEXT,
    "googleAccessTokenExpiresAt" TIMESTAMP(3),
    "facebookId" TEXT,
    "facebookAccessToken" TEXT,
    "facebookAccessTokenExpiresAt" TIMESTAMP(3),

    CONSTRAINT "UserSocials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Referral" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "code" TEXT NOT NULL,
    "countCompanies" INTEGER NOT NULL DEFAULT 0,
    "countUsers" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "blockedAt" TIMESTAMP(3),
    "avatar" TEXT,
    "lang" "Languages" NOT NULL DEFAULT 'PL',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdFromReferralCode" TEXT,
    "stripeCustomerId" TEXT,
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "loginIps" TEXT[],

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyWorkerSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "permissions" "CompanyWorkerPermission"[],

    CONSTRAINT "CompanyWorkerSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyRegistry" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "country" "TaxCountry" NOT NULL DEFAULT 'PL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyRegistry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyInvoiceData" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "taxNumber" TEXT NOT NULL,
    "taxCountry" "TaxCountry" NOT NULL DEFAULT 'PL',
    "country" "Country" NOT NULL DEFAULT 'POLAND',
    "postalCode" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "streetName" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "flatNumber" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyInvoiceData_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyPhone" (
    "id" TEXT NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "companyId" TEXT NOT NULL,
    "number" BIGINT,
    "countryCode" INTEGER,
    "code" TEXT,
    "numberToConfirm" BIGINT,
    "countryCodeToConfirm" INTEGER,
    "codeExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyPhone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyFreeTrial" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "planId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyFreeTrial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PointsHistory" (
    "id" TEXT NOT NULL,
    "pointsId" TEXT NOT NULL,
    "balanceAfterOperation" INTEGER NOT NULL,
    "balanceBeforeOperation" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PointsHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Points" (
    "id" TEXT NOT NULL,
    "companyId" TEXT,
    "userId" TEXT,
    "balance" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyStripe" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "accountId" TEXT,
    "accountOnboardingActiveAt" TIMESTAMP(3),
    "customerId" TEXT,
    "customerCardId" TEXT,
    "costumerCardLast4Numbers" TEXT,

    CONSTRAINT "CompanyStripe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "loginGoogleAt" TIMESTAMP(3),
    "loginFacebookAt" TIMESTAMP(3),
    "loginPasswordAt" TIMESTAMP(3),
    "twoFactorAuthenticationEnabledAt" TIMESTAMP(3),

    CONSTRAINT "CompanySettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "idnumber" SERIAL NOT NULL,
    "slug" TEXT,
    "name" TEXT NOT NULL,
    "urlInstagram" TEXT,
    "urlFacebook" TEXT,
    "urlTiktok" TEXT,
    "blockedAt" TIMESTAMP(3),
    "avatar" TEXT,
    "bannerHero" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdFromReferralCode" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Geolocation" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Geolocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL,
    "isDeletedAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "price_1" BIGINT NOT NULL,
    "price_2_5" BIGINT NOT NULL,
    "price_6_plus" BIGINT NOT NULL,
    "points_1" BIGINT NOT NULL,
    "points_2_5" BIGINT NOT NULL,
    "points_6_plus" BIGINT NOT NULL,
    "stripeProductId" TEXT,
    "stripeSessionCheckoutId" TEXT,
    "stripeSessionCheckoutUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "type" "PlanType" NOT NULL,
    "isDeletedAt" TIMESTAMP(3),
    "price" BIGINT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "stripePlanId" TEXT,
    "stripeProductId" TEXT,
    "interval" "PlanInterval",
    "intervalCount" INTEGER,
    "maximumListingsInMonth" INTEGER NOT NULL,
    "listingDurationMonths" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" TEXT NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "name" TEXT NOT NULL,
    "percentOff" INTEGER,
    "amountOff" BIGINT,
    "minimumAmount" BIGINT,
    "endDate" TIMESTAMP(3) NOT NULL,
    "promotionCode" TEXT NOT NULL,
    "stripeCouponId" TEXT NOT NULL,
    "stripePromotionCodeId" TEXT NOT NULL,
    "durationInMonths" INTEGER NOT NULL DEFAULT 1,
    "maxRedemptions" BIGINT,
    "firstTimeTransaction" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Exchange" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subscriptionFreeDays" INTEGER,
    "points" INTEGER NOT NULL,
    "enabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Exchange_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutId" TEXT,
    "fakturowniaInvoiceId" TEXT,
    "subscriptionId" TEXT,
    "companyId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "stripeSubscriptionId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "status" "SubscriptionStatus" NOT NULL,
    "companyId" TEXT,
    "planId" TEXT NOT NULL,
    "couponId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "nextPaymentAttempt" TIMESTAMP(3),
    "endDateExchangeFreeDays" TIMESTAMP(3),
    "extraFreeDaysInCurrentPeriod" INTEGER DEFAULT 0,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformSetting" (
    "id" TEXT NOT NULL,
    "pointsReferralCompany" INTEGER NOT NULL,
    "pointsReferralUser" INTEGER NOT NULL,
    "pointsSmallBug" INTEGER NOT NULL,
    "pointsMediumBug" INTEGER NOT NULL,
    "pointsBigBug" INTEGER NOT NULL,
    "planIdFreeTrialCompany" TEXT NOT NULL,
    "freeTrialCompanyMonthsCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlatformSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bug" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyId" TEXT,
    "images" TEXT[],
    "video" TEXT,
    "status" "BugStatus" NOT NULL,
    "description" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "environment" "BugEnvironment" NOT NULL,
    "actionsBeforeError" TEXT NOT NULL,
    "errorMessage" TEXT,
    "expectedBehavior" TEXT,
    "isReproducible" BOOLEAN NOT NULL,
    "priority" "BugPriority",
    "answer" TEXT,
    "pointsPaidAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingLocation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "country" "Country" NOT NULL DEFAULT 'POLAND',
    "postalCode" TEXT NOT NULL,
    "city" "Cities" NOT NULL,
    "streetName" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "flatNumber" TEXT,
    "district" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ListingLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPayment" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" "ListingPaymentStatus" NOT NULL,
    "free" BOOLEAN NOT NULL,
    "monthsToAdd" INTEGER,
    "points" BIGINT,
    "amount" BIGINT,
    "stripePaymentIntentId" TEXT,
    "stripeCheckoutId" TEXT,
    "stripeCheckoutUrl" TEXT,
    "expiresAtBeforeAdd" TIMESTAMP(3),
    "expiresAtAfterAdd" TIMESTAMP(3),
    "invoiceId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "images" TEXT[],
    "contractType" "ListingContractType",
    "type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL,
    "category" "ListingCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" BIGINT NOT NULL,
    "area" DOUBLE PRECISION,
    "negotiable" BOOLEAN NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "floorLevel" INTEGER,
    "parkingType" "ListingParkingType",
    "minimumRentalDays" INTEGER,
    "access" "ListingAccess" NOT NULL,
    "securityOptions" "ListingSecurityOption"[],
    "comfortOptions" "ListingComfortOption"[],
    "entryOptions" "ListingEntryOption"[],
    "usageOptions" "ListingUsageOptions"[],
    "expiresAt" TIMESTAMP(3),
    "availableFrom" TIMESTAMP(3) NOT NULL,
    "availableTo" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "utilityOptions" "ListingUtilityOption"[],
    "condition" "ListingCondition" NOT NULL,
    "plotType" "ListingPlotType",
    "unitType" "ListingUnitType",

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CouponToPlan" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CouponToPlan_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Authenticator2FA_userId_key" ON "Authenticator2FA"("userId");

-- CreateIndex
CREATE INDEX "Authenticator2FA_userId_idx" ON "Authenticator2FA"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AuthenticatorEmailOTP_userId_key" ON "AuthenticatorEmailOTP"("userId");

-- CreateIndex
CREATE INDEX "AuthenticatorEmailOTP_userId_idx" ON "AuthenticatorEmailOTP"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_userId_key" ON "EmailVerification"("userId");

-- CreateIndex
CREATE INDEX "EmailVerification_userId_idx" ON "EmailVerification"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AccountRecovery_userId_key" ON "AccountRecovery"("userId");

-- CreateIndex
CREATE INDEX "AccountRecovery_userId_idx" ON "AccountRecovery"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Consent_userId_key" ON "Consent"("userId");

-- CreateIndex
CREATE INDEX "Consent_userId_idx" ON "Consent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPhone_userId_key" ON "UserPhone"("userId");

-- CreateIndex
CREATE INDEX "UserPhone_userId_idx" ON "UserPhone"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserNotifications_userId_key" ON "UserNotifications"("userId");

-- CreateIndex
CREATE INDEX "UserNotifications_userId_idx" ON "UserNotifications"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "UserSocials_userId_key" ON "UserSocials"("userId");

-- CreateIndex
CREATE INDEX "UserSocials_userId_idx" ON "UserSocials"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_userId_key" ON "Referral"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_companyId_key" ON "Referral"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Referral_code_key" ON "Referral"("code");

-- CreateIndex
CREATE INDEX "Referral_userId_idx" ON "Referral"("userId");

-- CreateIndex
CREATE INDEX "Referral_companyId_idx" ON "Referral"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_role_blockedAt_companyId_idx" ON "User"("id", "role", "blockedAt", "companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyWorkerSettings_userId_key" ON "CompanyWorkerSettings"("userId");

-- CreateIndex
CREATE INDEX "CompanyWorkerSettings_companyId_idx" ON "CompanyWorkerSettings"("companyId");

-- CreateIndex
CREATE INDEX "CompanyWorkerSettings_userId_idx" ON "CompanyWorkerSettings"("userId");

-- CreateIndex
CREATE INDEX "CompanyRegistry_number_country_idx" ON "CompanyRegistry"("number", "country");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyInvoiceData_companyId_key" ON "CompanyInvoiceData"("companyId");

-- CreateIndex
CREATE INDEX "CompanyInvoiceData_companyId_idx" ON "CompanyInvoiceData"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPhone_companyId_key" ON "CompanyPhone"("companyId");

-- CreateIndex
CREATE INDEX "CompanyPhone_companyId_idx" ON "CompanyPhone"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyFreeTrial_companyId_key" ON "CompanyFreeTrial"("companyId");

-- CreateIndex
CREATE INDEX "CompanyFreeTrial_companyId_idx" ON "CompanyFreeTrial"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Points_companyId_key" ON "Points"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Points_userId_key" ON "Points"("userId");

-- CreateIndex
CREATE INDEX "Points_userId_idx" ON "Points"("userId");

-- CreateIndex
CREATE INDEX "Points_companyId_idx" ON "Points"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyStripe_companyId_key" ON "CompanyStripe"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyStripe_accountId_key" ON "CompanyStripe"("accountId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyStripe_customerId_key" ON "CompanyStripe"("customerId");

-- CreateIndex
CREATE INDEX "CompanyStripe_companyId_idx" ON "CompanyStripe"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "CompanySettings_companyId_key" ON "CompanySettings"("companyId");

-- CreateIndex
CREATE INDEX "CompanySettings_companyId_idx" ON "CompanySettings"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Company_idnumber_key" ON "Company"("idnumber");

-- CreateIndex
CREATE UNIQUE INDEX "Company_name_key" ON "Company"("name");

-- CreateIndex
CREATE INDEX "Company_id_slug_idx" ON "Company"("id", "slug");

-- CreateIndex
CREATE INDEX "Company_slug_idx" ON "Company"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Geolocation_address_key" ON "Geolocation"("address");

-- CreateIndex
CREATE INDEX "Geolocation_lat_lng_idx" ON "Geolocation"("lat", "lng");

-- CreateIndex
CREATE UNIQUE INDEX "Product_stripeProductId_key" ON "Product"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripePlanId_key" ON "Plan"("stripePlanId");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_stripeProductId_key" ON "Plan"("stripeProductId");

-- CreateIndex
CREATE UNIQUE INDEX "Coupon_promotionCode_key" ON "Coupon"("promotionCode");

-- CreateIndex
CREATE INDEX "Coupon_endDate_idx" ON "Coupon"("endDate");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripePaymentIntentId_key" ON "Invoice"("stripePaymentIntentId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_stripeCheckoutId_key" ON "Invoice"("stripeCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_fakturowniaInvoiceId_key" ON "Invoice"("fakturowniaInvoiceId");

-- CreateIndex
CREATE INDEX "Invoice_companyId_idx" ON "Invoice"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- CreateIndex
CREATE INDEX "Subscription_companyId_status_idx" ON "Subscription"("companyId", "status");

-- CreateIndex
CREATE INDEX "Subscription_companyId_startDate_endDate_status_idx" ON "Subscription"("companyId", "startDate", "endDate", "status");

-- CreateIndex
CREATE INDEX "Bug_userId_idx" ON "Bug"("userId");

-- CreateIndex
CREATE INDEX "Bug_companyId_idx" ON "Bug"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "ListingLocation_listingId_key" ON "ListingLocation"("listingId");

-- CreateIndex
CREATE INDEX "ListingLocation_listingId_idx" ON "ListingLocation"("listingId");

-- CreateIndex
CREATE INDEX "ListingPayment_listingId_idx" ON "ListingPayment"("listingId");

-- CreateIndex
CREATE INDEX "ListingPayment_listingId_status_idx" ON "ListingPayment"("listingId", "status");

-- CreateIndex
CREATE INDEX "Listing_userId_idx" ON "Listing"("userId");

-- CreateIndex
CREATE INDEX "Listing_companyId_idx" ON "Listing"("companyId");

-- CreateIndex
CREATE INDEX "Listing_userId_status_idx" ON "Listing"("userId", "status");

-- CreateIndex
CREATE INDEX "Listing_companyId_status_idx" ON "Listing"("companyId", "status");

-- CreateIndex
CREATE INDEX "_CouponToPlan_B_index" ON "_CouponToPlan"("B");

-- AddForeignKey
ALTER TABLE "Authenticator2FA" ADD CONSTRAINT "Authenticator2FA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuthenticatorEmailOTP" ADD CONSTRAINT "AuthenticatorEmailOTP_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerification" ADD CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountRecovery" ADD CONSTRAINT "AccountRecovery_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Consent" ADD CONSTRAINT "Consent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPhone" ADD CONSTRAINT "UserPhone_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotifications" ADD CONSTRAINT "UserNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSocials" ADD CONSTRAINT "UserSocials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyWorkerSettings" ADD CONSTRAINT "CompanyWorkerSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyWorkerSettings" ADD CONSTRAINT "CompanyWorkerSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyInvoiceData" ADD CONSTRAINT "CompanyInvoiceData_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPhone" ADD CONSTRAINT "CompanyPhone_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFreeTrial" ADD CONSTRAINT "CompanyFreeTrial_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyFreeTrial" ADD CONSTRAINT "CompanyFreeTrial_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PointsHistory" ADD CONSTRAINT "PointsHistory_pointsId_fkey" FOREIGN KEY ("pointsId") REFERENCES "Points"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Points" ADD CONSTRAINT "Points_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyStripe" ADD CONSTRAINT "CompanyStripe_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySettings" ADD CONSTRAINT "CompanySettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "Subscription"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformSetting" ADD CONSTRAINT "PlatformSetting_planIdFreeTrialCompany_fkey" FOREIGN KEY ("planIdFreeTrialCompany") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPayment" ADD CONSTRAINT "ListingPayment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPayment" ADD CONSTRAINT "ListingPayment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponToPlan" ADD CONSTRAINT "_CouponToPlan_A_fkey" FOREIGN KEY ("A") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CouponToPlan" ADD CONSTRAINT "_CouponToPlan_B_fkey" FOREIGN KEY ("B") REFERENCES "Plan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
