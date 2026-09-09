// Google-backed Cultural Journey map: actual map baselayer with the existing verified route geometry and a safe atlas fallback.
import { Layers3, MapPinned, Rotate3D } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Craft } from "../data/mock";
import { LeafletMap, type PlannerMapRoute } from "./LeafletMap";
import { MapView } from "./Map";
import { GOOGLE_MAP_INITIALIZATION_ATTEMPTS, GOOGLE_MAP_READY_TIMEOUT_MS } from "./googleMapsConfig";

type GoogleJourneyMapProps = {
  crafts: Craft[];
  route: PlannerMapRoute;
  selectedId: string;
  onSelect: (craft: Craft) => void;
  onAddToTrail: (craft: Craft) => void;
};

function removeOverlay(overlay: google.maps.Polyline | google.maps.marker.AdvancedMarkerElement) {
  if (overlay instanceof google.maps.Polyline) {
    overlay.setMap(null);
    return;
  }
  overlay.map = null;
}

export function GoogleJourneyMap({ crafts, route, selectedId, onSelect, onAddToTrail }: GoogleJourneyMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [failed, setFailed] = useState(false);
  const [mapMountAttempt, setMapMountAttempt] = useState(0);
  const [threeDimensional, setThreeDimensional] = useState(false);
  const overlays = useRef<Array<google.maps.Polyline | google.maps.marker.AdvancedMarkerElement>>([]);

  const onMapReady = useCallback((nextMap: google.maps.Map) => setMap(nextMap), []);
  const retryOrFailMap = useCallback(() => {
    setMapMountAttempt((attempt) => {
      if (attempt + 1 < GOOGLE_MAP_INITIALIZATION_ATTEMPTS) return attempt + 1;
      setFailed(true);
      return attempt;
    });
  }, []);

  useEffect(() => {
    if (map || failed) return;
    const timeout = window.setTimeout(retryOrFailMap, GOOGLE_MAP_READY_TIMEOUT_MS);
    return () => window.clearTimeout(timeout);
  }, [failed, map, mapMountAttempt, retryOrFailMap]);

  useEffect(() => {
    if (!map) return;
    overlays.current.forEach(removeOverlay);
    overlays.current = [];

    const mapPath = route.path.map(([lat, lng]) => ({ lat, lng }));
    const bounds = new google.maps.LatLngBounds();
    mapPath.forEach((point) => bounds.extend(point));
    crafts.forEach((craft) => bounds.extend({ lat: craft.coordinates[0], lng: craft.coordinates[1] }));
    map.fitBounds(bounds, 44);

    const halo = new google.maps.Polyline({ path: mapPath, geodesic: true, strokeColor: "#e8c36b", strokeOpacity: .38, strokeWeight: 8, map });
    const routeLine = new google.maps.Polyline({ path: mapPath, geodesic: true, strokeColor: "#b96745", strokeOpacity: 1, strokeWeight: 3.5, icons: [{ icon: { path: "M 0,-1 0,1", strokeOpacity: 1, scale: 3 }, offset: "0", repeat: "14px" }], map });
    overlays.current.push(halo, routeLine);

    const addMarker = (position: google.maps.LatLngLiteral, label: string, kind: "start" | "end" | "craft", onClick?: () => void) => {
      const content = document.createElement("button");
      content.type = "button";
      content.className = `journey-google-marker journey-google-marker-${kind}`;
      content.innerHTML = `<span>${kind === "start" ? "●" : kind === "end" ? "◆" : "✦"}</span><small>${label}</small>`;
      const marker = new google.maps.marker.AdvancedMarkerElement({ map, position, title: label, content });
      if (onClick) marker.addListener("click", onClick);
      overlays.current.push(marker);
    };

    addMarker({ lat: route.origin.coordinates[0], lng: route.origin.coordinates[1] }, route.origin.name, "start");
    addMarker({ lat: route.destination.coordinates[0], lng: route.destination.coordinates[1] }, route.destination.name, "end");
    crafts.forEach((craft) => addMarker({ lat: craft.coordinates[0], lng: craft.coordinates[1] }, craft.name, "craft", () => onSelect(craft)));

    return () => {
      overlays.current.forEach(removeOverlay);
      overlays.current = [];
    };
  }, [crafts, map, onSelect, route]);

  const toggle3D = () => {
    if (!map) return;
    const nextValue = !threeDimensional;
    setThreeDimensional(nextValue);
    map.setTilt(nextValue ? 45 : 0);
    map.setHeading(nextValue ? 22 : 0);
  };

  if (failed) {
    return <div className="journey-real-map-fallback"><div className="journey-real-map-fallback-note"><MapPinned size={14} /><span>Live map view is unavailable right now. The route atlas remains available.</span></div><LeafletMap crafts={crafts} route={route} selectedId={selectedId} onSelect={onSelect} onAddToTrail={onAddToTrail} /></div>;
  }

  return <div className="journey-google-map-shell">
    <MapView key={mapMountAttempt} className="journey-google-map" initialCenter={{ lat: route.origin.coordinates[0], lng: route.origin.coordinates[1] }} initialZoom={6} onMapReady={onMapReady} onMapError={retryOrFailMap} />
    <div className="journey-google-map-header"><span className="eyebrow"><MapPinned size={12} />Live map / route geometry</span><span>{route.distance} / {route.duration}</span></div>
    <div className="journey-google-map-controls"><button type="button" className={threeDimensional ? "journey-3d-active" : ""} onClick={toggle3D} disabled={!map}><Layers3 size={15} />{threeDimensional ? "Return to map" : "See in 3D"}</button><small><Rotate3D size={11} />Terrain and building depth appear where Google Maps coverage allows.</small></div>
    {!map && <div className="journey-real-map-loading"><span className="eyebrow">Connecting live map</span><div /><p>Bringing the route and cultural stops into view.</p></div>}
  </div>;
}
