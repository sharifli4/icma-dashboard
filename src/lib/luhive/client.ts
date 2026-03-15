import type {
  LuhiveCommunity,
  LuhiveEvent,
  LuhiveSuccessResponse,
  LuhiveErrorResponse,
} from "./types";

function getConfig() {
  const apiKey = process.env.LUHIVE_API_KEY;
  if (!apiKey) {
    throw new Error("LUHIVE_API_KEY environment variable is not set");
  }
  const baseUrl =
    process.env.LUHIVE_API_BASE_URL || "https://api.luhive.com";
  return { apiKey, baseUrl };
}

async function fetchFromLuhive<T>(
  path: string
): Promise<LuhiveSuccessResponse<T> | LuhiveErrorResponse> {
  const { apiKey, baseUrl } = getConfig();

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    return {
      success: false,
      error: `Luhive API returned ${response.status}: ${response.statusText}`,
    };
  }

  return response.json();
}

export async function fetchCommunities() {
  return fetchFromLuhive<LuhiveCommunity>("/api/communities");
}

export async function fetchUpcomingEvents() {
  return fetchFromLuhive<LuhiveEvent>("/api/events/upcoming");
}
