import { XMLParser } from "fast-xml-parser";
import { CATASTRO_CONFIG } from "./Catastro.config.js";
import {
  CatastroNotFoundError,
  CatastroParseError,
  type CadastralParcel,
  type GetParcelByRefQuery,
  type GetParcelByCoordsQuery,
  type LonLat,
} from "./Catastro.interface.js";

const parser = new XMLParser({ ignoreAttributes: false });

const parsePosList = (posList: string): LonLat[] => {
  const nums = posList.trim().split(/\s+/).map(Number);
  const coords: LonLat[] = [];

  for (let i = 0; i < nums.length; i += 2) {
    const lat = nums[i];
    const lon = nums[i + 1];
    if (lat === undefined || lon === undefined) continue;
    coords.push([lon, lat]);
  }

  return coords;
};

const calcBbox = (coords: LonLat[]): [number, number, number, number] => {
  const lons = coords.map((c) => c[0]);
  const lats = coords.map((c) => c[1]);
  return [
    Math.min(...lons),
    Math.min(...lats),
    Math.max(...lons),
    Math.max(...lats),
  ];
};

const calcCenter = (coords: LonLat[]): LonLat => {
  const bbox = calcBbox(coords);
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
};

const getRefFromCoords = async (
  query: GetParcelByCoordsQuery,
): Promise<string> => {
  const url = new URL(CATASTRO_CONFIG.refFromCoordsUrl);
  url.searchParams.set("SRS", CATASTRO_CONFIG.srs);
  url.searchParams.set("Coordenada_X", String(query.lon));
  url.searchParams.set("Coordenada_Y", String(query.lat));

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Catastro coords error: ${res.status}`);
  }

  const xml = await res.text();
  const parsed = parser.parse(xml);

  const control = parsed?.consulta_coordenadas?.control;
  const coord = parsed?.consulta_coordenadas?.coordenadas?.coord;

  if (!control || control.cuerr !== 0 || !coord) {
    throw new CatastroNotFoundError(`${query.lat},${query.lon}`);
  }

  const pc1: string = String(coord.pc.pc1);
  const pc2: string = String(coord.pc.pc2);
  return `${pc1}${pc2}`;
};

const getParcelByRef = async (
  query: GetParcelByRefQuery,
): Promise<CadastralParcel> => {
  const ref14 = query.ref.trim().slice(0, 14);

  const coordsUrl = new URL(CATASTRO_CONFIG.coordsUrl);
  coordsUrl.searchParams.set("Provincia", "");
  coordsUrl.searchParams.set("Municipio", "");
  coordsUrl.searchParams.set("RC", ref14);
  coordsUrl.searchParams.set("SRS", CATASTRO_CONFIG.srs);

  const coordsRes = await fetch(coordsUrl.toString());
  if (!coordsRes.ok)
    throw new Error(`Catastro coords error: ${coordsRes.status}`);

  const coordsXml = await coordsRes.text();
  const coordsParsed = parser.parse(coordsXml);

  const control = coordsParsed?.consulta_coordenadas?.control;
  const coord = coordsParsed?.consulta_coordenadas?.coordenadas?.coord;

  if (!control || control.cuerr !== 0 || !coord) {
    throw new CatastroNotFoundError(ref14);
  }

  const lon = Number(coord.geo.xcen);
  const lat = Number(coord.geo.ycen);
  const description: string = coord.ldt ?? "";

  const delta = 0.005;
  const bboxParam = `${lat - delta},${lon - delta},${lat + delta},${lon + delta}`;

  const wfsUrl = new URL(CATASTRO_CONFIG.wfsUrl);
  wfsUrl.searchParams.set("service", "WFS");
  wfsUrl.searchParams.set("version", "2.0.0");
  wfsUrl.searchParams.set("request", "GetFeature");
  wfsUrl.searchParams.set("typeNames", "CP:CadastralParcel");
  wfsUrl.searchParams.set("count", "10");
  wfsUrl.searchParams.set("CRS", CATASTRO_CONFIG.srs);
  wfsUrl.searchParams.set("bbox", bboxParam);

  const wfsRes = await fetch(wfsUrl.toString());
  if (!wfsRes.ok) throw new Error(`Catastro WFS error: ${wfsRes.status}`);

  const wfsXml = await wfsRes.text();
  const wfsParsed = parser.parse(wfsXml);

  const members = wfsParsed?.FeatureCollection?.member;
  const features = Array.isArray(members) ? members : [members];

  const match = features.find((m: any) => {
    const featureRef: string =
      m?.["cp:CadastralParcel"]?.["cp:nationalCadastralReference"] ?? "";
    return featureRef.startsWith(ref14);
  });

  const feature =
    match?.["cp:CadastralParcel"] ?? features[0]?.["cp:CadastralParcel"];

  if (!feature) throw new CatastroNotFoundError(ref14);

  const polygonPatch =
    feature?.["cp:geometry"]?.["gml:MultiSurface"]?.["gml:surfaceMember"]?.[
      "gml:Surface"
    ]?.["gml:patches"]?.["gml:PolygonPatch"];

  const posList =
    polygonPatch?.["gml:exterior"]?.["gml:LinearRing"]?.["gml:posList"]?.[
      "#text"
    ] ?? polygonPatch?.["gml:exterior"]?.["gml:LinearRing"]?.["gml:posList"];

  if (!posList)
    throw new CatastroParseError("No se encontró posList en el GML");

  const polygon = parsePosList(String(posList));
  const parcelBbox = calcBbox(polygon);
  const center: LonLat = [lon, lat];
  const area = Number(feature?.["cp:areaValue"]?.["#text"] ?? 0);
  const ref = feature?.["cp:nationalCadastralReference"] ?? ref14;

  return { ref, area, description, center, bbox: parcelBbox, polygon };
};

const getParcelByCoords = async (
  query: GetParcelByCoordsQuery,
): Promise<CadastralParcel> => {
  const ref = await getRefFromCoords(query);
  return getParcelByRef({ ref });
};

export const CatastroService = {
  getParcelByRef,
  getParcelByCoords,
};
