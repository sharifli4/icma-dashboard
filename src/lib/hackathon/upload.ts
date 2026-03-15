import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const allowedVideoTypes = new Set(["video/mp4", "video/webm", "video/quicktime"]);

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function sanitizeFileName(fileName: string): string {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

export function validateVideoFile(file: File): { ok: true } | { ok: false; message: string; status: number } {
  const maxBytes = Number(process.env.HACKATHON_DEMO_VIDEO_MAX_BYTES ?? "104857600");

  if (!allowedVideoTypes.has(file.type)) {
    return { ok: false, message: "Unsupported demo video type", status: 400 };
  }

  if (Number.isFinite(maxBytes) && file.size > maxBytes) {
    return { ok: false, message: "Demo video exceeds size limit", status: 400 };
  }

  return { ok: true };
}

export async function uploadDemoVideo(params: {
  token: string;
  file: File;
}): Promise<{ objectKey: string; publicUrl: string }> {
  const endpoint = getRequiredEnv("S3_ENDPOINT");
  const region = getRequiredEnv("S3_REGION");
  const bucket = getRequiredEnv("S3_BUCKET");
  const accessKeyId = getRequiredEnv("S3_ACCESS_KEY_ID");
  const secretAccessKey = getRequiredEnv("S3_SECRET_ACCESS_KEY");

  const client = new S3Client({
    region,
    endpoint,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const safeName = sanitizeFileName(params.file.name || "demo-video");
  const objectKey = `hackathon/${params.token}/${randomUUID()}-${safeName}`;
  const bytes = Buffer.from(await params.file.arrayBuffer());

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: objectKey,
      Body: bytes,
      ContentType: params.file.type || "application/octet-stream",
    })
  );

  const publicBase = process.env.S3_PUBLIC_BASE_URL;
  const normalizedEndpoint = endpoint.replace(/\/+$/, "");
  const normalizedPublicBase = publicBase?.replace(/\/+$/, "");
  const base = normalizedPublicBase ?? `${normalizedEndpoint}/${bucket}`;

  return {
    objectKey,
    publicUrl: `${base}/${objectKey}`,
  };
}
