import { FormErrors, useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { PropsWithChildren, SyntheticEvent, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { useFetcherWithActions } from "~/hooks/useFetcherWithActions";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { E_ReportType } from "~/models/enums";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";

import { Button } from "../Button";
import { ButtonArrowLeft } from "../ButtonArrowLeft";
import { Form } from "../Form";
import { InputWrapper } from "../InputWrapper";
import { Modal } from "../Modal";
import { Section } from "../Section";
import { SelectReport } from "../SelectReport";
import { Textarea } from "../Textarea";
import { WrapperRemoveOnHidden } from "../WrapperRemoveOnHidden";

type T_ModalReport = {
  listingId: string;
  onClose: () => void;
  opened: boolean;
};

const ModalReport = ({ listingId, onClose, opened }: T_ModalReport) => {
  const { t } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const { getLocalizedRoute } = useLocalizedRoute();
  const fetcher = useFetcherWithActions({
    onSuccess: onClose,
  });

  useEffect(() => {
    if (fetcher.data?.message === "successReportCreate") {
      // onClose(); // NOSONAR
    }
  }, [fetcher.data]);

  const form = useForm({
    clearInputErrorOnChange: true,
    initialValues: {
      [formNames.listingId]: listingId ?? "",
      [formNames.reportDescription]: "",
      [formNames.reportType]: "",
    },
    mode: "uncontrolled",
    validate: {
      [formNames.listingId]: value =>
        checkFormValidator({
          formName: formNames.listingId,
          value,
        }),
      [formNames.reportDescription]: value =>
        checkFormValidator({
          formName: formNames.reportDescription,
          optional: true,
          value,
        }),
      [formNames.reportType]: value =>
        checkFormValidator({ formName: formNames.reportType, value }),
    },
  });

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = (
    values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    const { reportDescription, reportType } = values;

    if (reportType === E_ReportType.OTHER && !reportDescription) {
      notifications.show({
        color: "red",
        message: tNotifications(`reportDescriptionRequired.message`),
        title: tNotifications(`reportDescriptionRequired.title`),
      });
      return;
    }

    fetcher.submit(
      convertToFormData({
        ...values,
      }),
      {
        action: getLocalizedRoute({
          route: E_Routes.apiAccountReport,
        }),
        method: "post",
      },
    );
  };

  return (
    <Modal opened={opened} size="lg" zIndex={2020}>
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          buttons={
            <>
              {onClose && <ButtonArrowLeft onClick={onClose} size="sm" />}
              <Button size="sm" type="submit">
                {t("modalReport.buttonSave")}
              </Button>
            </>
          }
          description={t("modalReport.description")}
          isInModal
          title={t("modalReport.title")}
        >
          <InputWrapper>
            <SelectReport form={form} required withManagePageScroll={false} />
            <Textarea
              key={form.key(formNames.reportDescription)}
              {...form.getInputProps(formNames.reportDescription)}
              maxLength={1000}
              name={formNames.reportDescription}
              required={false}
            />
          </InputWrapper>
        </Section>
      </Form>
    </Modal>
  );
};

export const ModalWrapper = (properties: PropsWithChildren<T_ModalReport>) => {
  return (
    <WrapperRemoveOnHidden opened={properties.opened}>
      {({ visible }) => <ModalReport {...properties} opened={visible} />}
    </WrapperRemoveOnHidden>
  );
};
