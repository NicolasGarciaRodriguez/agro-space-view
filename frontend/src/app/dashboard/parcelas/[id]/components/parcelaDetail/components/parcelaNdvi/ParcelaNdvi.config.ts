import type { DateRangeValue } from "@/components/dateRangePicker/DateRangePicker.component";

const now = new Date();
const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const lastOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

export const DEFAULT_DATE_RANGE: DateRangeValue = {
  dateFrom: firstOfLastMonth.toISOString().split("T")[0],
  dateTo: lastOfLastMonth.toISOString().split("T")[0],
};
