import { AxiosError } from "axios";

/**
 * Extracts a human-readable message from a DRF error
 * response. Handles:
 * - string bodies (plain-text/HTML 500 responses)
 * - {detail: "..."} and {message: "..."}
 * - field errors: {email: ["..."]} or {email: "..."}
 * - nested field errors one level deep
 */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (!(error instanceof AxiosError)) {
    return fallback;
  }

  // Network error: no response at all (backend down, CORS, etc.)
  if (!error.response) {
    return "Cannot reach the server. Is the backend running?";
  }

  const { data, status } = error.response;

  // Server crashed or returned non-JSON
  if (typeof data === "string" || data == null) {
    if (status >= 500) {
      return "Server error. Please try again later.";
    }
    return fallback;
  }

  const message = extractMessage(data);

  return message ?? fallback;
}

function extractMessage(value: unknown): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = extractMessage(item);
      if (found) return found;
    }
    return null;
  }

  if (typeof value === "object" && value !== null) {
    const record = value as Record<string, unknown>;

    // Prefer explicit keys
    if (typeof record.detail === "string") {
      return record.detail;
    }

    if (typeof record.message === "string") {
      return record.message;
    }

    for (const [key, entry] of Object.entries(record)) {
      const found = extractMessage(entry);

      if (found) {
        // Prefix with the field name for field errors
        const isFieldKey =
          key !== "detail" &&
          key !== "message" &&
          key !== "non_field_errors" &&
          key !== "error";

        return isFieldKey
          ? `${formatFieldName(key)}: ${found}`
          : found;
      }
    }
  }

  return null;
}

function formatFieldName(key: string): string {
  const name = key.replace(/_/g, " ");

  return name.charAt(0).toUpperCase() + name.slice(1);
}
