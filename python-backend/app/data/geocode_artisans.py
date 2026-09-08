"""
One-time geocoding script: sets lat/lng on artisan_profiles rows using
hardcoded Indian state/UT centroid coordinates (no external API needed).

Only updates rows where lat IS NULL, so it's safe to re-run.

Run from the project root with:
    python -m app.data.geocode_artisans
"""

import os
import sys

sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402

# Approximate geographic centroids for Indian states and UTs.
# These are well-known reference coordinates, NOT API-derived.
STATE_CENTROIDS = {
    "andhra pradesh":       (15.9129, 79.7400),
    "arunachal pradesh":    (27.1004, 93.6167),
    "assam":                (26.2006, 92.9376),
    "bihar":                (25.0961, 85.3131),
    "chhattisgarh":         (21.2787, 81.8661),
    "goa":                  (15.2993, 74.1240),
    "gujarat":              (22.2587, 71.1924),
    "haryana":              (29.0588, 76.0856),
    "himachal pradesh":     (31.1048, 77.1734),
    "jharkhand":            (23.6102, 85.2799),
    "karnataka":            (15.3173, 75.7139),
    "kerala":               (10.8505, 76.2711),
    "madhya pradesh":       (23.4734, 77.9479),
    "maharashtra":          (19.7515, 75.7139),
    "manipur":              (24.6637, 93.9063),
    "meghalaya":            (25.4670, 91.3662),
    "mizoram":              (23.1645, 92.9376),
    "nagaland":             (26.1584, 94.5624),
    "odisha":               (20.9517, 85.0985),
    "punjab":               (31.1471, 75.3412),
    "rajasthan":            (27.0238, 74.2179),
    "sikkim":               (27.5330, 88.5122),
    "tamil nadu":           (11.1271, 78.6569),
    "telangana":            (18.1124, 79.0193),
    "tripura":              (23.9408, 91.9882),
    "uttar pradesh":        (26.8467, 80.9462),
    "uttarakhand":          (30.0668, 79.0193),
    "west bengal":          (22.9868, 87.8550),
    # Union Territories
    "delhi":                (28.7041, 77.1025),
    "new delhi":            (28.7041, 77.1025),
    "chandigarh":           (30.7333, 76.7794),
    "puducherry":           (11.9416, 79.8083),
    "pondicherry":          (11.9416, 79.8083),
    "ladakh":               (34.1526, 77.5771),
    "leh":                  (34.1526, 77.5771),
    "leh/ladakh":           (34.1526, 77.5771),
    "jammu and kashmir":    (33.7782, 76.5762),
    "jammu & kashmir":      (33.7782, 76.5762),
    "j & k":                (33.7782, 76.5762),
    "j&k":                  (33.7782, 76.5762),
    "andaman and nicobar":  (11.7401, 92.6586),
    "dadra and nagar haveli and daman and diu": (20.1809, 73.0169),
    "lakshadweep":          (10.5667, 72.6417),
}


def geocode():
    conn = get_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id, state FROM artisan_profiles WHERE lat IS NULL")
    rows = cursor.fetchall()

    if not rows:
        print("All artisan_profiles rows already have lat/lng. Nothing to do.")
        cursor.close()
        conn.close()
        return

    updated = 0
    not_found_states = {}

    for row in rows:
        state_raw = (row["state"] or "").strip()
        state_key = state_raw.lower()

        coords = STATE_CENTROIDS.get(state_key)
        if coords:
            cursor.execute(
                "UPDATE artisan_profiles SET lat = %s, lng = %s WHERE id = %s",
                (coords[0], coords[1], row["id"]),
            )
            updated += 1
        else:
            not_found_states[state_raw] = not_found_states.get(state_raw, 0) + 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Updated: {updated} artisan(s) with state-centroid lat/lng.")

    if not_found_states:
        print(f"Not found: {len(not_found_states)} distinct state(s) could not be geocoded:")
        for state, count in sorted(not_found_states.items()):
            print(f"  - \"{state}\" ({count} artisan(s))")
    else:
        print("All states matched successfully.")


if __name__ == "__main__":
    geocode()
