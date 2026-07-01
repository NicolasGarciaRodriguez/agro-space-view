"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { AnalysisMetadataDTO } from "@agrospace/shared/dtos/Analisis.dto";
import type {
  CadastralParcelDTO,
  LonLat,
} from "@agrospace/shared/dtos/Catastro.dto";

interface AnalisisMapProps {
  parcel: CadastralParcelDTO;
  analisis?: {
    imageUrl: string;
    metadata: AnalysisMetadataDTO;
  };
}

const ANALISIS_SOURCE_ID = "analisis-source";
const ANALISIS_LAYER_ID = "analisis-layer";
const PARCEL_SOURCE_ID = "parcel-source";
const PARCEL_FILL_LAYER_ID = "parcel-fill";
const PARCEL_LINE_LAYER_ID = "parcel-line";

const bboxToCorners = (
  bbox: [number, number, number, number],
): [[number, number], [number, number], [number, number], [number, number]] => {
  const [west, south, east, north] = bbox;
  return [
    [west, north],
    [east, north],
    [east, south],
    [west, south],
  ];
};

const toGeoJSON = (polygon: LonLat[]): GeoJSON.Feature<GeoJSON.Polygon> => ({
  type: "Feature",
  properties: {},
  geometry: {
    type: "Polygon",
    coordinates: [polygon],
  },
});

export const AnalisisMap = ({ parcel, analisis }: AnalisisMapProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          "osm-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: "© OpenStreetMap contributors",
          },
        },
        layers: [{ id: "osm-layer", type: "raster", source: "osm-tiles" }],
      },
      center: parcel.center,
      zoom: 16,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      if (!map.current) return;

      map.current.addSource(PARCEL_SOURCE_ID, {
        type: "geojson",
        data: toGeoJSON(parcel.polygon),
      });

      map.current.addLayer({
        id: PARCEL_FILL_LAYER_ID,
        type: "fill",
        source: PARCEL_SOURCE_ID,
        paint: {
          "fill-color": "#ffffff",
          "fill-opacity": 0.15,
        },
      });

      map.current.addLayer({
        id: PARCEL_LINE_LAYER_ID,
        type: "line",
        source: PARCEL_SOURCE_ID,
        paint: {
          "line-color": "#ffffff",
          "line-width": 2,
        },
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current) return;

    const updateParcel = () => {
      if (!map.current) return;

      if (map.current.getLayer(ANALISIS_LAYER_ID)) {
        map.current.removeLayer(ANALISIS_LAYER_ID);
      }
      if (map.current.getSource(ANALISIS_SOURCE_ID)) {
        map.current.removeSource(ANALISIS_SOURCE_ID);
      }

      const source = map.current.getSource(PARCEL_SOURCE_ID) as
        | maplibregl.GeoJSONSource
        | undefined;

      if (source) {
        source.setData(toGeoJSON(parcel.polygon));
        map.current.flyTo({
          center: parcel.center,
          zoom: 16,
          duration: 1000,
        });
      }
    };

    if (map.current.isStyleLoaded()) {
      updateParcel();
    } else {
      map.current.once("load", updateParcel);
    }
  }, [parcel]);

  useEffect(() => {
    if (!map.current) return;

    if (!analisis) {
      if (map.current.getLayer(ANALISIS_LAYER_ID)) {
        map.current.removeLayer(ANALISIS_LAYER_ID);
      }
      if (map.current.getSource(ANALISIS_SOURCE_ID)) {
        map.current.removeSource(ANALISIS_SOURCE_ID);
      }
      return;
    }

    const addAnalisisLayer = () => {
      if (!map.current || !analisis) return;

      if (!map.current.getSource(PARCEL_SOURCE_ID)) {
        timeoutId = setTimeout(addAnalisisLayer, 150);
        return;
      }

      const existing = map.current.getSource(ANALISIS_SOURCE_ID);

      if (existing) {
        (existing as maplibregl.ImageSource).updateImage({
          url: analisis.imageUrl,
          coordinates: bboxToCorners(analisis.metadata.bbox),
        });
        return;
      }

      map.current.addSource(ANALISIS_SOURCE_ID, {
        type: "image",
        url: analisis.imageUrl,
        coordinates: bboxToCorners(analisis.metadata.bbox),
      });

      map.current.addLayer(
        {
          id: ANALISIS_LAYER_ID,
          type: "raster",
          source: ANALISIS_SOURCE_ID,
          paint: { "raster-opacity": 0.75 },
        },
        PARCEL_FILL_LAYER_ID,
      );
    };

    let timeoutId = setTimeout(addAnalisisLayer, 300);

    // 🔑 Cancela el timeout si "analisis" cambia antes de que se dispare
    return () => clearTimeout(timeoutId);
  }, [analisis]);
  return (
    <div
      ref={mapContainer}
      className="h-[480px] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
    />
  );
};
