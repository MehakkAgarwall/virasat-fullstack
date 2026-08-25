// Virāsat route atlas: every visual layer stays cartographic and heritage-led while route data remains prototype mock data.
import { AnimatePresence, motion } from "framer-motion";
import L from "leaflet";
import { ArrowUpRight, Clock3, MapPin, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "wouter";
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { Craft } from "../data/mock";
import { CraftEditorialVisual } from "./CraftEditorialVisual";

type MarkerKind = "start" | "end" | "craft" | "heritage" | "artisan" | "experience";
export type PlannerMapRoute = { origin: { name: string; coordinates: [number, number] }; destination: { name: string; coordinates: [number, number] }; path: [number, number][]; distance: string; duration: string; regionLabel: string; heritageCoordinates: [number, number] };

function markerIcon(kind: MarkerKind, selected = false) {
  const background = kind === "start" ? "#163c35" : kind === "end" ? "#b96745" : kind === "heritage" ? "#a87a3b" : kind === "artisan" ? "#b96745" : kind === "experience" ? "#a87a3b" : "#f4eee2";
  const color = kind === "craft" ? "#163c35" : "#f9f4eb";
  return L.divIcon({ className: "custom-marker-wrap", html: `<span class="custom-marker custom-marker-${kind} ${selected ? "custom-marker-selected" : ""}" style="--marker-bg:${background};--marker-color:${color}"><span>${kind === "artisan" ? "✦" : kind === "experience" ? "○" : ""}</span></span>`, iconSize: [34, 44], iconAnchor: [17, 38], popupAnchor: [0, -32] });
}

function routeTravellerIcon() { return L.divIcon({ className: "route-traveller-wrap", html: `<span class="route-thread-traveller"><i></i></span>`, iconSize: [24, 24], iconAnchor: [12, 12] }); }
function FitRoute({ route, crafts }: { route: PlannerMapRoute; crafts: Craft[] }) { const map = useMap(); useEffect(() => { const bounds = L.latLngBounds(route.path); crafts.forEach((craft) => bounds.extend(craft.coordinates)); map.fitBounds(bounds, { padding: [30, 30], maxZoom: 9 }); }, [map, route, crafts]); return null; }
function partialRoute(route: [number, number][], progress: number) { const segments = route.length - 1; const scaled = Math.max(0, Math.min(segments, progress * segments)); const whole = Math.floor(scaled); const fraction = scaled - whole; const next = route[Math.min(whole + 1, route.length - 1)]; const current = route[whole]; const output = route.slice(0, whole + 1); if (whole < segments) output.push([current[0] + (next[0] - current[0]) * fraction, current[1] + (next[1] - current[1]) * fraction]); return output; }

function RouteThreadTraveller({ route }: { route: [number, number][] }) {
  const [progress, setProgress] = useState(.05);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setProgress(.68); return; } let frame = 0; const started = performance.now(); const tick = (now: number) => { setProgress(.05 + (((now - started) % 7600) / 7600) * .9); frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [route]);
  const travelled = partialRoute(route, progress); const position = travelled[travelled.length - 1] ?? route[0];
  return <Marker position={position} icon={routeTravellerIcon()} interactive={false} keyboard={false} />;
}

function RouteStroke({ route }: { route: [number, number][] }) {
  const [progress, setProgress] = useState(0);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setProgress(1); return; } let frame = 0; const started = performance.now(); const tick = (now: number) => { const t = Math.min(1, (now - started) / 1450); setProgress(1 - Math.pow(1 - t, 3)); if (t < 1) frame = requestAnimationFrame(tick); }; frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame); }, [route]);
  const drawn = useMemo(() => partialRoute(route, progress), [route, progress]);
  return <><Polyline positions={drawn} pathOptions={{ color: "#c99447", weight: 7, opacity: .26, lineCap: "round" }} /><Polyline positions={drawn} pathOptions={{ color: "#b96745", weight: 3.8, opacity: .98, dashArray: "1 11", lineCap: "round", className: "route-stitch-path" }} /><Polyline positions={drawn} pathOptions={{ color: "#163c35", weight: 1.1, opacity: .7 }} />{progress > .84 && <RouteThreadTraveller route={route} />}</>;
}

