declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: string;
    NODE_ENV: "development" | "production" | "test";
    CORS_ORIGIN?: string;

    MONGODB_URI: string;

    JWT_SECRET: string;

    COPERNICUS_CLIENT_ID: string;
    COPERNICUS_CLIENT_SECRET: string;

    AWS_ACCESS_KEY_ID: string;
    AWS_SECRET_ACCESS_KEY: string;
    AWS_REGION: string;
    AWS_S3_BUCKET: string;

    API_URL?: string;
  }
}
