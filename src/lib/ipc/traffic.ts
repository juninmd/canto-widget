import { invoke } from "@tauri-apps/api/core";

/** Mapa: a place the user picked (starting point or a trip's destination). */
export type TrafficSpot = { name: string; detail: string; lat: number; lon: number };
export type TrafficTrip = { id: string; name: string; icon: "work" | "home" | "gym" | "heart" | "pin"; to: TrafficSpot };
export type TrafficStatus = { has_key: boolean; origin: TrafficSpot | null; trips: TrafficTrip[] };
export type IncidentKind = "accident" | "jam" | "works" | "closed" | "hazard";
/** `delay_s` is what the stretch costs on top of free flow; `magnitude` 0 unknown .. 4 closure. */
export type TrafficIncident = { kind: IncidentKind; text: string; road: string; delay_s: number; km: number; lat: number; lon: number; magnitude: number };
/** `points` is the road as `[lat, lon]`; `error` is set when this one trip could not be routed. */
export type TrafficRoute = { trip: string; minutes: number; free_minutes: number; km: number; points: [number, number][]; error: string | null };
export type TrafficReading = { slowdown: number | null; incidents: TrafficIncident[]; routes: TrafficRoute[] };
export type TrafficView = {
  status: TrafficStatus;
  suggested: TrafficSpot | null;
  reading: TrafficReading | null;
  fetched_at: number;
  /** Today's slowdown readings, `[at_ms, percent]`. */
  history: [number, number][];
  error: string | null;
};
export type TrafficDeparture = { at: number; minutes: number };
/** A 3×3 block of 256 px tiles as data URLs; `flow` is the traffic layer laid over `base`. */
export type MapTiles = { zoom: number; tiles: { x: number; y: number; base: string; flow: string }[]; source: "tomtom" | "osm" };

export const trafficApi = {
  /** Mapa: the reading needs the TomTom key and a starting point; Rust keeps it for 5 min. */
  trafficGet: (force = false) => invoke<TrafficView>("traffic_get", { force }),
  trafficDepartures: (trip: string) => invoke<TrafficDeparture[]>("traffic_departures", { trip }),
  trafficMap: (zoom: number, dark: boolean) => invoke<MapTiles>("traffic_map", { zoom, dark }),
  /** An empty key forgets it; a new one is checked against TomTom before it is sealed. */
  trafficSetKey: (key: string) => invoke<TrafficStatus>("traffic_set_key", { key }),
  trafficSearch: (query: string) => invoke<TrafficSpot[]>("traffic_search", { query }),
  trafficSetOrigin: (spot: TrafficSpot) => invoke<TrafficStatus>("traffic_set_origin", { spot }),
  trafficAddTrip: (name: string, icon: string, to: TrafficSpot) => invoke<TrafficStatus>("traffic_add_trip", { name, icon, to }),
  trafficRemoveTrip: (id: string) => invoke<TrafficStatus>("traffic_remove_trip", { id }),
};
