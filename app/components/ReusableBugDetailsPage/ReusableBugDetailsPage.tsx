import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { formNames } from "~/lib/zodFormValidator";
import type { T_Bug } from "~/models/bug";
import type { T_PlatformSetting } from "~/models/platformSetting";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
import { generatePointsFromStatus } from "~/ui/CardBug";
import { Checkbox } from "~/ui/Checkbox";
import { DateTimePicker } from "~/ui/DateTimePicker";
import { Input } from "~/ui/Input";
import { InputWrapper } from "~/ui/InputWrapper";
import { Link } from "~/ui/Link";
import { Section } from "~/ui/Section";
import { SelectBugEnvironment } from "~/ui/SelectBugEnvironment";
import { SelectBugPriority } from "~/ui/SelectBugPriority";
import { SelectBugStatus } from "~/ui/SelectBugStatus";
import { Textarea } from "~/ui/Textarea";

const ModalCarouselImages = dynamic(() =>
  import("~/ui/ModalCarouselImages").then(module => ({
    default: module.ModalCarouselImages,
  })),
);

const ModalCarouselVideos = dynamic(() =>
  import("~/ui/ModalCarouselVideos").then(module => ({
    default: module.ModalCarouselVideos,
  })),
);

type T_ReusableBugDetailsPage = {
  bug: T_Bug;
  isAdmin?: boolean;
  isCompany?: boolean;
  platformSetting: T_PlatformSetting;
};

export const ReusableBugDetailsPage = ({
  bug,
  isAdmin = false,
  isCompany = false,
  platformSetting,
}: T_ReusableBugDetailsPage) => {
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t } = useTranslation(namespaces.accountBugDetails);
  const { getLocalizedRoute } = useLocalizedRoute();

  const generatedPoints =
    bug.companyId && bug.priority
      ? generatePointsFromStatus({
          bug,
          platformSetting,
        })
      : null;

  const breadcrumbs: E_Routes[] = (() => {
    if (isCompany) {
      return [
        E_Routes.home,
        E_Routes.company,
        E_Routes.companyBugs,
        E_Routes.companyBugDetails,
      ];
    }

    if (isAdmin) {
      return [
        E_Routes.home,
        E_Routes.admin,
        E_Routes.adminBugs,
        E_Routes.adminBugDetails,
      ];
    }

    return [
      E_Routes.home,
      E_Routes.account,
      E_Routes.accountBugs,
      E_Routes.accountBugDetails,
    ];
  })();

  const routeTo: E_Routes = (() => {
    if (isCompany) {
      return E_Routes.companyBugs;
    }

    if (isAdmin) {
      return E_Routes.adminBugs;
    }

    return E_Routes.accountBugs;
  })();

  const pageMetaRoute: E_Routes = (() => {
    if (isCompany) {
      return E_Routes.companyBugDetails;
    }

    if (isAdmin) {
      return E_Routes.adminBugDetails;
    }

    return E_Routes.accountBugDetails;
  })();

  return (
    <Section
      breadcrumbs={breadcrumbs}
      buttons={
        <>
          <ButtonArrowLeft routeTo={routeTo} textGoBack />
          {isAdmin && (
            <Link
              fullWidthOnMobile
              to={`${getLocalizedRoute({
                extraPath: `/${bug.id}`,
                route: E_Routes.adminBugEdit,
              })}`}
            >
              <Button>{t("buttonEdit")}</Button>
            </Link>
          )}
        </>
      }
      pageMeta={{
        route: pageMetaRoute,
      }}
      questions={[
        {
          description: tQuestions(
            "accountBugDetails.whenPointsPaid.description",
          ),
          title: tQuestions("accountBugDetails.whenPointsPaid.title"),
        },
      ]}
      size="md"
      success={bug?.companyId && bug?.pointsPaidAt ? t("success") : undefined}
      title={t("title")}
      warning={bug?.answer ? t("warning") : undefined}
      withHTML={false}
      withTextsToUi
    >
      <InputWrapper>
        <SelectBugStatus
          defaultValue={bug.status ?? ""}
          disabled
          disabledWithOpacity={false}
          required={false}
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
        <ModalCarouselImages button={t("showImages")} urls={bug.images ?? []} />
        <ModalCarouselVideos
          button={t("showVideo")}
          urls={bug.video ? [bug.video] : []}
        />
        <SelectBugPriority
          defaultValue={bug.priority ?? ""}
          disabled
          disabledWithOpacity={false}
          required={false}
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
                bug.pointsPaidAt ? dayjs(bug.pointsPaidAt).toDate() : undefined
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
          name={formNames.bugDescription}
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
          defaultValue={bug.answer ?? t("noAnswer")}
          disabled
          disabledWithOpacity={false}
          maxLength={null}
          name={formNames.bugAnswer}
          required={false}
          withoutDescription
        />
      </InputWrapper>
    </Section>
  );
};
