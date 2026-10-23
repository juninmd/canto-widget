import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { api, errText, type MapTiles, type TrafficIncident, type TrafficRoute, type TrafficSpot } from "../lib/api";
import { DEFAULT_ZOOM, KIND_LEVEL, LEVEL_COLOR, MAX_ZOOM, MIN_ZOOM, TILE, project } from "../lib/traffic";
import { t } from "../i18n";
import MapIncidentIcon from "./MapIncidentIcon";

type Layers = { flow: boolean; incidents: boolean; route: boolean };

type Props = {
  origin: TrafficSpot;
  live: boolean;
  route: TrafficRoute | null;
  incidents: TrafficIncident[];
  focused: number | null;
  onFocus: (index: number) => void;
  /** Changes when a new reading lands, so the traffic layer is fetched again with it. */
  stamp: number;
  updated: string;
};

/** The 3×3 tiles only reach one tile away from the start: past that there would be blank map. */
const MAX_PAN = TILE;
const isDark = () => document.documentElement.dataset.skin !== "claro";

/** Tiles from Rust laid around the starting point, with the trip's line, the incidents and "you" drawn on top. */
export default function MapView({ origin, live, route, incidents, focused, onFocus, stamp, updated }: Props) {
  const [zoom, setZoom] = useState(DEFAULT_ZOOM);
  const [tiles, setTiles] = useState<MapTiles | null>(null);
  const [error, setError] = useState("");
  const [layers, setLayers] = useState<Layers>({ flow: true, incidents: true, route: true });
  const [pan, setPan] = useState<[number, number]>([0, 0]);
  const drag = useRef<[number, number, number, number] | null>(null);

  useEffect(() => {
    let alive = true;
    api
      .trafficMap(zoom, isDark())
      .then((m) => alive && (setTiles(m), setError("")))
      .catch((e) => alive && setError(errText(e)));
    return () => {
      alive = false;
    };
  }, [zoom, origin.lat, origin.lon, stamp]);

  const [ox, oy] = project(origin.lat, origin.lon, zoom);
  const at = (lat: number, lon: number) => {
    const [x, y] = project(lat, lon, zoom);
    return [x - ox, y - oy] as const;
  };
  const clamp = (v: number) => Math.max(-MAX_PAN, Math.min(MAX_PAN, v));
  const zoomBy = (step: number) => {
    setZoom((z) => Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, z + step)));
    setPan([0, 0]);
  };

  function onDown(e: ReactPointerEvent) {
    if ((e.target as Element).closest("button")) return;
    drag.current = [e.clientX, e.clientY, pan[0], pan[1]];
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: ReactPointerEvent) {
    const d = drag.current;
    if (d) setPan([clamp(d[2] + e.clientX - d[0]), clamp(d[3] + e.clientY - d[1])]);
  }

  const osm = tiles?.source === "osm";
  const line = route && layers.route && route.points.length > 1 ? route.points.map(([la, lo]) => at(la, lo).join(",")).join(" ") : "";
  const end = route && route.points.length > 0 ? at(...route.points[route.points.length - 1]) : null;
  const toggle = (k: keyof Layers) => setLayers((l) => ({ ...l, [k]: !l[k] }));
  return (
    <section data-map-view aria-label={t("map.view")} className="map-frame wx-rise relative h-[230px] shrink-0 touch-none select-none overflow-hidden rounded-2xl border border-edge">
      <div className="absolute inset-0 cursor-grab active:cursor-grabbing" onPointerDown={onDown} onPointerMove={onMove} onPointerUp={() => (drag.current = null)}>
        <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(${pan[0]}px, ${pan[1]}px)` }}>
          {tiles?.tiles.map((tile) => (
            <div key={`${tile.x}/${tile.y}`} className="absolute" style={{ left: tile.x * TILE - ox, top: tile.y * TILE - oy, width: TILE, height: TILE }}>
              {tile.base && <img src={tile.base} alt="" draggable={false} className={`absolute inset-0 h-full w-full ${osm ? "map-osm" : ""}`} />}
              {tile.flow && layers.flow && <img src={tile.flow} alt="" draggable={false} className="absolute inset-0 h-full w-full" />}
            </div>
          ))}
          <svg className="absolute overflow-visible" width="1" height="1" aria-hidden={!live}>
            {line && (
              <>
                <polyline points={line} className="map-route-glow" />
                <polyline points={line} className="map-route" />
              </>
            )}
            {end && layers.route && (
              <g transform={`translate(${end[0]} ${end[1]})`}>
                <circle r="7" fill="var(--color-panel)" stroke="var(--color-accent)" strokeWidth="2.5" />
                <circle r="2.5" fill="var(--color-accent)" />
              </g>
            )}
            {layers.incidents &&
              incidents.map((inc, i) => {
                const [x, y] = at(inc.lat, inc.lon);
                return (
                  <g
                    key={i}
                    role="button"
                    tabIndex={0}
                    aria-label={inc.text || t(`map.kind.${inc.kind}`)}
                    data-map-pin
                    className={`map-pin ${focused === i ? "is-on" : ""}`}
                    transform={`translate(${x} ${y})`}
                    onClick={() => onFocus(i)}
                    onKeyDown={(e) => e.key === "Enter" && onFocus(i)}
                  >
                    <path d="M0 0 C0 0 -9 -9 -9 -13 a9 9 0 0 1 18 0 c0 4 -9 13 -9 13Z" fill={LEVEL_COLOR[KIND_LEVEL[inc.kind]]} stroke="var(--color-panel)" strokeWidth="1.5" />
                    <g transform="translate(-5.5 -18.5) scale(.46)" color="#fff">
                      <MapIncidentIcon kind={inc.kind} />
                    </g>
                  </g>
                );
              })}
            <circle r="7" className="map-me-ring" />
            <circle r="6" fill="var(--color-accent)" stroke="var(--color-panel)" strokeWidth="2.5" />
          </svg>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-2 top-2 flex items-start justify-between gap-2">
        <div className="map-glass pointer-events-auto min-w-0 rounded-xl px-2.5 py-1.5">
          <b className="block truncate text-xs text-fg">{origin.name}</b>
          <span className="flex items-center gap-1.5 text-[10px] text-faint">
            {live && <span className="map-live h-1.5 w-1.5 rounded-full" />}
            {live ? updated : t("map.noTraffic")}
          </span>
        </div>
        <div className="map-glass pointer-events-auto flex flex-col overflow-hidden rounded-xl">
          <button type="button" aria-label={t("map.zoomIn")} disabled={zoom >= MAX_ZOOM} onClick={() => zoomBy(1)} className="canto-hit h-7 w-8 text-muted hover:text-fg disabled:opacity-40">
            +
          </button>
          <button type="button" aria-label={t("map.zoomOut")} disabled={zoom <= MIN_ZOOM} onClick={() => zoomBy(-1)} className="canto-hit h-7 w-8 border-t border-edge text-muted hover:text-fg disabled:opacity-40">
            −
          </button>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
        {live ? (
          <div className="map-glass pointer-events-auto flex gap-0.5 rounded-full p-0.5">
            {(["flow", "incidents", "route"] as const).map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={layers[k]}
                onClick={() => toggle(k)}
                className="canto-hit min-h-[24px] rounded-full px-2 text-[11px] text-muted aria-pressed:bg-accent/15 aria-pressed:text-fg"
              >
                {t(`map.layer.${k}`)}
              </button>
            ))}
          </div>
        ) : (
          <span />
        )}
        <span className="map-glass rounded-md px-1.5 py-0.5 text-[9px] text-faint">{osm || !tiles ? "© OpenStreetMap" : "© TomTom · © OpenStreetMap"}</span>
      </div>
      {error && (
        <p role="alert" className="absolute inset-x-2 top-1/2 -translate-y-1/2 rounded-lg bg-panel/90 p-2 text-center text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
