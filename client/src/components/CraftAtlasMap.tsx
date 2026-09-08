import { Compass, MapPinned, RotateCcw } from "lucide-react";
import L from "leaflet";
import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { AtlasCraft } from "../services/craftService";

type AtlasMapProps = {
  crafts: AtlasCraft[];
  selectedId?: string;
  onSelect: (craft: AtlasCraft) => void;
};

type Cluster = { crafts: AtlasCraft[]; coordinates: [number, number] };

const INDIA_CENTER: [number, number] = [22.8, 79.2];

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

function craftMarkerIcon(isCluster: boolean, isSelected: boolean) {
  const cls = isCluster
    ? "craft-atlas-marker craft-atlas-marker-cluster"
    : `craft-atlas-marker${isSelected ? " is-selected" : ""}`;
  return L.divIcon({
    className: "craft-atlas-marker-wrap",
    html: `<span class="${cls}"></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

function clusterMarkerIcon(count: number) {
  return L.divIcon({
    className: "craft-atlas-marker-wrap",
    html: `<span class="craft-atlas-marker craft-atlas-marker-cluster"><span>${count}</span></span>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function singleMarkerIcon(isSelected: boolean) {
  return L.divIcon({
    className: "craft-atlas-marker-wrap",
    html: `<span class="craft-atlas-marker${isSelected ? " is-selected" : ""}"><i></i></span>`,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
    popupAnchor: [0, -12],
  });
}

/** Renders clustered craft markers as Leaflet layers, re-clusters on zoom change */
function AtlasMarkerLayer({ crafts, selectedId, onSelect }: AtlasMapProps) {
  const map = useMap();
  const layerGroupRef = useRef<L.LayerGroup>(L.layerGroup());
  const [zoom, setZoom] = useState(map.getZoom());

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  useEffect(() => {
    const lg = layerGroupRef.current;
    lg.clearLayers();

    const clusters = clusterCrafts(crafts, zoom);
    clusters.forEach((cluster) => {
      const [lat, lng] = cluster.coordinates;
      const isCluster = cluster.crafts.length > 1;
      const craft = cluster.crafts[0];

      const icon = isCluster
        ? clusterMarkerIcon(cluster.crafts.length)
        : singleMarkerIcon(craft.id === selectedId);

      const marker = L.marker([lat, lng], { icon, title: isCluster ? `${cluster.crafts.length} craft records` : craft.name });

      marker.on("click", () => {
        if (isCluster) {
          const bounds = L.latLngBounds(
            cluster.crafts
              .filter((item) => item.atlasCoordinates)
              .map((item) => item.atlasCoordinates as [number, number])
          );
          map.fitBounds(bounds, { padding: [84, 84] });
          return;
        }
        onSelect(craft);
        map.panTo([lat, lng]);
      });

      if (!isCluster) {
        marker.bindTooltip(craft.name, {
          direction: "top",
          offset: [0, -10],
          className: "craft-atlas-tooltip",
        });
      }

      lg.addLayer(marker);
    });

    lg.addTo(map);
    return () => { lg.clearLayers(); };
  }, [crafts, zoom, selectedId, onSelect, map]);

  return null;
}

export function CraftAtlasMap({ crafts, selectedId, onSelect }: AtlasMapProps) {
  const [ready, setReady] = useState(false);

  return <div className="craft-atlas-map-shell">
    <MapContainer
      center={INDIA_CENTER}
      zoom={5}
      minZoom={4}
      maxZoom={14}
      scrollWheelZoom={true}
      zoomControl={true}
      className="craft-atlas-leaflet-map"
      style={{ width: "100%", height: "100%", position: "absolute", inset: 0, zIndex: 1 }}
      whenReady={() => setReady(true)}
      maxBounds={[[5.5, 67], [37.5, 98]]}
      maxBoundsViscosity={0.8}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        opacity={0.64}
      />
      <AtlasMarkerLayer crafts={crafts} selectedId={selectedId} onSelect={onSelect} />
    </MapContainer>
    <svg className="craft-atlas-thread-network" aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none"><path d="M4 79 C17 68 18 53 33 52 S49 67 60 48 S82 25 96 16" /><path d="M7 22 C20 31 28 22 40 30 S64 29 79 10" /></svg>
    <div className={`craft-atlas-selected-thread ${selectedId ? "is-active" : ""}`} aria-hidden="true" />
    <div className="craft-atlas-map-grid" aria-hidden="true" />
    <div className="craft-atlas-compass" aria-hidden="true"><Compass size={19} /><span>INDIA / CRAFT ATLAS</span></div>
    <div className="craft-atlas-map-legend" aria-hidden="true"><b>Craft Atlas</b><span><i />Craft location</span><span><i />Craft cluster</span><span><i />Selected craft</span></div>
    {!ready && <div className="craft-atlas-map-loading"><RotateCcw size={17} /><span>Tracing live craft locations</span></div>}
  </div>;
}
