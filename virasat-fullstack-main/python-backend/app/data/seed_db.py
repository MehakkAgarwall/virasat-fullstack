"""
One-time seed script: reads app/data/crafts_seed.csv and inserts rows into
the `crafts` table in MySQL. Safe to re-run - it clears existing rows first
so you don't get duplicates if you run it more than once.

Run from the project root with:
    python -m app.data.seed_db
"""

import csv
import os
import sys

# allow running as a script from project root
sys.path.append(os.path.join(os.path.dirname(__file__), "..", ".."))

from app.services.db_service import get_connection  # noqa: E402

CSV_PATH = os.path.join(os.path.dirname(__file__), "crafts_seed.csv")


def seed():
    conn = get_connection()
    cursor = conn.cursor()

    # Clear existing rows so re-running this script doesn't duplicate data
    cursor.execute("DELETE FROM crafts")
    print("Cleared existing rows from `crafts` table.")

    insert_query = """
        INSERT INTO crafts (name, category, state, district, description, lat, lng, image_url)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """

    rows_inserted = 0
    with open(CSV_PATH, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            values = (
                row["name"].strip(),
                row["category"].strip(),
                row["state"].strip(),
                row["district"].strip(),
                row["description"].strip(),
                float(row["lat"]) if row["lat"] else None,
                float(row["lng"]) if row["lng"] else None,
                (row.get("image_url") or "").strip() or None,
            )
            cursor.execute(insert_query, values)
            rows_inserted += 1

    conn.commit()
    cursor.close()
    conn.close()

    print(f"Seeded {rows_inserted} crafts into the database.")


if __name__ == "__main__":
    seed()
