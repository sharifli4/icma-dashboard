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

  const url = `${baseUrl}${path}`;
  const maskedKey = apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : "NOT SET";
  
  console.log(`[luhive] Fetching: ${url}`);
  console.log(`[luhive] API Key: ${maskedKey}`);

  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
    },
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error(`[luhive] Error ${response.status}: ${response.statusText}`);
    console.error(`[luhive] Response body: ${errorBody}`);
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
