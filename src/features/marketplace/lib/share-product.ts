export type ShareOutcome = "shared" | "copied" | "cancelled" | "unavailable";

export type ShareProductPayload = {
  title: string;
  text: string;
  url: string;
};

export type ShareEnvironment = {
  share?: (payload: ShareProductPayload) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
};

function browserCapabilities(): ShareEnvironment {
  if (typeof navigator === "undefined") return {};

  const capabilities: ShareEnvironment = {};
  if (typeof navigator.share === "function") capabilities.share = (payload) => navigator.share(payload);
  if (typeof navigator.clipboard?.writeText === "function") capabilities.writeText = (text) => navigator.clipboard.writeText(text);
  return capabilities;
}

function isShareCancellation(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

export async function shareProduct(payload: ShareProductPayload, environment: ShareEnvironment = browserCapabilities()): Promise<ShareOutcome> {
  if (environment.share) {
    try {
      await environment.share(payload);
      return "shared";
    } catch (error) {
      if (isShareCancellation(error)) return "cancelled";
    }
  }

  if (environment.writeText) {
    try {
      await environment.writeText(payload.url);
      return "copied";
    } catch {
      // A failed clipboard write has no additional browser capability to try.
    }
  }

  return "unavailable";
}
