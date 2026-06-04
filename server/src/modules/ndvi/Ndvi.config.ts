export const NDVI_ROUTE_PREFIX = "/api/ndvi" as const;

export const SENTINEL_HUB_PROCESS_URL =
  "https://sh.dataspace.copernicus.eu/api/v1/process" as const;

export const SENTINEL_HUB_STATISTICS_URL =
  "https://sh.dataspace.copernicus.eu/api/v1/statistics" as const;

export const NDVI_OUTPUT = {
  width: 512,
  height: 512,
  format: "image/png",
} as const;

export const NDVI_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: { bands: 4 }
  };
}
function evaluatePixel(s) {
  const ndvi = (s.B08 - s.B04) / (s.B08 + s.B04);

  if (s.dataMask === 0) return [0, 0, 0, 0];

  if (ndvi < 0)   return [0.5, 0.5, 0.5, 1];
  if (ndvi < 0.2) return [0.9, 0.2, 0.2, 1];
  if (ndvi < 0.4) return [0.9, 0.7, 0.1, 1];
  if (ndvi < 0.6) return [0.6, 0.9, 0.1, 1];
  return             [0.1, 0.6, 0.1, 1];
}
` as const;

export const NDVI_STATISTICS_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: [{ bands: ["B04", "B08", "dataMask"] }],
    output: [
      { id: "ndvi", bands: 1 },
      { id: "dataMask", bands: 1 }
    ]
  };
}
function evaluatePixel(s) {
  return {
    ndvi: [(s.B08 - s.B04) / (s.B08 + s.B04)],
    dataMask: [s.dataMask]
  };
}
` as const;
