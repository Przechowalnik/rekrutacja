-- CreateEnum
CREATE TYPE "ListingInteractionType" AS ENUM ('CONTACT', 'VIEW');

-- CreateEnum
CREATE TYPE "ReportType" AS ENUM ('ILLEGAL_CONTENT', 'SCAM_FRAUD', 'MISLEADING_INFO', 'SPAM', 'OFFENSIVE_CONTENT', 'WRONG_CATEGORY', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingAccess" AS ENUM ('ACCESS_24H', 'LIMITED_HOURS');

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
CREATE TYPE "ListingPlotType" AS ENUM ('FOREST', 'SERVICE', 'AGRICULTURAL', 'BUILDING', 'INVESTMENT', 'RECREATIONAL');

-- CreateEnum
CREATE TYPE "ListingUnitType" AS ENUM ('WAREHOUSE', 'RETAIL', 'SERVICE', 'PRODUCTION', 'OFFICE', 'CONFERENCE_ROOM');

-- CreateEnum
CREATE TYPE "ListingContainerType" AS ENUM ('MARINE', 'WAREHOUSE', 'OFFICE_SOCIAL', 'SANITARY', 'REFRIGERATED', 'MODULAR_RESIDENTIAL');

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
CREATE TYPE "ListingDeleteReason" AS ENUM ('SOLD', 'RENTED', 'NO_LONGER_AVAILABLE', 'CHANGED_MIND', 'DUPLICATE', 'OTHER');

-- CreateEnum
CREATE TYPE "ListingCategory" AS ENUM ('PARKING', 'STORAGE_UNIT', 'ATTIC', 'BASEMENT', 'WAREHOUSE', 'ROOM', 'PLOT', 'UNIT', 'CONTAINER', 'BANQUET_HALL');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('B2B_WORKER', 'B2B_OWNER', 'USER', 'ADMIN', 'ADMIN_SUPER');

-- CreateEnum
CREATE TYPE "CompanyWorkerPermission" AS ENUM ('MANAGE_WORKERS', 'MANAGE_LISTINGS');

-- CreateEnum
CREATE TYPE "Languages" AS ENUM ('PL', 'EN');

-- CreateEnum
CREATE TYPE "Country" AS ENUM ('POLAND');

-- CreateEnum
CREATE TYPE "TaxCountry" AS ENUM ('PL');

-- CreateEnum
CREATE TYPE "BugPriority" AS ENUM ('SMALL', 'MEDIUM', 'BIG');

-- CreateEnum
CREATE TYPE "BugEnvironment" AS ENUM ('DESKTOP_CHROME', 'DESKTOP_FIREFOX', 'DESKTOP_EDGE', 'DESKTOP_OTHER', 'PHONE_ANDROID', 'PHONE_IOS', 'PHONE_OTHER');

-- CreateEnum
CREATE TYPE "BugStatus" AS ENUM ('REPORTED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED', 'DUPLICATE');

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
    "opinionAt" TIMESTAMP(3),
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
CREATE TABLE "UserIp" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserIp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "isPasswordSet" BOOLEAN NOT NULL DEFAULT true,
    "sessionVersion" INTEGER NOT NULL DEFAULT 1,
    "blockedAt" TIMESTAMP(3),
    "avatar" TEXT,
    "lang" "Languages" NOT NULL DEFAULT 'PL',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "companyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

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
CREATE TABLE "CompanySettings" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Bug_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "titleSeo" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionSeo" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingLocation" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "country" "Country" NOT NULL DEFAULT 'POLAND',
    "postalCode" TEXT NOT NULL,
    "cityCustom" TEXT,
    "streetName" TEXT NOT NULL,
    "streetNumber" TEXT NOT NULL,
    "flatNumber" TEXT,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "cityId" TEXT,
    "districtId" TEXT,
    "nearestCityId" TEXT,

    CONSTRAINT "ListingLocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingPayment" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "status" "ListingPaymentStatus" NOT NULL,
    "free" BOOLEAN NOT NULL,
    "monthsToAdd" INTEGER,
    "expiresAtBeforeAdd" TIMESTAMP(3),
    "expiresAtAfterAdd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingPayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingInteraction" (
    "id" TEXT NOT NULL,
    "type" "ListingInteractionType" NOT NULL,
    "listingId" TEXT,
    "userId" TEXT,
    "ownerUserId" TEXT,
    "ownerCompanyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListingInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL,

    CONSTRAINT "ListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Listing" (
    "id" TEXT NOT NULL,
    "listingIndex" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "userId" TEXT,
    "companyId" TEXT,
    "contractType" "ListingContractType",
    "type" "ListingType" NOT NULL,
    "status" "ListingStatus" NOT NULL,
    "deleteReason" "ListingDeleteReason",
    "category" "ListingCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" BIGINT NOT NULL,
    "area" DOUBLE PRECISION,
    "negotiable" BOOLEAN NOT NULL,
    "floorLevel" INTEGER,
    "parkingType" "ListingParkingType",
    "minimumRentalDays" INTEGER,
    "access" "ListingAccess",
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
    "condition" "ListingCondition",
    "plotType" "ListingPlotType",
    "unitType" "ListingUnitType",
    "containerType" "ListingContainerType",

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "type" "ReportType" NOT NULL,
    "listingId" TEXT,
    "targetUserId" TEXT,
    "targetCompanyId" TEXT,
    "targetUserEmailHash" TEXT,
    "userId" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "City" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameSearch" TEXT NOT NULL,
    "voivodeship" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "radiusKm" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "City_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "District" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "nameSearch" TEXT NOT NULL,
    "cityId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "District_pkey" PRIMARY KEY ("id")
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
CREATE INDEX "UserIp_userId_idx" ON "UserIp"("userId");

-- CreateIndex
CREATE INDEX "UserIp_expiresAt_idx" ON "UserIp"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "UserIp_userId_value_key" ON "UserIp"("userId", "value");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_id_role_blockedAt_companyId_idx" ON "User"("id", "role", "blockedAt", "companyId");

-- CreateIndex
CREATE INDEX "User_companyId_blockedAt_idx" ON "User"("companyId", "blockedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyWorkerSettings_userId_key" ON "CompanyWorkerSettings"("userId");

-- CreateIndex
CREATE INDEX "CompanyWorkerSettings_companyId_idx" ON "CompanyWorkerSettings"("companyId");

-- CreateIndex
CREATE INDEX "CompanyWorkerSettings_userId_idx" ON "CompanyWorkerSettings"("userId");

-- CreateIndex
CREATE INDEX "CompanyRegistry_number_country_idx" ON "CompanyRegistry"("number", "country");

-- CreateIndex
CREATE UNIQUE INDEX "CompanyPhone_companyId_key" ON "CompanyPhone"("companyId");

-- CreateIndex
CREATE INDEX "CompanyPhone_companyId_idx" ON "CompanyPhone"("companyId");

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
CREATE INDEX "Bug_userId_idx" ON "Bug"("userId");

-- CreateIndex
CREATE INDEX "Bug_companyId_idx" ON "Bug"("companyId");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_title_key" ON "BlogPost"("title");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_titleSeo_key" ON "BlogPost"("titleSeo");

-- CreateIndex
CREATE INDEX "BlogPost_title_idx" ON "BlogPost"("title");

-- CreateIndex
CREATE INDEX "BlogPost_titleSeo_idx" ON "BlogPost"("titleSeo");

-- CreateIndex
CREATE UNIQUE INDEX "ListingLocation_listingId_key" ON "ListingLocation"("listingId");

-- CreateIndex
CREATE INDEX "ListingLocation_lat_lng_idx" ON "ListingLocation"("lat", "lng");

-- CreateIndex
CREATE INDEX "ListingLocation_cityId_idx" ON "ListingLocation"("cityId");

-- CreateIndex
CREATE INDEX "ListingLocation_districtId_idx" ON "ListingLocation"("districtId");

-- CreateIndex
CREATE INDEX "ListingLocation_cityId_districtId_idx" ON "ListingLocation"("cityId", "districtId");

-- CreateIndex
CREATE INDEX "ListingPayment_listingId_idx" ON "ListingPayment"("listingId");

-- CreateIndex
CREATE INDEX "ListingPayment_listingId_status_idx" ON "ListingPayment"("listingId", "status");

-- CreateIndex
CREATE INDEX "ListingPayment_status_createdAt_idx" ON "ListingPayment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "ListingPayment_listingId_status_createdAt_idx" ON "ListingPayment"("listingId", "status", "createdAt");

-- CreateIndex
CREATE INDEX "ListingInteraction_listingId_idx" ON "ListingInteraction"("listingId");

-- CreateIndex
CREATE INDEX "ListingInteraction_listingId_ownerCompanyId_idx" ON "ListingInteraction"("listingId", "ownerCompanyId");

-- CreateIndex
CREATE INDEX "ListingInteraction_ownerCompanyId_type_createdAt_idx" ON "ListingInteraction"("ownerCompanyId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "ListingInteraction_ownerUserId_type_createdAt_idx" ON "ListingInteraction"("ownerUserId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "ListingInteraction_userId_type_createdAt_idx" ON "ListingInteraction"("userId", "type", "createdAt");

-- CreateIndex
CREATE INDEX "ListingInteraction_type_createdAt_idx" ON "ListingInteraction"("type", "createdAt");

-- CreateIndex
CREATE INDEX "ListingImage_listingId_isDefault_idx" ON "ListingImage"("listingId", "isDefault");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_listingIndex_key" ON "Listing"("listingIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Listing_slug_key" ON "Listing"("slug");

-- CreateIndex
CREATE INDEX "Listing_status_category_createdAt_idx" ON "Listing"("status", "category", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_status_category_expiresAt_idx" ON "Listing"("status", "category", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_status_category_availableTo_idx" ON "Listing"("status", "category", "availableTo");

-- CreateIndex
CREATE INDEX "Listing_status_category_type_createdAt_idx" ON "Listing"("status", "category", "type", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_status_category_type_expiresAt_idx" ON "Listing"("status", "category", "type", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_userId_status_expiresAt_idx" ON "Listing"("userId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_companyId_status_expiresAt_idx" ON "Listing"("companyId", "status", "expiresAt");

-- CreateIndex
CREATE INDEX "Listing_status_expiresAt_availableTo_idx" ON "Listing"("status", "expiresAt", "availableTo");

-- CreateIndex
CREATE INDEX "Listing_companyId_createdAt_idx" ON "Listing"("companyId", "createdAt");

-- CreateIndex
CREATE INDEX "Listing_userId_createdAt_idx" ON "Listing"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Report_listingId_idx" ON "Report"("listingId");

-- CreateIndex
CREATE INDEX "Report_targetUserId_idx" ON "Report"("targetUserId");

-- CreateIndex
CREATE INDEX "Report_targetCompanyId_idx" ON "Report"("targetCompanyId");

-- CreateIndex
CREATE INDEX "Report_userId_idx" ON "Report"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "City_nameSearch_key" ON "City"("nameSearch");

-- CreateIndex
CREATE INDEX "City_voivodeship_idx" ON "City"("voivodeship");

-- CreateIndex
CREATE INDEX "City_nameSearch_idx" ON "City"("nameSearch");

-- CreateIndex
CREATE INDEX "City_name_idx" ON "City"("name");

-- CreateIndex
CREATE INDEX "City_lat_lng_idx" ON "City"("lat", "lng");

-- CreateIndex
CREATE INDEX "City_lat_idx" ON "City"("lat");

-- CreateIndex
CREATE INDEX "City_lng_idx" ON "City"("lng");

-- CreateIndex
CREATE UNIQUE INDEX "City_name_voivodeship_nameSearch_key" ON "City"("name", "voivodeship", "nameSearch");

-- CreateIndex
CREATE INDEX "District_nameSearch_idx" ON "District"("nameSearch");

-- CreateIndex
CREATE INDEX "District_cityId_idx" ON "District"("cityId");

-- CreateIndex
CREATE UNIQUE INDEX "District_name_cityId_key" ON "District"("name", "cityId");

-- CreateIndex
CREATE UNIQUE INDEX "District_id_cityId_key" ON "District"("id", "cityId");

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
ALTER TABLE "UserIp" ADD CONSTRAINT "UserIp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyWorkerSettings" ADD CONSTRAINT "CompanyWorkerSettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyWorkerSettings" ADD CONSTRAINT "CompanyWorkerSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyPhone" ADD CONSTRAINT "CompanyPhone_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanySettings" ADD CONSTRAINT "CompanySettings_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bug" ADD CONSTRAINT "Bug_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlogPost" ADD CONSTRAINT "BlogPost_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_districtId_fkey" FOREIGN KEY ("districtId") REFERENCES "District"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingLocation" ADD CONSTRAINT "ListingLocation_nearestCityId_fkey" FOREIGN KEY ("nearestCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingPayment" ADD CONSTRAINT "ListingPayment_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingInteraction" ADD CONSTRAINT "ListingInteraction_ownerCompanyId_fkey" FOREIGN KEY ("ownerCompanyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetUserId_fkey" FOREIGN KEY ("targetUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_targetCompanyId_fkey" FOREIGN KEY ("targetCompanyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "District" ADD CONSTRAINT "District_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE CASCADE ON UPDATE CASCADE;