function ProgressiveCraftMarkers({ crafts, selectedId, onSelect }: { crafts: Craft[]; selectedId: string; onSelect: (craft: Craft) => void }) {
  const [revealed, setRevealed] = useState(0);
  useEffect(() => { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { setRevealed(crafts.length); return; } setRevealed(0); const timers = crafts.map((_, index) => window.setTimeout(() => setRevealed(index + 1), 1180 + index * 230)); return () => timers.forEach(window.clearTimeout); }, [crafts]);
  return <>{crafts.slice(0, revealed).map((craft, index) => { const type: MarkerKind = index === 1 ? "artisan" : index === 2 ? "experience" : "craft"; return <Marker key={craft.id} position={craft.coordinates} icon={markerIcon(type, selectedId === craft.id)} eventHandlers={{ click: () => onSelect(craft) }}><Popup><strong>{craft.name}</strong><br />{craft.region}, {craft.state}<br /><span>{craft.detour}</span></Popup></Marker>; })}</>;
}

export function LeafletMap({ crafts, route, selectedId, onSelect, onAddToTrail }: { crafts: Craft[]; route: PlannerMapRoute; selectedId: string; onSelect: (craft: Craft) => void; onAddToTrail?: (craft: Craft) => void }) {
  const selected = crafts.find((craft) => craft.id === selectedId) ?? crafts[0];
  return <div className="leaflet-shell map-field-artifact"><div className="map-paper-grain" aria-hidden="true" /><MapContainer key={`${route.origin.name}-${route.destination.name}`} center={route.origin.coordinates} zoom={6} scrollWheelZoom={false} zoomControl={false} className="leaflet-map"><TileLayer attribution="&copy; OpenStreetMap" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" opacity={.64} /><FitRoute route={route} crafts={crafts} /><RouteStroke route={route.path} /><Marker position={route.origin.coordinates} icon={markerIcon("start")}><Popup><strong>{route.origin.name}</strong><br />Your starting point</Popup></Marker><Marker position={route.destination.coordinates} icon={markerIcon("end")}><Popup><strong>{route.destination.name}</strong><br />Your destination</Popup></Marker><ProgressiveCraftMarkers crafts={crafts} selectedId={selectedId} onSelect={onSelect} /><Marker position={route.heritageCoordinates} icon={markerIcon("heritage")}><Popup><strong>Heritage stop</strong><br />A regional waystation along your route</Popup></Marker></MapContainer><div className="map-atlas-label"><span className="eyebrow"><span className="eyebrow-stitch" />Field note / 01</span><strong>Follow the craft line.</strong><small>Each marker is a living tradition<br />within reach of your route.</small><i className="atlas-route-stitch" /></div><div className="map-legend"><span><i className="legend-dot legend-route" />Your route</span><span><i className="legend-dot legend-craft" />Craft</span><span><i className="legend-dot legend-heritage" />Heritage</span></div><div className="map-caption"><span className="eyebrow">{route.regionLabel} · route intelligence</span><span>{route.distance} / {route.duration}</span></div><div className="map-compass-note"><span>N</span><i />Craft route atlas</div><AnimatePresence mode="wait"><motion.article className="map-discovery-card" key={selected.id} initial={{ opacity: 0, y: 14, scale: .98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8, scale: .98 }} transition={{ duration: .28 }}><CraftEditorialVisual craft={selected} index={crafts.findIndex((craft) => craft.id === selected.id)} alt={`${selected.name} material study`} /><div><span className="eyebrow">{selected.gi ? "GI tagged" : "Craft discovery"}</span><h3>{selected.name}</h3><p>{selected.region}, {selected.state}</p><div className="map-discovery-meta"><span><MapPin size={12} />{selected.distance}</span><span><Clock3 size={12} />{selected.detour}</span><span><Clock3 size={12} />{selected.duration}</span></div><div className="map-discovery-actions"><Link href={`/craft/${selected.id}`} className="button button-ghost">Explore craft <ArrowUpRight size={13} /></Link><button className="button button-primary" onClick={() => onAddToTrail?.(selected)}><Plus size={13} />Add to trail</button></div></div></motion.article></AnimatePresence></div>;
}
