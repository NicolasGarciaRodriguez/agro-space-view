import HttpService, { getBaseUrl } from "../services/Http.service.js";

const BASE = () => `${getBaseUrl()}/api/cuaderno/export`;

const extractFilename = (response: Response, fallback: string): string => {
  const disposition = response.headers.get("Content-Disposition");
  const match = disposition?.match(/filename="(.+)"/);
  return match?.[1] ?? fallback;
};

const triggerDownload = async (response: Response, fallbackName: string) => {
  const filename = extractFilename(response, fallbackName);
  const blob = await response.blob();
  const blobUrl = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = blobUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(blobUrl);
};

const exportParcela = async (
  parcelaId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await HttpService.getBlob(`${BASE()}/parcela/${parcelaId}${query}`);
  await triggerDownload(response, `cuaderno_${new Date().getFullYear()}.xlsx`);
};

const exportExplotacion = async (
  explotacionId: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<void> => {
  const params = new URLSearchParams();
  if (dateFrom) params.set("dateFrom", dateFrom);
  if (dateTo) params.set("dateTo", dateTo);
  const query = params.toString() ? `?${params.toString()}` : "";

  const response = await HttpService.getBlob(`${BASE()}/explotacion/${explotacionId}${query}`);
  await triggerDownload(response, `cuaderno_explotacion_${new Date().getFullYear()}.xlsx`);
};

export const CuadernoExportRepository = { exportParcela, exportExplotacion };