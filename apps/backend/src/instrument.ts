import * as Sentry from "@sentry/node";

const dsn = process.env.SENTRY_DSN;


if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.SENTRY_ENVIRONMENT ?? "development",
    release: process.env.SENTRY_RELEASE, // opcionális
    tracesSampleRate: 0, // most elég error monitoring, később lehet 0.1
  });

  console.log("[sentry] initialized");
} else {
  console.log("[sentry] SENTRY_DSN missing -> disabled");
}

export { Sentry };
