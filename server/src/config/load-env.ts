import { config } from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const serverRoot = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../..",
);

const envFile = process.env.ENV_FILE ?? ".env";
config({ path: resolve(serverRoot, envFile) });
