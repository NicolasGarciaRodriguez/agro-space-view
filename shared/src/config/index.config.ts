import localConfig from "./local.config.json" with { type: "json" };
import productionConfig from "./prod.config.json" with { type: "json" };

interface ConfigInterface {
  API_URL: string;
}

const baseConfig =
  process.env.NEXT_PUBLIC_ENV === "prod" ? productionConfig : localConfig;

const config: ConfigInterface = {
  ...baseConfig,
  ...(process.env.NEXT_PUBLIC_API_URL
    ? { API_URL: process.env.NEXT_PUBLIC_API_URL }
    : {}),
};

export default config;
