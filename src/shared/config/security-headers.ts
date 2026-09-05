export const SECURITY_HEADERS = Object.freeze([
  Object.freeze({ key: "X-Content-Type-Options", value: "nosniff" }),
  Object.freeze({ key: "Referrer-Policy", value: "strict-origin-when-cross-origin" }),
  Object.freeze({ key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" }),
  Object.freeze({
    key: "Content-Security-Policy",
    value: "default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'; connect-src 'self'; font-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';",
  }),
] as const);

const SCRIPT_SOURCE_POLICY = "script-src 'self' 'unsafe-inline'";

export function getSecurityHeaders(environment = process.env.NODE_ENV) {
  if (environment !== "development") {
    return SECURITY_HEADERS;
  }

  return SECURITY_HEADERS.map((header) =>
    header.key === "Content-Security-Policy"
      ? {
          ...header,
          value: header.value.replace(
            SCRIPT_SOURCE_POLICY,
            `${SCRIPT_SOURCE_POLICY} 'unsafe-eval'`,
          ),
        }
      : header,
  );
}
