import dayjs from "dayjs";
import { useTranslation } from "react-i18next";

import { namespaces } from "~/constants/namespaces";
import { E_Routes } from "~/constants/routes";
import { dynamic } from "~/hoc/dynamic";
import { useLocalizedRoute } from "~/hooks/useLocalizedRoute";
import { formNames } from "~/lib/zodFormValidator";
import type { T_Bug } from "~/models/bug";
import { Button } from "~/ui/Button";
import { ButtonArrowLeft } from "~/ui/ButtonArrowLeft";
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
};

export const ReusableBugDetailsPage = ({
  bug,
  isAdmin = false,
  isCompany = false,
}: T_ReusableBugDetailsPage) => {
  const { t: tQuestions } = useTranslation(namespaces.questions);
  const { t } = useTranslation(namespaces.accountBugDetails);
  const { getLocalizedRoute } = useLocalizedRoute();

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
