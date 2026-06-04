"use client";

export interface DateRangeValue {
  dateFrom: string;
  dateTo: string;
}

interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  disabled?: boolean;
}

export const DateRangePicker = ({
  value,
  onChange,
  disabled,
}: DateRangePickerProps) => {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm text-neutral-500 dark:text-neutral-400">
          Desde
        </label>
        <input
          type="date"
          value={value.dateFrom}
          max={value.dateTo}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value })}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-sm text-neutral-500 dark:text-neutral-400">
          Hasta
        </label>
        <input
          type="date"
          value={value.dateTo}
          min={value.dateFrom}
          max={today}
          disabled={disabled}
          onChange={(e) => onChange({ ...value, dateTo: e.target.value })}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-60 dark:border-neutral-700 dark:bg-neutral-900"
        />
      </div>
    </div>
  );
};
