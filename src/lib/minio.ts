import * as Minio from "minio";

const minioEndpoint = process.env.MINIO_ENDPOINT || "localhost";
const minioPort = parseInt(process.env.MINIO_PORT || "9000");
const minioUseSSL = process.env.MINIO_USE_SSL === "true";

let minioClientInstance: Minio.Client | null = null;

function getMinioClient(): Minio.Client {
  if (!minioClientInstance) {
    minioClientInstance = new Minio.Client({
      endPoint: minioEndpoint,
      port: minioPort,
      useSSL: minioUseSSL,
      accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
      secretKey: process.env.MINIO_SECRET_KEY || "minioadmin",
    });
  }
  return minioClientInstance;
}

export const BUCKET_NAME = process.env.MINIO_BUCKET || "sunrinsecurity";

export async function ensureBucket() {
  const client = getMinioClient();
  const exists = await client.bucketExists(BUCKET_NAME);
  if (!exists) {
    await client.makeBucket(BUCKET_NAME);
    const policy = {
      Version: "2012-10-17",
      Statement: [
        {
          Effect: "Allow",
          Principal: { AWS: ["*"] },
          Action: ["s3:GetObject"],
          Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
        },
      ],
    };
    await client.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
  }
}

export async function uploadFile(
  file: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  await ensureBucket();
  const client = getMinioClient();
  const objectName = `${Date.now()}-${filename}`;
  await client.putObject(BUCKET_NAME, objectName, file, file.length, {
    "Content-Type": contentType,
  });
  // 상대 경로로 반환 - 브라우저와 서버 모두에서 작동
  return `/storage/${objectName}`;
}

export async function deleteFile(objectName: string): Promise<void> {
  const client = getMinioClient();
  await client.removeObject(BUCKET_NAME, objectName);
}
