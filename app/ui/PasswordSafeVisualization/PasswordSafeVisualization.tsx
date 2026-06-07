import { List } from "@mantine/core";
import { memo } from "react";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import {
  validHasNumber,
  validOneSpecialCharacter,
  validOneUppercaseAndOneLowerCaseLetter,
  validStringMinAndMaxLength,
  validStringMinLength,
} from "~/lib/validations";

import { Fieldset } from "../Fieldset";
import { Text } from "../Text";

type T_PasswordSafeVisualization = {
  password: string;
  passwordRepeat: string;
};

const PasswordSafeVisualization = ({
  password,
  passwordRepeat,
}: T_PasswordSafeVisualization) => {
  const { t } = useTranslation(namespaces.common);

  const isReadyToValid = password || passwordRepeat;

  const validMinLength = validStringMinLength({
    minLength: 6,
    value: password,
  });

  const validMaxLength = validStringMinAndMaxLength({
    maxLength: 40,
    minLength: 0,
    value: password,
  });

  const validUpperAndLowerCase =
    validOneUppercaseAndOneLowerCaseLetter(password);

  const validSpecialCharacter = validOneSpecialCharacter(password);

  const validPasswordAndPasswordRepeat =
    password && passwordRepeat ? password === passwordRepeat : false;

  const validNumber = validHasNumber(password);

  return (
    <Fieldset legend={t("passwordSafeVisualization.title")}>
      <List>
        <List.Item>
          <Text
            c={(() => {
              if (!isReadyToValid) {
                return;
              }
              if (validMinLength) {
                return "green";
              }
              return "red";
            })()}
            fw={isReadyToValid ? "bold" : undefined}
            pr={20}
            size="sm"
          >
            {t("passwordSafeVisualization.valid1")}
          </Text>
        </List.Item>
        <List.Item>
          <Text
            c={(() => {
              if (!isReadyToValid) {
                return;
              }
              if (validMaxLength) {
                return "green";
              }
              return "red";
            })()}
            fw={isReadyToValid ? "bold" : undefined}
            pr={20}
            size="sm"
          >
            {t("passwordSafeVisualization.valid2")}
          </Text>
        </List.Item>
        <List.Item>
          <Text
            c={(() => {
              if (!isReadyToValid) {
                return;
              }
              if (validNumber) {
                return "green";
              }
              return "red";
            })()}
            fw={isReadyToValid ? "bold" : undefined}
            pr={20}
            size="sm"
          >
            {t("passwordSafeVisualization.valid3")}
          </Text>
        </List.Item>
        <List.Item>
          <Text
            c={(() => {
              if (!isReadyToValid) {
                return;
              }
              if (validUpperAndLowerCase) {
                return "green";
              }
              return "red";
            })()}
            fw={isReadyToValid ? "bold" : undefined}
            pr={20}
            size="sm"
          >
            {t("passwordSafeVisualization.valid4")}
          </Text>
        </List.Item>
        <List.Item>
          <Text
            c={(() => {
              if (!isReadyToValid) {
                return;
              }
              if (validSpecialCharacter) {
                return "green";
              }
              return "red";
            })()}
            fw={isReadyToValid ? "bold" : undefined}
            pr={20}
            size="sm"
            withTextsToUi
          >
            {t("passwordSafeVisualization.valid5")}
          </Text>
        </List.Item>
        <List.Item>
          <Text
            c={(() => {
              if (!isReadyToValid) {
                return;
              }
              if (validPasswordAndPasswordRepeat) {
                return "green";
              }
              return "red";
            })()}
            fw={isReadyToValid ? "bold" : undefined}
            pr={20}
            size="sm"
          >
            {t("passwordSafeVisualization.valid6")}
          </Text>
        </List.Item>
        <Text fw="bold" pt={4} size="sm">
          {t("passwordSafeVisualization.description")}
        </Text>
      </List>
    </Fieldset>
  );
};

export default memo(PasswordSafeVisualization);
