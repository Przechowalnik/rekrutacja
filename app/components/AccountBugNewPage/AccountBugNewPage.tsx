import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import dayjs from "dayjs";
import type { SyntheticEvent } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { Checkbox } from "~/ui/Checkbox";
import { DateTimePicker } from "~/ui/DateTimePicker";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputFile } from "~/ui/InputFile";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { SelectBugEnvironment } from "~/ui/SelectBugEnvironment";
import { Textarea } from "~/ui/Textarea";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

export const AccountBugNewPage = () => {
  const { t } = useTranslation(namespaces.accountBugNew);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.bugActionsBeforeError]: "",
      [formNames.bugDescription]: "",
      [formNames.bugEnvironment]: "",
      [formNames.bugErrorMessage]: "",
      [formNames.bugExpectedBehavior]: "",
      [formNames.bugImages]: [],
      [formNames.bugIsReproducible]: false,
      [formNames.bugTimestamp]: dayjs().toString(),
      [formNames.bugVideo]: null,
    },
    mode: "uncontrolled",
    validate: {
      [formNames.bugActionsBeforeError]: value =>
        checkFormValidator({
          formName: formNames.bugActionsBeforeError,
          value,
        }),
      [formNames.bugDescription]: value =>
        checkFormValidator({
          formName: formNames.bugDescription,
          value,
        }),
      [formNames.bugEnvironment]: value =>
        checkFormValidator({
          formName: formNames.bugEnvironment,
          value,
        }),
      [formNames.bugErrorMessage]: value =>
        checkFormValidator({
          formName: formNames.bugErrorMessage,
          optional: true,
          value,
        }),
      [formNames.bugExpectedBehavior]: value =>
        checkFormValidator({
          formName: formNames.bugExpectedBehavior,
          optional: true,
          value,
        }),
      [formNames.bugImages]: value =>
        checkFormValidator({
          formName: formNames.fileImages5MBBase64,
          optional: true,
          value,
        }),
      [formNames.bugIsReproducible]: value =>
        checkFormValidator({
          formName: formNames.bugIsReproducible,
          value,
        }),
      [formNames.bugTimestamp]: value =>
        checkFormValidator({ formName: formNames.bugTimestamp, value }),
      [formNames.bugVideo]: value =>
        checkFormValidator({
          formName: formNames.fileVideo100MB,
          optional: true,
          value,
        }),
    },
  });

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const { bugImages } = values;

    if (bugImages.length > 3) {
      notifications.show({
        color: "red",
        message: tNotifications(`bugImagesMax3.message`),
        title: tNotifications(`bugImagesMax3.title`),
      });
      return;
    }

    submit(
      convertToFormData({
        ...values,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.accountBugNew,
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

  return (
    <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
      <Section
        breadcrumbs={[
          E_Routes.home,
          E_Routes.account,
          E_Routes.accountBugs,
          E_Routes.accountBugNew,
        ]}
        buttons={
          <>
            <ButtonArrowLeft routeTo={E_Routes.accountBugs} />
            <Button type="submit">{t("buttonSave")}</Button>
          </>
        }
        description={t("description")}
        pageMeta={{
          route: E_Routes.accountBugNew,
        }}
        size="md"
        title={t("title")}
      >
        <InputWrapper>
          <DateTimePicker
            defaultValue={dayjs()}
            key={form.key(formNames.bugTimestamp)}
            name={formNames.bugTimestamp}
            {...form.getInputProps(formNames.bugTimestamp, {
              type: "checkbox",
            })}
          />
          <Input
            key={form.key(formNames.bugErrorMessage)}
            name={formNames.bugErrorMessage}
            required={false}
            {...form.getInputProps(formNames.bugErrorMessage)}
            clearable
          />
          <SelectBugEnvironment allowDeselect={false} form={form} required />
          <InputFile
            key={form.key(formNames.bugImages)}
            name={formNames.bugImages}
            required={false}
            {...form.getInputProps(formNames.bugImages)}
            accept="image/png,image/jpeg"
            clearable
            multiple
          />
          <InputFile
            key={form.key(formNames.bugVideo)}
            name={formNames.bugVideo}
            required={false}
            {...form.getInputProps(formNames.bugVideo)}
            accept="video/mp4"
            clearable
          />
          <Checkbox
            key={form.key(formNames.bugIsReproducible)}
            name={formNames.bugIsReproducible}
            required={false}
            {...form.getInputProps(formNames.bugIsReproducible, {
              type: "checkbox",
            })}
          />
          <Textarea
            key={form.key(formNames.bugDescription)}
            {...form.getInputProps(formNames.bugDescription)}
            maxLength={1000}
            name={formNames.bugDescription}
            required
          />
          <Textarea
            key={form.key(formNames.bugActionsBeforeError)}
            {...form.getInputProps(formNames.bugActionsBeforeError)}
            maxLength={1000}
            name={formNames.bugActionsBeforeError}
            required
          />
          <Textarea
            key={form.key(formNames.bugExpectedBehavior)}
            {...form.getInputProps(formNames.bugExpectedBehavior)}
            maxLength={500}
            name={formNames.bugExpectedBehavior}
            required={false}
          />
        </InputWrapper>
      </Section>
    </Form>
  );
};
