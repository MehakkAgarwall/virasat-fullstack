"""
Geo utilities:
- get_route(): calls OpenRouteService to get the actual road path between two points
- haversine_distance(): calculates distance in km between two lat/lng points
- find_crafts_near_route(): filters a list of crafts to those within a buffer distance of a route
"""

import os
import math
import requests
from dotenv import load_dotenv

load_dotenv()

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
    if not ORS_API_KEY:
        raise ValueError("ORS_API_KEY is not set in .env")

    headers = {
        "Authorization": ORS_API_KEY,
        "Content-Type": "application/json",
    }
    
    if coordinates_list and len(coordinates_list) >= 2:
        coords = coordinates_list
    elif start_lng is not None and start_lat is not None and end_lng is not None and end_lat is not None:
        coords = [
            [start_lng, start_lat],
            [end_lng, end_lat],
        ]
    else:
        raise ValueError("Invalid routing parameters provided.")

    body = {"coordinates": coords}

    response = requests.post(ORS_DIRECTIONS_URL, json=body, headers=headers, timeout=15)
    response.raise_for_status()
    data = response.json()

    coordinates = data["features"][0]["geometry"]["coordinates"]
    return coordinates


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