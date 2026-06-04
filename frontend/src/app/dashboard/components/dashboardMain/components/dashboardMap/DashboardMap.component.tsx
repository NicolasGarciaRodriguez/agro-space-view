"use client";

import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { ParcelaDTO, LonLat } from "@agrospace/shared/dtos/Parcela.dto";
import styles from "./DashboardMap.module.scss";
import { DashboardMapProps } from "./DashboardMap.interface";

const toGeoJSONCollection = (
  parcelas: ParcelaDTO[],
): GeoJSON.FeatureCollection<GeoJSON.Polygon> => ({
  type: "FeatureCollection",
  features: parcelas.map((p) => ({
    type: "Feature",
    properties: { id: p._id, nombre: p.nombre, cultivo: p.cultivo },
    geometry: { type: "Polygon", coordinates: [p.polygon] },
  })),
});

const calcCenter = (parcelas: ParcelaDTO[]): LonLat => {
  const lons = parcelas.map((p) => p.center[0]);
  const lats = parcelas.map((p) => p.center[1]);
  return [
    (Math.min(...lons) + Math.max(...lons)) / 2,
    (Math.min(...lats) + Math.max(...lats)) / 2,
  ];
};

const SOURCE_ID = "parcelas-source";
const FILL_LAYER = "parcelas-fill";
const LINE_LAYER = "parcelas-line";

export const DashboardMap = ({ parcelas }: DashboardMapProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);

  useEffect(() => {
    if (!containerRef.current || map.current || parcelas.length === 0) return;

    const center = calcCenter(parcelas);

    map.current = new maplibregl.Map({
      container: containerRef.current,
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
      center,
      zoom: 12,
    });

    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    map.current.on("load", () => {
      if (!map.current) return;

      map.current.addSource(SOURCE_ID, {
        type: "geojson",
        data: toGeoJSONCollection(parcelas),
      });

      map.current.addLayer({
        id: FILL_LAYER,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": "#4ade80",
          "fill-opacity": 0.15,
        },
      });

      map.current.addLayer({
        id: LINE_LAYER,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": "#4ade80",
          "line-width": 2,
        },
      });

      map.current.on("click", FILL_LAYER, (e) => {
        if (!e.features?.length || !map.current) return;
        const props = e.features[0].properties;
        new maplibregl.Popup()
          .setLngLat(e.lngLat)
          .setHTML(
            `<strong>${props.nombre}</strong>${props.cultivo ? `<br/>${props.cultivo}` : ""}`,
          )
          .addTo(map.current);
      });

      map.current.on("mouseenter", FILL_LAYER, () => {
        if (map.current) map.current.getCanvas().style.cursor = "pointer";
      });
      map.current.on("mouseleave", FILL_LAYER, () => {
        if (map.current) map.current.getCanvas().style.cursor = "";
      });
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current?.isStyleLoaded()) return;
    const source = map.current.getSource(SOURCE_ID) as maplibregl.GeoJSONSource;
    if (source) source.setData(toGeoJSONCollection(parcelas));
  }, [parcelas]);

  return (
    <div className={styles.mapWrapper}>
      <div ref={containerRef} className={styles.map} />
    </div>
  );
};
