import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
} from "@aws-sdk/client-s3";

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

const generateKey = (
  tipo: string,
  parcelaId: string,
  dateFrom: string,
  dateTo: string,
): string => {
  const timestamp = Date.now();
  return `${tipo}/${parcelaId}/${dateFrom}_${dateTo}_${timestamp}.png`;
};

// Extrae la key de S3 a partir de la URL pública guardada en Mongo,
// ya que solo guardamos la URL completa, no la key por separado.
const keyFromUrl = (url: string): string | null => {
  const prefix = `https://${BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/`;
  if (!url.startsWith(prefix)) return null;
  return url.slice(prefix.length);
};

const deleteObject = async (key: string): Promise<void> => {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }));
};

// Borrado múltiple: más eficiente que llamar deleteObject en bucle
// cuando hay muchos análisis (una sola llamada a S3 hasta 1000 keys).
const deleteObjects = async (keys: string[]): Promise<void> => {
  if (keys.length === 0) return;

  await s3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: {
        Objects: keys.map((Key) => ({ Key })),
      },
    }),
  );
};

export const S3Service = {
  uploadBuffer,
  generateKey,
  keyFromUrl,
  deleteObject,
  deleteObjects,
};