import { Box } from "@mantine/core";
import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import type { SyntheticEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLayout } from "~/hooks/useLayout";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { useUser } from "~/hooks/useUser";
import { showPhoneNumber } from "~/lib/validations";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_CountryCode } from "~/models/enums";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { InputPhone } from "~/ui/InputPhone";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { Text } from "~/ui/Text";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

export const CompanyPhonePage = () => {
  const [haveChanges, setHaveChanges] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t } = useTranslation(namespaces.companyPhone);
  const { refreshData, user } = useUser();
  const submit = useSubmitWithActions();
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.companyPhoneCountryCode]: E_CountryCode.POLAND,
      [formNames.companyPhoneNumber]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const hasErrorInPhone = checkFormValidator({
        formName: formNames.companyPhoneNumber,
        value: values[formNames.companyPhoneNumber],
      });

      const isDataTheSame = compareObjects({
        object1: {
          [formNames.companyPhoneCountryCode]:
            values[formNames.companyPhoneCountryCode],
          [formNames.companyPhoneNumber]: values[formNames.companyPhoneNumber],
        },
        object2: {
          [formNames.companyPhoneCountryCode]:
            user?.company?.phone?.countryCode?.toString(),
          [formNames.companyPhoneNumber]: user?.company?.phone?.number,
        },
      });
      setHaveChanges(!isDataTheSame && !hasErrorInPhone);
    },
    validate: {
      [formNames.companyPhoneCountryCode]: value =>
        checkFormValidator({
          formName: formNames.companyPhoneCountryCode,
          value,
        }),
      [formNames.companyPhoneNumber]: value =>
        checkFormValidator({ formName: formNames.companyPhoneNumber, value }),
    },
  });

  const userHasPhoneToConfirm =
    user?.company?.phone?.countryCodeToConfirm ||
    user?.company?.phone?.numberToConfirm;

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const newPhoneCountryCode = values[formNames.companyPhoneCountryCode];
    const newPhoneNumber = values[formNames.companyPhoneNumber];

    const phoneCountryCodeIsTheSame =
      newPhoneCountryCode === user?.company?.phone?.countryCode?.toString();
    const phoneNumberIsTheSame =
      newPhoneNumber === user?.company?.phone?.number?.toString();

    if (phoneCountryCodeIsTheSame && phoneNumberIsTheSame) {
      notifications.show({
        color: "red",
        message: tNotifications(`newUserPhoneTheSame.message`),
        title: tNotifications(`newUserPhoneTheSame.title`),
      });
      return;
    }

    submit(
      convertToFormData({
        [formNames.companyPhoneCountryCode]: newPhoneCountryCode,
        [formNames.companyPhoneNumber]: newPhoneNumber,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.companyPhone,
        }),
        method: "patch",
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

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        breadcrumbs={[E_Routes.home, E_Routes.company, E_Routes.companyPhone]}
        buttons={
          <>
            <ButtonArrowLeft routeTo={E_Routes.company} />
            {!userHasPhoneToConfirm && (
              <ButtonSave
                disabled={!haveChanges}
                tooltip={{
                  label: t("buttonSaveTooltip"),
                }}
                type="submit"
              />
            )}
            {userHasPhoneToConfirm && (
              <Button onClick={refreshData}>
                {t("buttonConfirmNewNumber")}
              </Button>
            )}
          </>
        }
        description={t("description")}
        information={t("information")}
        pageMeta={{
          route: E_Routes.companyPhone,
        }}
        questions={[
          {
            description: tQuestions(
              "companyPhone.confirmPhoneRequired.description",
            ),
            title: tQuestions("companyPhone.confirmPhoneRequired.title"),
          },
          {
            description: tQuestions(
              "companyPhone.phoneVerification.description",
            ),
            title: tQuestions("companyPhone.phoneVerification.title"),
          },
          {
            description: tQuestions("companyPhone.changePhone.description"),
            title: tQuestions("companyPhone.changePhone.title"),
          },
          {
            description: tQuestions("companyPhone.locations.description"),
            title: tQuestions("companyPhone.locations.title"),
          },
        ]}
        size="md"
        title={user?.company?.phone?.verifiedAt ? t("title") : t("titleAdd")}
      >
        <Box className="center" pb={userHasPhoneToConfirm ? 24 : 48}>
          <Text fw="bold">{t("currentPhoneNumber")}</Text>
          {!!user?.company?.phone?.countryCode &&
            !!user?.company?.phone?.number && (
              <Text c={platformColor} fw="bold">
                {showPhoneNumber({
                  phoneCountryCode: user?.company?.phone?.countryCode,
                  phoneNumber: user?.company?.phone?.number,
                })}
              </Text>
            )}
          {!(
            !!user?.company?.phone?.countryCode &&
            !!user?.company?.phone?.number
          ) && (
            <Text c={platformColor} fw="bold">
              {t("noPhone")}
            </Text>
          )}
        </Box>
        {userHasPhoneToConfirm && (
          <Box className="center" pb={48}>
            <Text fw="bold">{t("newPhoneNumber")}</Text>
            {!!user?.company?.phone?.countryCodeToConfirm &&
              !!user?.company?.phone?.numberToConfirm && (
                <Text c={platformColor} fw="bold">
                  {showPhoneNumber({
                    phoneCountryCode:
                      user?.company?.phone?.countryCodeToConfirm,
                    phoneNumber: user?.company?.phone?.numberToConfirm,
                  })}
                </Text>
              )}
            {!(
              !!user?.company?.phone?.countryCodeToConfirm &&
              !!user?.company?.phone?.numberToConfirm
            ) && (
              <Text c={platformColor} fw="bold">
                {t("noPhone")}
              </Text>
            )}
          </Box>
        )}
        {!userHasPhoneToConfirm && (
          <InputWrapper>
            <InputPhone
              form={form}
              isCompanyPhone
              label={t("inputNewPhoneNumber")}
              required={true}
            />
          </InputWrapper>
        )}
      </Section>
    </Form>
  );
};
