import { Box, Flex } from "@mantine/core";
import { FormErrors, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { SyntheticEvent, useState } from "react";
import { useTranslation } from "react-i18next";

import { inputMaxLength } from "~/constants/input";
import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_Country } from "~/models/enums";
import { AutocompleteAddress } from "~/ui/AutocompleteAddress";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Checkbox } from "~/ui/Checkbox";
import { Fieldset } from "~/ui/Fieldset";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputCalendar } from "~/ui/InputCalendar";
import { InputPhone } from "~/ui/InputPhone";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { T_SelectImagesUploaded } from "~/ui/SelectImages";
import { SelectListingCategory } from "~/ui/SelectListingCategory";
import { SelectWorkMode } from "~/ui/SelectWorkMode";
import { TextEditor } from "~/ui/TextEditor";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

type T_ReusableListingsNewPage = {
  isCompany: boolean;
};

export const ReusableListingsNewPage = ({
  isCompany,
}: T_ReusableListingsNewPage) => {
  const [uploadImagesGroupId] = useState<string>(() => crypto.randomUUID());
  const [updatedImages] = useState<{
    removed: string[];
    uploaded: T_SelectImagesUploaded[];
  }>({
    removed: [],
    uploaded: [],
  });

  const { t } = useTranslation(
    isCompany ? namespaces.companyListingsNew : namespaces.accountListingsNew,
  );
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { user } = useUser();
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const phoneCountryCodeValue = (() => {
    if (isCompany) {
      return user?.company?.phone?.countryCode
        ? (user.company.phone.countryCode.toString() ?? "")
        : "";
    }
    return user?.phone?.countryCode
      ? (user.phone.countryCode.toString() ?? "")
      : "";
  })();

  const phoneNumberValue = (() => {
    if (isCompany) {
      return user?.company?.phone?.number
        ? Number(user.company.phone.number)
        : "";
    }
    return user?.phone?.number ? Number(user.phone.number) : "";
  })();

  const hasVerifiedPhone = isCompany
    ? !!user?.company?.phone?.verifiedAt
    : !!user?.phone?.verifiedAt;

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.checkboxAcceptRegulations]: false,
      [formNames.checkboxCreateListing]: false,
      [formNames.country]: E_Country.POLAND,
      [formNames.flatNumber]: "",
      [formNames.listingAvailableFrom]: "",
      [formNames.listingCategory]: "",
      [formNames.listingCity]: "",
      [formNames.listingDescription]: "",
      [formNames.listingDistrict]: "",
      [formNames.listingHasAvailableDistricts]: false,
      [formNames.listingSalaryFrom]: "",
      [formNames.listingSalaryTo]: "",
      [formNames.listingShowEmail]: !hasVerifiedPhone,
      [formNames.listingShowPhone]: hasVerifiedPhone,
      [formNames.listingTitle]: "",
      [formNames.listingWorkMode]: "",
      [formNames.phoneCountryCode]: phoneCountryCodeValue,
      [formNames.phoneNumber]: phoneNumberValue,
      [formNames.postalCode]: "",
      [formNames.streetName]: "",
      [formNames.streetNumber]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.checkboxAcceptRegulations]: value =>
        checkFormValidator({
          formName: formNames.checkboxAcceptRegulations,
          value,
        }),
      [formNames.checkboxCreateListing]: value =>
        checkFormValidator({
          formName: formNames.checkboxCreateListing,
          value,
        }),
      [formNames.listingAvailableFrom]: value =>
        checkFormValidator({
          formName: formNames.listingAvailableFrom,
          optional: true,
          value,
        }),
      [formNames.listingCategory]: value =>
        checkFormValidator({ formName: formNames.listingCategory, value }),
      [formNames.listingCity]: value =>
        checkFormValidator({ formName: formNames.listingCity, value }),
      [formNames.listingDescription]: value =>
        checkFormValidator({ formName: formNames.listingDescription, value }),
      [formNames.listingDistrict]: value =>
        checkFormValidator({
          formName: formNames.listingDistrict,
          optional: true,
          value,
        }),
      [formNames.listingSalaryFrom]: value =>
        checkFormValidator({ formName: formNames.listingSalaryFrom, value }),
      [formNames.listingSalaryTo]: value =>
        checkFormValidator({ formName: formNames.listingSalaryTo, value }),
      [formNames.listingTitle]: value =>
        checkFormValidator({ formName: formNames.listingTitle, value }),
      [formNames.listingWorkMode]: value =>
        checkFormValidator({ formName: formNames.listingWorkMode, value }),
      [formNames.postalCode]: value =>
        checkFormValidator({ formName: formNames.postalCode, value }),
      [formNames.streetName]: value =>
        checkFormValidator({ formName: formNames.streetName, value }),
      [formNames.streetNumber]: value =>
        checkFormValidator({ formName: formNames.streetNumber, value }),
    },
  });

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    const {
      checkboxAcceptRegulations,
      checkboxCreateListing,
      listingShowEmail,
      listingShowPhone,
    } = values;

    if (!listingShowPhone && !listingShowEmail) {
      notifications.show({
        color: "red",
        message: tNotifications(`noListingContactMethod.message`),
        title: tNotifications(`noListingContactMethod.title`),
      });
      return;
    }

    if (!checkboxAcceptRegulations) {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`noCheckedCheckboxRegulations.title`),
      });
      return;
    }

    if (!checkboxCreateListing) {
      notifications.show({
        color: "red",
        message: "",
        title: tNotifications(`noCheckedCheckboxCreateListing.title`),
      });
      return;
    }

    if (!updatedImages.uploaded.every(item => item.uploaded)) {
      notifications.show({
        color: "red",
        message: tNotifications(`waitForImagesUpload.message`),
        title: tNotifications(`waitForImagesUpload.title`),
      });
      return;
    }

    submit(
      convertToFormData({
        ...values,
        [formNames.listingImagesNew]: updatedImages.uploaded.map(
          item => item.path,
        ),
        [formNames.listingImagesToRemove]: updatedImages.removed,
        [formNames.uploadImagesGroupId]: uploadImagesGroupId,
      }),
      {
        action: getLocalizedRoute({
          route: isCompany
            ? E_Routes.companyListingsNew
            : E_Routes.accountListingsNew,
        }),
        encType: "multipart/form-data",
        method: "post",
      },
    );
  };

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  // TODO: image upload temporarily disabled
  // const handleUpdateImages = useCallback(
  //   (dataImages: T_SelectImagesOnChange) => {
  //     setUpdatedImages({
  //       removed: dataImages.removed,
  //       uploaded: dataImages.uploaded,
  //     });
  //   },
  //   [],
  // );

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        breadcrumbs={
          isCompany
            ? [
                E_Routes.home,
                E_Routes.company,
                E_Routes.companyListings,
                E_Routes.companyListingsNew,
              ]
            : [
                E_Routes.home,
                E_Routes.account,
                E_Routes.accountListings,
                E_Routes.accountListingsNew,
              ]
        }
        buttons={
          <>
            <ButtonArrowLeft
              routeTo={
                isCompany ? E_Routes.companyListings : E_Routes.accountListings
              }
            />
            <Button type="submit">{t("buttonAdd")}</Button>
          </>
        }
        information={t("information")}
        pageMeta={{
          route: isCompany
            ? E_Routes.companyListingsNew
            : E_Routes.accountListingsNew,
        }}
        size="md"
        title={t("title")}
        withHTML={false}
        withTextsToUi
      >
        <InputWrapper>
          {/* TODO: image upload temporarily disabled
          <Fieldset legend={t("fieldsetImages")}>
            <SelectImages
              limit={3}
              maxSizeMB={5}
              maxWidthOrHeight={1920}
              name={formNames.fileImages5MB}
              onChange={handleUpdateImages}
              uploadImagesGroupId={uploadImagesGroupId}
            />
          </Fieldset>
          */}
          <AutocompleteAddress
            form={form}
            label={t("fieldsetLocation")}
            required
          />
          <Fieldset legend={t("fieldsetInformation")}>
            <Input
              key={form.key(formNames.listingTitle)}
              name={formNames.listingTitle}
              required
              {...form.getInputProps(formNames.listingTitle)}
              clearable
              maxLength={100}
            />
            <TextEditor
              defaultValue=""
              error={form.getInputProps(formNames.listingDescription).error}
              name={formNames.listingDescription}
              onChange={htmlValue =>
                form.setFieldValue(formNames.listingDescription, htmlValue)
              }
              required
            />
            <Box w="100%">
              <Flex align="flex-start" gap={24} w="100%" wrap="wrap">
                <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                  <SelectListingCategory form={form} required />
                </Box>
                <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                  <SelectWorkMode form={form} required />
                </Box>
              </Flex>
            </Box>
            <Box w="100%">
              <Flex align="flex-start" gap={24} w="100%" wrap="wrap">
                <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                  <Input
                    key={form.key(formNames.listingSalaryFrom)}
                    name={formNames.listingSalaryFrom}
                    required
                    type="number"
                    {...form.getInputProps(formNames.listingSalaryFrom)}
                    max={inputMaxLength.listingSalary}
                  />
                </Box>
                <Box w={{ base: "100%", xs: "calc(50% - 14px)" }}>
                  <Input
                    key={form.key(formNames.listingSalaryTo)}
                    name={formNames.listingSalaryTo}
                    required
                    type="number"
                    {...form.getInputProps(formNames.listingSalaryTo)}
                    max={inputMaxLength.listingSalary}
                  />
                </Box>
              </Flex>
            </Box>
            <InputCalendar
              key={form.key(formNames.listingAvailableFrom)}
              {...form.getInputProps(formNames.listingAvailableFrom)}
              clearable
              disabledWithOpacity={false}
              minDate={new Date()}
              name={formNames.listingAvailableFrom}
              required={false}
              withoutDescription
            />
          </Fieldset>
          <Fieldset
            description={t("fieldsetPhoneDescription")}
            legend={t("fieldsetPhone")}
          >
            <InputPhone
              disabled
              form={form}
              isCompanyPhone={isCompany}
              required={false}
            />
          </Fieldset>
          <Fieldset
            description={t("fieldsetContactDescription")}
            legend={t("fieldsetContact")}
          >
            <Flex
              align="flex-start"
              direction="column"
              gap={8}
              justify="flex-start"
              w="100%"
            >
              {hasVerifiedPhone && (
                <Checkbox
                  key={form.key(formNames.listingShowPhone)}
                  label={tCommon("inputs.listingShowPhone")}
                  name={formNames.listingShowPhone}
                  required={false}
                  {...form.getInputProps(formNames.listingShowPhone, {
                    type: "checkbox",
                  })}
                />
              )}
              <Checkbox
                key={form.key(formNames.listingShowEmail)}
                label={tCommon("inputs.listingShowEmail")}
                name={formNames.listingShowEmail}
                required={false}
                {...form.getInputProps(formNames.listingShowEmail, {
                  type: "checkbox",
                })}
              />
            </Flex>
          </Fieldset>
          <div>
            <Checkbox
              key={form.key(formNames.checkboxAcceptRegulations)}
              label={
                <>
                  {tCommon("inputs.checkboxAcceptRegulationsText")}{" "}
                  <Link
                    fw="bold"
                    onDisabledWithUnderline
                    rel="noreferrer"
                    target="_blank"
                    text
                    to={getLocalizedRoute({
                      route: E_Routes.termsAndConditions,
                    })}
                    withUnderline
                  >
                    {tCommon("inputs.checkboxAcceptTermsAndRegulationsLink")}
                  </Link>{" "}
                  {tCommon("inputs.checkboxAcceptRegulationsAnd")}{" "}
                  <Link
                    fw="bold"
                    onDisabledWithUnderline
                    rel="noreferrer"
                    target="_blank"
                    text
                    to={getLocalizedRoute({
                      route: E_Routes.privacyPolicy,
                    })}
                    withUnderline
                  >
                    {tCommon("inputs.checkboxAcceptPrivacyPolicyLink")}
                  </Link>
                </>
              }
              mb={24}
              mt={12}
              name={formNames.checkboxAcceptRegulations}
              w="100%"
              withAsterisk
              {...form.getInputProps(formNames.checkboxAcceptRegulations, {
                type: "checkbox",
              })}
            />
            <Checkbox
              key={form.key(formNames.checkboxCreateListing)}
              name={formNames.checkboxCreateListing}
              required
              {...form.getInputProps(formNames.checkboxCreateListing, {
                type: "checkbox",
              })}
            />
          </div>
        </InputWrapper>
      </Section>
    </Form>
  );
};
