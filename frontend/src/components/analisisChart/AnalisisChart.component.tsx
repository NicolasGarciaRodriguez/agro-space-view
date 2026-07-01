// AnalisisChart.component.tsx
"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type {
  TimeSeriesPointDTO,
  IndiceDefinitionDTO,
} from "@agrospace/shared/dtos/Analisis.dto";

interface AnalisisChartProps {
  points: TimeSeriesPointDTO[];
  indice: IndiceDefinitionDTO;
}

const formatDate = (date: string): string => {
  const d = new Date(date);
  return d.toLocaleDateString("es-ES", { month: "short", year: "2-digit" });
};

const formatValue = (value: number): string => value.toFixed(3);

// Busca en los ranges del índice el color y label correspondientes a un valor
const getRangeFor = (value: number, indice: IndiceDefinitionDTO) =>
  indice.ranges.find((r) => value >= r.min && value < r.max) ??
  indice.ranges[indice.ranges.length - 1];

export const AnalisisChart = ({ points, indice }: AnalisisChartProps) => {
  if (points.length === 0) {
    return (
      <div className="flex h-48 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 text-sm text-neutral-500 dark:border-neutral-800 dark:bg-neutral-950">
        No hay datos de serie temporal disponibles
      </div>
    );
  }

  const meanValue = points.reduce((a, b) => a + b.mean, 0) / points.length;
  const color = getRangeFor(meanValue, indice).color;

  const data = points.map((p) => ({
    date: formatDate(p.date),
    mean: p.mean,
    min: p.min,
    max: p.max,
  }));

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <h3 className="mb-4 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Evolución {indice.label}
      </h3>
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 4, right: 8, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="analisisGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            domain={[-1, 1]}
            tick={{ fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatValue}
            width={40}
          />
          <Tooltip
            formatter={(value) => [
              typeof value === "number" ? formatValue(value) : "—",
              `${indice.label} medio`,
            ]}
            labelStyle={{ fontSize: 12 }}
            contentStyle={{
              fontSize: 12,
              borderRadius: 8,
              border: "0.5px solid #e5e7eb",
            }}
          />
          <Area
            type="monotone"
            dataKey="mean"
            stroke={color}
            strokeWidth={2}
            fill="url(#analisisGradient)"
            dot={{ r: 4, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      <div className="mt-3 flex items-center justify-between text-xs text-neutral-500">
        <span>
          {indice.label} medio del período:{" "}
          <strong>{formatValue(meanValue)}</strong>
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {indice.ranges.map((r) => (
            <span key={r.label} className="flex items-center gap-1">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: r.color }}
              />
              {r.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
