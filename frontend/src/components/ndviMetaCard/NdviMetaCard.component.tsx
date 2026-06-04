"use client";

import type { NdviAnalysisMetadataDTO } from "@agrospace/shared/dtos/Ndvi.dto";

interface NdviMetadataCardProps {
  metadata: NdviAnalysisMetadataDTO;
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

export const NdviMetadataCard = ({ metadata }: NdviMetadataCardProps) => {
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

      <div className="mt-4 flex items-center gap-3 text-xs text-neutral-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-green-600"></span>
          Vegetación sana
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400"></span>
          Moderada
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-red-600"></span>
          Estrés / suelo
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-3 w-3 rounded-sm bg-gray-400"></span>
          Agua / urbano
        </span>
      </div>
    </div>
  );
};
