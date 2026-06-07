import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import dayjs from "dayjs";
import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import type { T_Bug } from "~/models/bug";
import type { T_PlatformSetting } from "~/models/platformSetting";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { generatePointsFromStatus } from "~/ui/CardBug";
import { Checkbox } from "~/ui/Checkbox";
import { DateTimePicker } from "~/ui/DateTimePicker";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { SelectBugEnvironment } from "~/ui/SelectBugEnvironment";
import { SelectBugPriority } from "~/ui/SelectBugPriority";
import { SelectBugStatus } from "~/ui/SelectBugStatus";
import { Textarea } from "~/ui/Textarea";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_AdminBugEditPage = {
  bug: T_Bug;
  platformSetting: T_PlatformSetting;
};

export const AdminBugEditPage = ({
  bug,
  platformSetting,
}: T_AdminBugEditPage) => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorUpdateBugOpen, setAuthenticatorUpdateBugOpen] =
    useState(false);
  const [authenticatorPointsPayOpen, setAuthenticatorPointsPayOpen] =
    useState(false);
  const { t } = useTranslation(namespaces.adminBugEdit);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const initialValues = {
    [formNames.bugAnswer]: bug.answer ?? "",
    [formNames.bugId]: bug.id,
    [formNames.bugPriority]: bug.priority ?? "",
    [formNames.bugStatus]: bug.status,
  };

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues,
    mode: "uncontrolled",
    onValuesChange(values) {
      const isDataTheSame = compareObjects({
        ignoreCaseInsensitive: true,
        object1: values,
        object2: initialValues,
      });
      setHaveChanges(!isDataTheSame);
    },
    validate: {
      [formNames.bugAnswer]: value =>
        checkFormValidator({
          formName: formNames.bugAnswer,
          optional: true,
          value,
        }),
      [formNames.bugPriority]: value =>
        checkFormValidator({
          formName: formNames.bugPriority,
          value,
        }),
      [formNames.bugStatus]: value =>
        checkFormValidator({ formName: formNames.bugStatus, value }),
    },
  });

  const generatedPoints =
    bug.companyId && bug.priority
      ? generatePointsFromStatus({
          bug,
          platformSetting,
        })
      : null;

  const handleCloseAuthenticatorPointsPay = useCallback(() => {
    setAuthenticatorPointsPayOpen(false);
  }, []);

  const handleCloseAuthenticatorUpdateBug = useCallback(() => {
    setAuthenticatorUpdateBugOpen(false);
  }, []);

  const handlePointsPay = useCallback(() => {
    setAuthenticatorPointsPayOpen(true);
  }, []);

  const handleAuthenticatorPointsPayOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorPointsPayOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.bugId]: bug.id,
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${bug.id}`,
            route: E_Routes.adminBugEdit,
          }),
          method: "post",
        },
      );
    },
    [bug],
  );

  const handleAuthenticatorUpdateBugOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorUpdateBugOpen(false);

      const formData = form.getValues();

      if (!formData) {
        return;
      }

      submit(
        convertToFormData({
          ...formData,
          [formNames.authenticator]: authenticator,
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${bug.id}`,
            route: E_Routes.adminBugEdit,
          }),
          method: "patch",
        },
      );
    },
    [bug],
  );

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = (
    _: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    setAuthenticatorUpdateBugOpen(true);
  };

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticatorUpdateBug}
        onSuccess={handleAuthenticatorUpdateBugOnSuccess}
        opened={authenticatorUpdateBugOpen}
      />
      <ModalAuthenticator
        onClose={handleCloseAuthenticatorPointsPay}
        onSuccess={handleAuthenticatorPointsPayOnSuccess}
        opened={authenticatorPointsPayOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[
            E_Routes.home,
            E_Routes.admin,
            E_Routes.adminBugs,
            E_Routes.adminBugEdit,
          ]}
          buttons={
            <>
              <Link
                fullWidthOnMobile
                to={`${getLocalizedRoute({
                  extraPath: `/${bug.id}`,
                  route: E_Routes.adminBugDetails,
                })}`}
              >
                <ButtonArrowLeft />
              </Link>
              {generatedPoints && !bug.pointsPaidAt && (
                <Button onClick={handlePointsPay} variant="light">
                  {t("buttonPointsPay")}
                </Button>
              )}
              <ButtonSave
                disabled={!haveChanges}
                tooltip={{
                  label: tCommon("buttonSaveTooltip"),
                }}
                type="submit"
              />
            </>
          }
          pageMeta={{
            route: E_Routes.adminBugEdit,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <SelectBugStatus
              disabled={false}
              disabledWithOpacity={false}
              form={form}
              required
            />
            <DateTimePicker
              disabled
              disabledWithOpacity={false}
              name={formNames.bugTimestamp}
              required={false}
              value={dayjs(bug.timestamp).toDate()}
            />
            <Input
              disabled
              disabledWithOpacity={false}
              name={formNames.bugErrorMessage}
              required={false}
              value={bug.errorMessage ?? ""}
            />
            <SelectBugEnvironment
              defaultValue={bug.environment}
              disabled
              disabledWithOpacity={false}
              required={false}
            />
            <SelectBugPriority
              disabled={false}
              disabledWithOpacity={false}
              form={form}
              required
            />
            {generatedPoints && (
              <>
                <Input
                  disabled
                  disabledWithOpacity={false}
                  label={t("bugPointsLabel")}
                  required={false}
                  value={generatedPoints}
                />
                <DateTimePicker
                  description={t("bugPointsPaidAtDescription")}
                  disabled
                  disabledWithOpacity={false}
                  name={formNames.bugPointsPaidAt}
                  required={false}
                  value={
                    bug.pointsPaidAt
                      ? dayjs(bug.pointsPaidAt).toDate()
                      : undefined
                  }
                />
              </>
            )}
            <Checkbox
              checked={bug.isReproducible}
              disabled
              disabledWithOpacity={false}
              name={formNames.bugIsReproducible}
              required={false}
            />
            <Textarea
              defaultValue={bug.description}
              disabled
              disabledWithOpacity={false}
              maxLength={null}
              name={formNames.bugAnswer}
              required={false}
            />
            <Textarea
              defaultValue={bug.actionsBeforeError}
              disabled
              disabledWithOpacity={false}
              maxLength={null}
              name={formNames.bugActionsBeforeError}
              required={false}
            />
            <Textarea
              defaultValue={bug.expectedBehavior ?? ""}
              disabled
              disabledWithOpacity={false}
              maxLength={null}
              name={formNames.bugExpectedBehavior}
              required={false}
            />
            <Textarea
              key={form.key(formNames.bugAnswer)}
              {...form.getInputProps(formNames.bugAnswer)}
              maxLength={1000}
              name={formNames.bugAnswer}
              required={false}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};
