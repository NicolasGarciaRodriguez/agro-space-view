"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { NdviAnalysisMetadataDTO } from "@agrospace/shared/dtos/Ndvi.dto";
import type {
  CadastralParcelDTO,
  LonLat,
} from "@agrospace/shared/dtos/Catastro.dto";

interface NdviMapProps {
  parcel: CadastralParcelDTO;
  ndvi?: {
    imageUrl: string;
    metadata: NdviAnalysisMetadataDTO;
  };
}

const NDVI_SOURCE_ID = "ndvi-source";
const NDVI_LAYER_ID = "ndvi-layer";
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

export const NdviMap = ({ parcel, ndvi }: NdviMapProps) => {
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

      if (map.current.getLayer(NDVI_LAYER_ID)) {
        map.current.removeLayer(NDVI_LAYER_ID);
      }
      if (map.current.getSource(NDVI_SOURCE_ID)) {
        map.current.removeSource(NDVI_SOURCE_ID);
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
    if (!map.current || !ndvi) return;

    const addNdviLayer = () => {
      if (!map.current || !ndvi) return;

      if (!map.current.getSource(PARCEL_SOURCE_ID)) {
        setTimeout(addNdviLayer, 150);
        return;
      }

      const existing = map.current.getSource(NDVI_SOURCE_ID);

      if (existing) {
        (existing as maplibregl.ImageSource).updateImage({
          url: ndvi.imageUrl,
          coordinates: bboxToCorners(ndvi.metadata.bbox),
        });
        return;
      }

      map.current.addSource(NDVI_SOURCE_ID, {
        type: "image",
        url: ndvi.imageUrl,
        coordinates: bboxToCorners(ndvi.metadata.bbox),
      });

      map.current.addLayer(
        {
          id: NDVI_LAYER_ID,
          type: "raster",
          source: NDVI_SOURCE_ID,
          paint: { "raster-opacity": 0.75 },
        },
        PARCEL_FILL_LAYER_ID,
      );
    };

    setTimeout(addNdviLayer, 300);
  }, [ndvi]);

  return (
    <div
      ref={mapContainer}
      className="h-[480px] w-full overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800"
    />
  );
};
