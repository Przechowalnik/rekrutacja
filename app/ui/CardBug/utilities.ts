import type { T_Bug } from "~/models/bug";
import { E_BugPriority, E_BugStatus } from "~/models/enums";
import type { T_PlatformSetting } from "~/models/platformSetting";

export const generateColor = (bug: T_Bug) => {
  switch (bug.status) {
    case E_BugStatus.REPORTED: {
      return "gray";
    }

    case E_BugStatus.REJECTED: {
      return "red";
    }

    case E_BugStatus.DUPLICATE: {
      return "red";
    }

    case E_BugStatus.IN_PROGRESS: {
      return "blue";
    }

    case E_BugStatus.RESOLVED: {
      return "green";
    }

    default: {
      return "gray";
    }
  }
};

export const generatePointsFromStatus = ({
  bug,
  platformSetting,
}: {
  bug: T_Bug;
  platformSetting: T_PlatformSetting;
}) => {
  switch (bug.priority) {
    case E_BugPriority.BIG: {
      return platformSetting.pointsBigBug;
    }

    case E_BugPriority.MEDIUM: {
      return platformSetting.pointsMediumBug;
    }
    case E_BugPriority.SMALL: {
      return platformSetting.pointsSmallBug;
    }

    default: {
      return 0;
    }
  }
};
