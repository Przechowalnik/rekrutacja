import type { BoxProps } from "@mantine/core";
import { Box, Flex } from "@mantine/core";
import { Link, RichTextEditor } from "@mantine/tiptap";
import Highlight from "@tiptap/extension-highlight";
import SubScript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { memo, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useActionData } from "react-router";

import { namespaces } from "~/constants/namespaces";
import type { T_ResponseOnFailure } from "~/data/response.server";
import type { T_FormNames } from "~/lib/zodFormValidator";
import { countSpaces } from "~/utilities/functions";

import { Button } from "../Button";
import { Text } from "../Text";
import { TextEditorShow } from "../TextEditorShow";

type T_TextEditor = {
  defaultValue?: string;
  description?: string;
  error?: string;
  label?: string;
  name: T_FormNames;
  onChange?: (htmlValue: string) => void;
  onlyShow?: boolean;
  required?: boolean;
  withoutDescription?: boolean;
} & BoxProps;

const TextEditor = ({
  defaultValue,
  description,
  error,
  label,
  name,
  onChange,
  onlyShow,
  required,
  withoutDescription = false,
  ...restProps
}: T_TextEditor) => {
  const [globalError, setGlobalError] = useState<string | undefined>();
  const [showHtml, setShowHtml] = useState(false);

  const actionData = useActionData<T_ResponseOnFailure>();
  const { t: tCommon } = useTranslation(namespaces.common);
  const { t } = useTranslation(namespaces.notifications);

  const editor = useEditor({
    content: defaultValue,
    extensions: [
      StarterKit,
      Underline,
      Link,
      Superscript,
      SubScript,
      Highlight,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    onUpdate: () => {
      const valueEditor = editor?.getHTML();
      if (valueEditor === "<p></p>") {
        onChange?.("");
      } else {
        onChange?.(valueEditor ?? "");
      }
    },
    shouldRerenderOnTransaction: true,
  });

  const inputDescription = withoutDescription
    ? null
    : (description ?? tCommon(`inputsDescription.${name}`));

  const inputLabel = label ?? tCommon(`inputs.${name}`);

  const errorValue: string | undefined = (() => {
    if (globalError) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return t(`${globalError}.message`);
    }
    if (error) {
      if (countSpaces(error) > 0) {
        return error;
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return tCommon(`formValidator.${error}` as any);
    }
    return;
  })();

  useEffect(() => {
    if (actionData?.formErrors && Array.isArray(actionData?.formErrors)) {
      const findFieldInFormErrors = actionData?.formErrors.find(
        item => item?.field === name,
      );
      if (typeof findFieldInFormErrors?.message === "string") {
        setGlobalError(findFieldInFormErrors?.message);
        return;
      }
    }

    setGlobalError(undefined);
  }, [actionData]);

  const handleToggleShowHtml = () => {
    setShowHtml(previousState => !previousState);
  };

  const valueEditor = editor?.getHTML() ?? "";

  const validValueEditor = valueEditor === "<p></p>" ? "" : valueEditor;

  return (
    <Box w="100%" {...restProps}>
      <Text
        fw="bold"
        size="md"
        style={{
          marginBottom: -2,
        }}
      >
        {inputLabel}
        {required && (
          <span
            style={{
              color: "var(--mantine-color-error)",
              paddingLeft: 4,
            }}
          >
            *
          </span>
        )}
      </Text>
      {inputDescription && (
        <Text c="var(--mantine-color-dimmed)" pb={12} size="sm">
          {inputDescription}
        </Text>
      )}
      {!showHtml && !onlyShow && (
        <>
          <Box mih={105} pos="relative">
            <RichTextEditor
              bd={
                errorValue
                  ? "2px solid var(--mantine-color-error)"
                  : "2px solid var(--mantine-color-gray-4)"
              }
              editor={editor}
              w="100%"
            >
              <RichTextEditor.Toolbar sticky stickyOffset={60}>
                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Bold />
                  <RichTextEditor.Italic />
                  <RichTextEditor.Underline />
                  <RichTextEditor.Strikethrough />
                  <RichTextEditor.ClearFormatting />
                  <RichTextEditor.Highlight />
                  <RichTextEditor.Code />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.H1 />
                  <RichTextEditor.H2 />
                  <RichTextEditor.H3 />
                  <RichTextEditor.H4 />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Blockquote />
                  <RichTextEditor.Hr />
                  <RichTextEditor.BulletList />
                  <RichTextEditor.OrderedList />
                  <RichTextEditor.Subscript />
                  <RichTextEditor.Superscript />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Link />
                  <RichTextEditor.Unlink />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.AlignLeft />
                  <RichTextEditor.AlignCenter />
                  <RichTextEditor.AlignJustify />
                  <RichTextEditor.AlignRight />
                </RichTextEditor.ControlsGroup>

                <RichTextEditor.ControlsGroup>
                  <RichTextEditor.Undo />
                  <RichTextEditor.Redo />
                </RichTextEditor.ControlsGroup>
              </RichTextEditor.Toolbar>

              <RichTextEditor.Content />
            </RichTextEditor>
            <Box bottom={0} pos="absolute" right={8}>
              <Text
                size="sm"
                style={{
                  color: "var(--mantine-color-dimmed)",
                  marginBottom: 3,
                }}
              >
                {tCommon("textEditor.usedCharacters")}:{" "}
                {validValueEditor?.length}
              </Text>
            </Box>
          </Box>
          {errorValue && (
            <Text c="red" mt={4} size="sm">
              {errorValue}
            </Text>
          )}
        </>
      )}
      {(showHtml || onlyShow) && (
        <>
          <TextEditorShow content={editor?.getHTML() ?? ""} />
          {errorValue && (
            <Text c="red" mt={4} size="sm">
              {errorValue}
            </Text>
          )}
        </>
      )}
      {!onlyShow && (
        <Flex gap={8} justify="flex-end" mt={8}>
          <Button
            disabled={!showHtml}
            onClick={handleToggleShowHtml}
            size="sm"
            variant="light"
          >
            {tCommon("textEditor.buttonEdit")}
          </Button>
          <Button disabled={showHtml} onClick={handleToggleShowHtml} size="sm">
            {tCommon("textEditor.buttonShow")}
          </Button>
        </Flex>
      )}
    </Box>
  );
};

export default memo(TextEditor);
