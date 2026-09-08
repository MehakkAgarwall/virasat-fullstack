"""
Geo utilities:
- get_route(): calls OpenRouteService to get the actual road path between two points
- haversine_distance(): calculates distance in km between two lat/lng points
- find_crafts_near_route(): filters a list of crafts to those within a buffer distance of a route
"""

import os
import math
import logging
import requests
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger("kalatrail")

ORS_API_KEY = os.getenv("ORS_API_KEY")
ORS_DIRECTIONS_URL = "https://api.openrouteservice.org/v2/directions/driving-car/geojson"

# How close (in km) a craft's location must be to the route to count as "along the way"
DEFAULT_BUFFER_KM = 50


def get_route(start_lng: float = None, start_lat: float = None, end_lng: float = None, end_lat: float = None, coordinates_list: list = None):
    """
    Calls OpenRouteService Directions API (geojson variant).
    Note: ORS expects coordinates as [longitude, latitude] - NOT lat/lng order.
    Returns a list of [lng, lat] points describing the route path.
    Can take start/end coordinates OR an explicit list of [lng, lat] waypoint coordinates.
    """
    if coordinates_list and len(coordinates_list) >= 2:
        coords = coordinates_list
    elif start_lng is not None and start_lat is not None and end_lng is not None and end_lat is not None:
        coords = [
            [start_lng, start_lat],
            [end_lng, end_lat],
        ]
    else:
        raise ValueError("Invalid routing parameters provided.")

    # 1. Try OpenRouteService if API key is provided
    if ORS_API_KEY:
        try:
            headers = {
                "Authorization": ORS_API_KEY,
                "Content-Type": "application/json",
            }
            body = {"coordinates": coords}
            response = requests.post(ORS_DIRECTIONS_URL, json=body, headers=headers, timeout=15)
            response.raise_for_status()
            data = response.json()
            return data["features"][0]["geometry"]["coordinates"]
        except Exception as e:
            logger.warning(f"ORS routing failed ({e}), falling back to OSRM engine.")

    # 2. Public Open Source Routing Machine (OSRM) driving route
    try:
        coords_str = ";".join(f"{pt[0]},{pt[1]}" for pt in coords)
        osrm_url = f"https://router.project-osrm.org/route/v1/driving/{coords_str}?overview=full&geometries=geojson"
        resp = requests.get(osrm_url, headers={"User-Agent": "Virasat-App/1.0"}, timeout=15)
        resp.raise_for_status()
        osrm_data = resp.json()
        if osrm_data.get("routes") and len(osrm_data["routes"]) > 0:
            return osrm_data["routes"][0]["geometry"]["coordinates"]
    except Exception as e:
        logger.warning(f"OSRM public routing failed ({e}), using geometric interpolation.")

    # 3. Geometric linear interpolation fallback between points
    line_points = []
    for i in range(len(coords) - 1):
        p1 = coords[i]
        p2 = coords[i + 1]
        steps = 25
        for s in range(steps):
            t = s / steps
            line_points.append([p1[0] + (p2[0] - p1[0]) * t, p1[1] + (p2[1] - p1[1]) * t])
    line_points.append(coords[-1])
    return line_points


def haversine_distance(lat1, lng1, lat2, lng2):
    """Returns distance in kilometers between two lat/lng points."""
    lat1, lng1, lat2, lng2 = float(lat1), float(lng1), float(lat2), float(lng2)
    R = 6371  # Earth's radius in km
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lng2 - lng1)

    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c


def find_crafts_near_route(route_points, crafts, buffer_km=DEFAULT_BUFFER_KM):
    """
    route_points: list of [lng, lat] points from get_route()
    crafts: list of craft dicts, each with 'lat' and 'lng'
    Returns crafts that fall within buffer_km of ANY point on the route,
    sorted by their closest distance to the route (nearest first).
    """
    matched = []

    sample_step = max(1, len(route_points) // 200)
    sampled_points = route_points[::sample_step]

    for craft in crafts:
        if craft.get("lat") is None or craft.get("lng") is None:
            continue

        min_dist = min(
            haversine_distance(craft["lat"], craft["lng"], point[1], point[0])
            for point in sampled_points
        )

        if min_dist <= buffer_km:
            craft_with_distance = dict(craft)
            craft_with_distance["distance_from_route_km"] = round(min_dist, 1)
            matched.append(craft_with_distance)

    matched.sort(key=lambda c: c["distance_from_route_km"])
    return matched


# Alias haversine to haversine_distance for consistency
haversine = haversine_distance


def sample_route_points(route_coords, interval_km=2):
    """
    Reduces route_coords (list of [lng, lat] from ORS) to points spaced ~interval_km apart.
    """
    if not route_coords:
        return []

    sampled = [route_coords[0]]
    accumulated_km = 0.0

    for i in range(1, len(route_coords)):
        prev_lng, prev_lat = route_coords[i - 1]
        curr_lng, curr_lat = route_coords[i]
        step_km = haversine_distance(prev_lat, prev_lng, curr_lat, curr_lng)
        accumulated_km += step_km

        if accumulated_km >= interval_km:
            sampled.append(route_coords[i])
            accumulated_km = 0.0

    if sampled[-1] != route_coords[-1]:
        sampled.append(route_coords[-1])

    return sampled


def artisans_near_route(artisans, sampled_points, buffer_km):
    """
    Filters artisans (list of dicts with lat/lng) to those within buffer_km of ANY sampled point;
    adds 'distance_from_route_km' key; sorted ascending.
    """
    if not sampled_points or not artisans:
        return []

    matched = []
    for artisan in artisans:
        lat = artisan.get("lat")
        lng = artisan.get("lng")
        if lat is None or lng is None:
            continue

        min_dist = min(
            haversine_distance(lat, lng, pt[1], pt[0])
            for pt in sampled_points
        )

        if min_dist <= buffer_km:
            artisan_copy = dict(artisan)
            artisan_copy["distance_from_route_km"] = round(min_dist, 2)
            matched.append(artisan_copy)

    matched.sort(key=lambda a: a["distance_from_route_km"])
    return matched


def order_along_route(artisans, sampled_points):
    """
    For each artisan, finds nearest sampled_point index as 'route_position',
    returns list sorted by that route_position.
    """
    if not sampled_points or not artisans:
        return artisans

    ordered = []
    for artisan in artisans:
        lat = artisan.get("lat")
        lng = artisan.get("lng")
        if lat is None or lng is None:
            continue

        artisan_copy = dict(artisan)
        best_idx = 0
        best_dist = float("inf")
        for idx, pt in enumerate(sampled_points):
            dist = haversine_distance(lat, lng, pt[1], pt[0])
            if dist < best_dist:
                best_dist = dist
                best_idx = idx

        artisan_copy["route_position"] = best_idx
        ordered.append(artisan_copy)

    ordered.sort(key=lambda a: (a["route_position"], a.get("distance_from_route_km", 0)))
    return ordered