import type { FormErrors } from "@mantine/form";
import { useForm } from "@mantine/form";
import type { SyntheticEvent } from "react";
import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { useSubmitWithActions } from "~/hooks/useSubmitWithActions";
import { checkFormValidator, formNames } from "~/lib/zodFormValidator";
import { T_BlogPost } from "~/models/blogPost";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { ButtonSave } from "~/ui/ButtonSave";
import { Form } from "~/ui/Form";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Section } from "~/ui/Section";
import { TextEditor } from "~/ui/TextEditor";
import { convertToFormData, showAllErrorsForm } from "~/utilities/form";
import { compareObjects } from "~/utilities/functions";

const ModalAuthenticator = dynamic(() =>
  import("~/ui/ModalAuthenticator").then(module => ({
    default: module.ModalAuthenticator,
  })),
);

type T_AdminBlogPostEditPage = {
  blogPost: T_BlogPost;
};

export const AdminBlogPostEditPage = ({
  blogPost,
}: T_AdminBlogPostEditPage) => {
  const [haveChanges, setHaveChanges] = useState(false);
  const [authenticatorDeletePlanOpen, setAuthenticatorDeletePlanOpen] =
    useState(false);
  const [authenticatorOpen, setAuthenticatorOpen] = useState(false);

  const { t } = useTranslation(namespaces.adminBlogPostEdit);
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t: tNotifications } = useTranslation(namespaces.notifications);
  const submit = useSubmitWithActions();
  const { getLocalizedRoute } = useLocalizedRoute();

  const initialValues = {
    [formNames.blogPostContent]: blogPost.content,
    [formNames.blogPostDescription]: blogPost.description,
    [formNames.blogPostDescriptionSeo]: blogPost.descriptionSeo,
    [formNames.blogPostSlug]: blogPost.slug,
    [formNames.blogPostTitle]: blogPost.title,
    [formNames.blogPostTitleSeo]: blogPost.titleSeo,
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
      [formNames.blogPostContent]: value =>
        checkFormValidator({ formName: formNames.blogPostContent, value }),
      [formNames.blogPostDescription]: value =>
        checkFormValidator({ formName: formNames.blogPostDescription, value }),
      [formNames.blogPostDescriptionSeo]: value =>
        checkFormValidator({
          formName: formNames.blogPostDescriptionSeo,
          value,
        }),
      [formNames.blogPostSlug]: value =>
        checkFormValidator({ formName: formNames.blogPostSlug, value }),
      [formNames.blogPostTitle]: value =>
        checkFormValidator({ formName: formNames.blogPostTitle, value }),
      [formNames.blogPostTitleSeo]: value =>
        checkFormValidator({ formName: formNames.blogPostTitleSeo, value }),
    },
  });

  const handleCloseAuthenticator = useCallback(() => {
    setAuthenticatorOpen(false);
  }, []);

  const handleCloseAuthenticatorDeletePlan = useCallback(() => {
    setAuthenticatorDeletePlanOpen(false);
  }, []);

  const handleDeletePlan = useCallback(() => {
    setAuthenticatorDeletePlanOpen(true);
  }, []);

  const handleSubmitErrors = (
    validationErrors: FormErrors,
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();
    showAllErrorsForm({ tNotifications, validationErrors });
  };

  const handleSubmit = (
    _values: typeof form.values,
    event: SyntheticEvent | undefined,
  ) => {
    event?.preventDefault();

    setAuthenticatorOpen(true);
  };

  const handleAuthenticatorOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorOpen(false);

      const formData = form.getValues();

      if (!formData) {
        return;
      }

      submit(
        convertToFormData({
          ...formData,
          [formNames.authenticator]: authenticator,
          [formNames.blogPostId]: blogPost.id,
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${blogPost.id}`,
            route: E_Routes.adminBlogPostEdit,
          }),
          method: "patch",
        },
      );
    },
    [form],
  );

  const handleAuthenticatorDeletePlanOnSuccess = useCallback(
    async (authenticator: number | string) => {
      setAuthenticatorDeletePlanOpen(false);

      submit(
        convertToFormData({
          [formNames.authenticator]: authenticator,
          [formNames.blogPostId]: blogPost.id,
        }),
        {
          action: getLocalizedRoute({
            extraPath: `/${blogPost.id}`,
            route: E_Routes.adminBlogPostEdit,
          }),
          method: "delete",
        },
      );
    },
    [form],
  );

  return (
    <>
      <ModalAuthenticator
        onClose={handleCloseAuthenticatorDeletePlan}
        onSuccess={handleAuthenticatorDeletePlanOnSuccess}
        opened={authenticatorDeletePlanOpen}
      />
      <ModalAuthenticator
        onClose={handleCloseAuthenticator}
        onSuccess={handleAuthenticatorOnSuccess}
        opened={authenticatorOpen}
      />
      <Form onSubmit={form.onSubmit(handleSubmit, handleSubmitErrors)}>
        <Section
          breadcrumbs={[
            E_Routes.home,
            E_Routes.admin,
            E_Routes.adminBlogPosts,
            E_Routes.adminBlogPostEdit,
          ]}
          buttons={
            <>
              <ButtonArrowLeft routeTo={E_Routes.adminBlogPosts} />
              <Button color="red" onClick={handleDeletePlan} variant="light">
                {t("buttonDelete")}
              </Button>
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
            route: E_Routes.adminBlogPostEdit,
          }}
          size="md"
          title={t("title")}
        >
          <InputWrapper>
            <Input
              key={form.key(formNames.blogPostSlug)}
              name={formNames.blogPostSlug}
              required
              {...form.getInputProps(formNames.blogPostSlug)}
              maxLength={100}
            />
            <Input
              defaultValue={blogPost.description}
              key={form.key(formNames.blogPostTitle)}
              name={formNames.blogPostTitle}
              required
              {...form.getInputProps(formNames.blogPostTitle)}
              maxLength={100}
            />
            <Input
              key={form.key(formNames.blogPostTitleSeo)}
              name={formNames.blogPostTitleSeo}
              required
              {...form.getInputProps(formNames.blogPostTitleSeo)}
              maxLength={55}
            />
            <Input
              key={form.key(formNames.blogPostDescription)}
              name={formNames.blogPostDescription}
              required
              {...form.getInputProps(formNames.blogPostDescription)}
              maxLength={200}
            />
            <Input
              key={form.key(formNames.blogPostDescriptionSeo)}
              name={formNames.blogPostDescriptionSeo}
              required
              {...form.getInputProps(formNames.blogPostDescriptionSeo)}
              maxLength={155}
            />
            <TextEditor
              key={form.key(formNames.blogPostContent)}
              name={formNames.blogPostContent}
              required
              {...form.getInputProps(formNames.blogPostContent)}
            />
          </InputWrapper>
        </Section>
      </Form>
    </>
  );
};
