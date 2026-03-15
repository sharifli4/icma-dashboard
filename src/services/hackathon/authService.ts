import { HACKATHON_ADMIN_HEADER } from "@/shared/hackathon/constants";
import { HackathonServiceError } from "./errors";

export function verifyHackathonAdmin(providedApiKey: string | null): void {
  const configuredKey = process.env.HACKATHON_ADMIN_API_KEY;
  if (!configuredKey) {
    throw new HackathonServiceError("Admin API key is not configured", 500);
  }

  if (!providedApiKey || providedApiKey !== configuredKey) {
    throw new HackathonServiceError("Unauthorized", 401);
  }
}

export function readHackathonAdminHeader(request: Request): string | null {
  return request.headers.get(HACKATHON_ADMIN_HEADER);
}
