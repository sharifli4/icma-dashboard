import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

let client: S3Client | null = null;

function getClient(): S3Client {
  if (!client) {
    client = new S3Client({
      region: getRequiredEnv("S3_REGION"),
      endpoint: getRequiredEnv("S3_ENDPOINT"),
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
      credentials: {
        accessKeyId: getRequiredEnv("S3_ACCESS_KEY_ID"),
        secretAccessKey: getRequiredEnv("S3_SECRET_ACCESS_KEY"),
      },
    });
  }
  return client;
}

function resolvePublicUrl(objectKey: string): string {
  const endpoint = getRequiredEnv("S3_ENDPOINT");
  const bucket = getRequiredEnv("S3_BUCKET");
  const publicBase = process.env.S3_PUBLIC_BASE_URL;
  const base = publicBase
    ? publicBase.replace(/\/+$/, "")
    : `${endpoint.replace(/\/+$/, "")}/${bucket}`;
  return `${base}/${objectKey}`;
}

export async function putObject(params: {
  objectKey: string;
  body: Buffer;
  contentType: string;
}): Promise<{ objectKey: string; publicUrl: string }> {
  const bucket = getRequiredEnv("S3_BUCKET");

  await getClient().send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: params.objectKey,
      Body: params.body,
      ContentType: params.contentType,
    })
  );

  return {
    objectKey: params.objectKey,
    publicUrl: resolvePublicUrl(params.objectKey),
  };
}
