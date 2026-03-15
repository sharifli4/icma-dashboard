import { NextRequest } from "next/server";

export function verifyHackathonAdmin(request: NextRequest): { ok: true } | { ok: false; message: string; status: number } {
  const configuredKey = process.env.HACKATHON_ADMIN_API_KEY;

  if (!configuredKey) {
    return { ok: false, message: "Admin API key is not configured", status: 500 };
  }

  const providedKey = request.headers.get("x-admin-api-key");
  if (!providedKey || providedKey !== configuredKey) {
    return { ok: false, message: "Unauthorized", status: 401 };
  }

  return { ok: true };
}
