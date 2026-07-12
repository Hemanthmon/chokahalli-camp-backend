// Shared between the HTTP CORS middleware and the Socket.IO server so the
// two never drift apart. Any localhost port is allowed for local dev
// (Vite bumps ports when one is busy); production is the deployed
// frontend only.
const ALLOWED_ORIGINS: (string | RegExp)[] = [
  "https://eye-camp-frontend.vercel.app",
  /^http:\/\/localhost:\d+$/,
];

export const isOriginAllowed = (origin: string | undefined): boolean => {
  // No Origin header means a non-browser request (curl, server-to-server,
  // uptime checks) — CORS is a browser-enforced mechanism, so there's
  // nothing to restrict here.
  if (!origin) {
    return true;
  }

  return ALLOWED_ORIGINS.some((allowed) =>
    typeof allowed === "string" ? allowed === origin : allowed.test(origin)
  );
};
