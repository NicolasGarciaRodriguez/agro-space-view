export const CATASTRO_ROUTE_PREFIX = "/api/catastro" as const;

export const CATASTRO_CONFIG = {
  coordsUrl:
    "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC" +
    "/OVCCoordenadas.asmx/Consulta_CPMRC",

  refFromCoordsUrl:
    "https://ovc.catastro.meh.es/ovcservweb/OVCSWLocalizacionRC" +
    "/OVCCoordenadas.asmx/Consulta_RCCOOR",

  wfsUrl: "https://ovc.catastro.meh.es/INSPIRE/wfsCP.aspx",

  srs: "EPSG:4326",
} as const;
