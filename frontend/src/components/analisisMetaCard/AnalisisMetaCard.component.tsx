"use client";

import type { AnalysisMetadataDTO } from "@agrospace/shared/dtos/Analisis.dto";

interface AnalisisMetadataCardProps {
  metadata: AnalysisMetadataDTO;
}

const formatDate = (isoDate: string): string => {
  return new Date(isoDate).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const cloudCoverColor = (cover: number): string => {
  if (cover < 5) return "text-emerald-600 dark:text-emerald-400";
  if (cover < 20) return "text-amber-600 dark:text-amber-400";
  return "text-red-600 dark:text-red-400";
};

export const AnalisisMetadataCard = ({
  metadata,
}: AnalisisMetadataCardProps) => {
  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 dark:border-neutral-800 dark:bg-neutral-950">
      <h2 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        Imagen utilizada
      </h2>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <dt className="text-neutral-500">Fecha</dt>
        <dd className="font-medium">{formatDate(metadata.usedImageDate)}</dd>

        <dt className="text-neutral-500">Nubosidad</dt>
        <dd className={`font-medium ${cloudCoverColor(metadata.cloudCover)}`}>
          {metadata.cloudCover.toFixed(2)}%
        </dd>

        <dt className="text-neutral-500">ID producto</dt>
        <dd className="truncate font-mono text-xs text-neutral-600 dark:text-neutral-400">
          {metadata.usedImageId}
        </dd>

        <dt className="text-neutral-500">BBox</dt>
        <dd className="font-mono text-xs text-neutral-600 dark:text-neutral-400">
          {metadata.bbox.join(", ")}
        </dd>
      </dl>
    </div>
  );
};
