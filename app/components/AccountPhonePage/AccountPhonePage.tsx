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

export const AccountPhonePage = () => {
  const [haveChanges, setHaveChanges] = useState(false);

  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t } = useTranslation(namespaces.accountPhoneNumber);
  const { refreshData, user } = useUser();
  const submit = useSubmitWithActions();
  const { platformColor } = useLayout();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.phoneCountryCode]: E_CountryCode.POLAND,
      [formNames.phoneNumber]: "",
    },
    mode: "uncontrolled",
    onValuesChange(values) {
      const hasErrorInPhone = checkFormValidator({
        formName: formNames.phoneNumber,
        value: values[formNames.phoneNumber],
      });

      const isDataTheSame = compareObjects({
        object1: {
          [formNames.phoneCountryCode]: values[formNames.phoneCountryCode],
          [formNames.phoneNumber]: values[formNames.phoneNumber],
        },
        object2: {
          [formNames.phoneCountryCode]: user?.phone?.countryCode?.toString(),
          [formNames.phoneNumber]: user?.phone?.number,
        },
      });
      setHaveChanges(!isDataTheSame && !hasErrorInPhone);
    },
    validate: {
      [formNames.phoneCountryCode]: value =>
        checkFormValidator({ formName: formNames.phoneCountryCode, value }),
      [formNames.phoneNumber]: value =>
        checkFormValidator({ formName: formNames.phoneNumber, value }),
    },
  });

  const userHasPhoneToConfirm =
    user?.phone?.countryCodeToConfirm || user?.phone?.numberToConfirm;

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const newPhoneCountryCode = values[formNames.phoneCountryCode];
    const newPhoneNumber = values[formNames.phoneNumber];

    const phoneCountryCodeIsTheSame =
      newPhoneCountryCode === user?.phone?.countryCode?.toString();
    const phoneNumberIsTheSame =
      newPhoneNumber === user?.phone?.number?.toString();

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
        [formNames.phoneCountryCode]: newPhoneCountryCode,
        [formNames.phoneNumber]: newPhoneNumber,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.accountPhone,
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
        breadcrumbs={[E_Routes.home, E_Routes.account, E_Routes.accountPhone]}
        buttons={
          <>
            <ButtonArrowLeft routeTo={E_Routes.account} />
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
        description={user?.company ? undefined : t("description")}
        information={user?.company ? undefined : t("information")}
        pageMeta={{
          route: E_Routes.accountPhone,
        }}
        questions={[
          {
            description: tQuestions(
              "accountPhone.confirmPhoneRequired.description",
            ),
            title: tQuestions("accountPhone.confirmPhoneRequired.title"),
          },
          {
            description: tQuestions(
              "accountPhone.phoneVerification.description",
            ),
            title: tQuestions("accountPhone.phoneVerification.title"),
          },
          {
            description: tQuestions("accountPhone.changePhone.description"),
            title: tQuestions("accountPhone.changePhone.title"),
          },
        ]}
        size="md"
        title={user?.phone?.verifiedAt ? t("title") : t("titleAdd")}
      >
        <Box className="center" pb={userHasPhoneToConfirm ? 24 : 48}>
          <Text fw="bold">{t("currentPhoneNumber")}</Text>
          {!!user?.phone?.countryCode && !!user?.phone?.number && (
            <Text c={platformColor} fw="bold">
              {showPhoneNumber({
                phoneCountryCode: user?.phone?.countryCode,
                phoneNumber: user?.phone?.number,
              })}
            </Text>
          )}
          {!(!!user?.phone?.countryCode && !!user?.phone?.number) && (
            <Text c={platformColor} fw="bold">
              {t("noPhone")}
            </Text>
          )}
        </Box>
        {userHasPhoneToConfirm && (
          <Box className="center" pb={48}>
            <Text fw="bold">{t("newPhoneNumber")}</Text>
            {!!user?.phone?.countryCodeToConfirm &&
              !!user?.phone?.numberToConfirm && (
                <Text c={platformColor} fw="bold">
                  {showPhoneNumber({
                    phoneCountryCode: user?.phone?.countryCodeToConfirm,
                    phoneNumber: user?.phone?.numberToConfirm,
                  })}
                </Text>
              )}
            {!(
              !!user?.phone?.countryCodeToConfirm &&
              !!user?.phone?.numberToConfirm
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
              label={t("inputNewPhoneNumber")}
              required={true}
            />
          </InputWrapper>
        )}
      </Section>
    </Form>
  );
};
