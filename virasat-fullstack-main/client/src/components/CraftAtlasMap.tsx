import { Compass, MapPinned, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { AtlasCraft } from "../services/craftService";
import { MapView } from "./Map";

type AtlasMapProps = {
  crafts: AtlasCraft[];
  selectedId?: string;
  onSelect: (craft: AtlasCraft) => void;
};

type Cluster = { crafts: AtlasCraft[]; coordinates: [number, number] };

const INDIA_CENTER = { lat: 22.8, lng: 79.2 };

const atlasMapStyle: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0b2c25" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#e8d6a3" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#082019" }, { weight: 3 }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#8c7845" }, { lightness: -18 }] },
  { featureType: "landscape", elementType: "geometry", stylers: [{ color: "#103b31" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#174539" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#3d5240" }, { lightness: -20 }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#08251f" }] },
];

function clusterCrafts(crafts: AtlasCraft[], zoom: number): Cluster[] {
  const cell = zoom <= 4 ? 4.25 : zoom <= 5 ? 2.25 : zoom <= 6 ? 1.1 : 0.28;
  const groups = new Map<string, AtlasCraft[]>();
  crafts.forEach((craft) => {
    if (!craft.atlasCoordinates) return;
    const [lat, lng] = craft.atlasCoordinates;
    const key = `${Math.round(lat / cell)}:${Math.round(lng / cell)}`;
    groups.set(key, [...(groups.get(key) ?? []), craft]);
  });
  return Array.from(groups.values()).map((group) => ({
    crafts: group,
    coordinates: [
      group.reduce((total, craft) => total + (craft.atlasCoordinates?.[0] ?? 0), 0) / group.length,
      group.reduce((total, craft) => total + (craft.atlasCoordinates?.[1] ?? 0), 0) / group.length,
    ],
  }));
}

export function CraftAtlasMap({ crafts, selectedId, onSelect }: AtlasMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [failed, setFailed] = useState(false);
  const [zoom, setZoom] = useState(4.6);
  const overlays = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const listeners = useRef<google.maps.MapsEventListener[]>([]);

  const onMapReady = useCallback((nextMap: google.maps.Map) => {
    nextMap.setOptions({
      styles: atlasMapStyle,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      gestureHandling: "greedy",
      minZoom: 4,
      restriction: {
        latLngBounds: { north: 37.5, south: 5.5, west: 67, east: 98 },
        strictBounds: false,
      },
    });
    nextMap.setCenter(INDIA_CENTER);
    nextMap.setZoom(5);
    setMap(nextMap);
  }, []);

  useEffect(() => {
    if (!map) return;
    const listener = map.addListener("zoom_changed", () => setZoom(map.getZoom() ?? 4.6));
    listeners.current.push(listener);
    return () => {
      listener.remove();
      listeners.current = [];
    };
  }, [map]);

  useEffect(() => {
    if (!map) return;
    overlays.current.forEach((marker) => { marker.map = null; });
    overlays.current = [];

    const clusters = clusterCrafts(crafts, zoom);
    clusters.forEach((cluster) => {
      const [lat, lng] = cluster.coordinates;
      const isCluster = cluster.crafts.length > 1;
      const craft = cluster.crafts[0];
      const content = document.createElement("button");
      content.type = "button";
      content.className = isCluster
        ? "craft-atlas-marker craft-atlas-marker-cluster"
        : `craft-atlas-marker ${craft.id === selectedId ? "is-selected" : ""}`;
      content.setAttribute("aria-label", isCluster ? `${cluster.crafts.length} craft records in this area` : `Open ${craft.name}`);
      content.innerHTML = isCluster
        ? `<span>${cluster.crafts.length}</span>`
        : `<i></i><b>${craft.name}</b>`;
      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat, lng },
        content,
        title: isCluster ? `${cluster.crafts.length} craft records` : craft.name,
      });
      marker.addListener("click", () => {
        if (isCluster) {
          const bounds = new google.maps.LatLngBounds();
          cluster.crafts.forEach((item) => {
            const [nextLat, nextLng] = item.atlasCoordinates ?? [lat, lng];
            bounds.extend({ lat: nextLat, lng: nextLng });
          });
          map.fitBounds(bounds, 84);
          return;
        }
        onSelect(craft);
        map.panTo({ lat, lng });
      });
      overlays.current.push(marker);
    });

    return () => {
      overlays.current.forEach((marker) => { marker.map = null; });
      overlays.current = [];
    };
  }, [crafts, map, onSelect, selectedId, zoom]);

  if (failed) {
    return <div className="craft-atlas-map-fallback"><MapPinned size={18} /><b>Live map view is unavailable</b><p>The live craft record list and source-honest location status remain available below.</p></div>;
  }

  return <div className="craft-atlas-map-shell">
    <MapView className="craft-atlas-google-map" initialCenter={INDIA_CENTER} initialZoom={4.6} onMapReady={onMapReady} onMapError={() => setFailed(true)} />
    <svg className="craft-atlas-thread-network" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M4 79 C17 68 18 53 33 52 S49 67 60 48 S82 25 96 16" /><path d="M7 22 C20 31 28 22 40 30 S64 29 79 10" /></svg>
    <div className={`craft-atlas-selected-thread ${selectedId ? "is-active" : ""}`} aria-hidden="true" />
    <div className="craft-atlas-map-grid" aria-hidden="true" />
    <div className="craft-atlas-compass" aria-hidden="true"><Compass size={19} /><span>INDIA / CRAFT ATLAS</span></div>
    <div className="craft-atlas-map-legend" aria-hidden="true"><b>Craft Atlas</b><span><i />Craft location</span><span><i />Craft cluster</span><span><i />Selected craft</span></div>
    {!map && <div className="craft-atlas-map-loading"><RotateCcw size={17} /><span>Tracing live craft locations</span></div>}
  </div>;
}
