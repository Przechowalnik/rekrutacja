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
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
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
};

export const AdminBugEditPage = ({ bug }: T_AdminBugEditPage) => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorUpdateBugOpen, setAuthenticatorUpdateBugOpen] =
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

  const handleCloseAuthenticatorUpdateBug = useCallback(() => {
    setAuthenticatorUpdateBugOpen(false);
  }, []);

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
