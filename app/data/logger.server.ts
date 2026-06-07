type LogLevel = "debug" | "error" | "info" | "warn";

type LogPayload = Record<string, unknown>;

function formatMessage(level: LogLevel, message: string, payload?: LogPayload) {
  const timestamp = new Date().toISOString();
  const base = { level, message, timestamp };

  if (payload?.error instanceof Error) {
    return {
      ...base,
      ...payload,
      error: {
        message: payload.error.message,
        name: payload.error.name,
        stack: payload.error.stack,
      },
    };
  }

  return payload ? { ...base, ...payload } : base;
}

function log(level: LogLevel, message: string, payload?: LogPayload) {
  if (process.env.NODE_ENV === "test") {
    return;
  }

  const data = formatMessage(level, message, payload);

  switch (level) {
    case "error": {
      console.error(JSON.stringify(data));
      break;
    }
    case "warn": {
      console.warn(JSON.stringify(data));
      break;
    }
    case "debug": {
      if (process.env.NODE_ENV !== "production") {
        // eslint-disable-next-line no-console
        console.debug(JSON.stringify(data));
      }
      break;
    }
    default: {
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(data));
    }
  }
}

export const logger = {
  debug: (message: string, payload?: LogPayload) =>
    log("debug", message, payload),
  error: (message: string, payload?: LogPayload) =>
    log("error", message, payload),
  info: (message: string, payload?: LogPayload) =>
    log("info", message, payload),
  warn: (message: string, payload?: LogPayload) =>
    log("warn", message, payload),
};
