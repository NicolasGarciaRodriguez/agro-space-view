import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET = process.env.AWS_S3_BUCKET;

export interface UploadResult {
  url: string;
  key: string;
}

const uploadBuffer = async (
  buffer: Buffer,
  key: string,
  contentType: string = "image/png",
): Promise<UploadResult> => {
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    }),
  );

  const url = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

  return { url, key };
};

const generateNdviKey = (
  parcelaId: string,
  dateFrom: string,
  dateTo: string,
): string => {
  const timestamp = Date.now();
  return `ndvi/${parcelaId}/${dateFrom}_${dateTo}_${timestamp}.png`;
};

export const S3Service = {
  uploadBuffer,
  generateNdviKey,
};
