import type { SearchImagesParamsDTO } from "@agrospace/shared/dtos/Stac.dto";
import type { DateRangeValue } from "@/components/dateRangePicker/DateRangePicker.component";

export const MIN_CATASTRO_REF_LENGTH = 14;

export const STAC_DEMO_SEARCH: SearchImagesParamsDTO = {
  bbox: "-6.0,37.3,-5.8,37.5",
  dateFrom: "2024-06-01",
  dateTo: "2024-06-30",
  maxCloud: 20,
};

const now = new Date();
const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

export const DEFAULT_DATE_RANGE: DateRangeValue = {
  dateFrom: firstOfLastMonth.toISOString().split("T")[0],
  dateTo: lastOfLastMonth.toISOString().split("T")[0],
};
