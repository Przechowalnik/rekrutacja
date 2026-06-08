import type { T_Bug } from "~/models/bug";
import { E_BugStatus } from "~/models/enums";

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
