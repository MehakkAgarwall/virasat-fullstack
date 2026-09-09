"""
MySQL connection helper.
Uses a connection pool (rather than opening a fresh connection per request)
so the app handles concurrent requests more reliably - important once deployed
and multiple people (judges, teammates) might hit it at the same time.

Import get_connection() anywhere you need to talk to the DB.
"""

import os
<<<<<<< HEAD
import csv
import logging
from pathlib import Path
=======
import logging
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
import mysql.connector
from mysql.connector import Error, pooling
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger("kalatrail")

_pool = None


def _get_pool():
    """Lazily creates the connection pool on first use."""
    global _pool
    if _pool is None:
<<<<<<< HEAD
=======
        host = os.getenv("MYSQL_HOST")
        port = int(os.getenv("MYSQL_PORT", 3306))
        user = os.getenv("MYSQL_USER", "root")
        password = os.getenv("MYSQL_PASSWORD", "")
        database = os.getenv("MYSQL_DATABASE", "kalatrail")

        # Support cloud URLs (e.g. Railway/Render/Fly MYSQL_URL or DATABASE_URL)
        db_url = os.getenv("MYSQL_URL") or os.getenv("DATABASE_URL")
        if db_url and not os.getenv("MYSQL_HOST"):
            from urllib.parse import urlparse
            try:
                parsed = urlparse(db_url)
                if parsed.hostname:
                    host = parsed.hostname
                if parsed.port:
                    port = parsed.port
                if parsed.username:
                    user = parsed.username
                if parsed.password:
                    password = parsed.password
                if parsed.path:
                    database = parsed.path.lstrip("/")
            except Exception as parse_err:
                logger.warning(f"Could not parse database URL: {parse_err}")

        host = host or "localhost"

>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
        try:
            _pool = pooling.MySQLConnectionPool(
                pool_name="kalatrail_pool",
                pool_size=5,
<<<<<<< HEAD
                host=os.getenv("MYSQL_HOST", "localhost"),
                port=int(os.getenv("MYSQL_PORT", 3306)),
                user=os.getenv("MYSQL_USER", "root"),
                password=os.getenv("MYSQL_PASSWORD", ""),
                database=os.getenv("MYSQL_DATABASE", "kalatrail"),
=======
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
            )
        except Error as e:
            logger.error(f"Failed to create MySQL connection pool: {e}")
            raise
    return _pool


def get_connection():
    """
    Returns a live MySQL connection from the pool using credentials from .env.
    Caller is responsible for closing it (returns it to the pool, doesn't actually
    disconnect) - always close in a try/finally so connections aren't leaked.
    """
    try:
        return _get_pool().get_connection()
    except Error as e:
        logger.error(f"Failed to get MySQL connection from pool: {e}")
        raise


def init_db():
    """
    Ensures required database tables like artisan_interests exist.
    """
    try:
        conn = get_connection()
        cursor = conn.cursor()
<<<<<<< HEAD
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS crafts (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            category VARCHAR(100),
            state VARCHAR(100),
            district VARCHAR(100),
            description TEXT,
            ai_description TEXT,
            lat DECIMAL(9,6),
            lng DECIMAL(9,6),
            image_url VARCHAR(500),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
        cursor.execute("""
        CREATE TABLE IF NOT EXISTS artisan_profiles (
            id INT AUTO_INCREMENT PRIMARY KEY,
            artisanKey VARCHAR(191) NOT NULL UNIQUE,
            primaryCraftId INT NULL,
            studioName VARCHAR(191) NOT NULL,
            personalName VARCHAR(191) NOT NULL,
            craftSpecialization VARCHAR(255) NOT NULL,
            location VARCHAR(255) NOT NULL,
            state VARCHAR(128) NOT NULL,
            yearsOfPractice INT NOT NULL DEFAULT 0,
            bio TEXT NOT NULL,
            profilePhotoUrl VARCHAR(1024) NOT NULL,
            coverPhotoUrl VARCHAR(1024) NOT NULL,
            publicContact VARCHAR(320) NOT NULL DEFAULT '',
            languages VARCHAR(500) NOT NULL DEFAULT '',
            experienceInfo TEXT NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_artisan_state (state),
            INDEX idx_artisan_craft (primaryCraftId)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """)
=======
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS artisan_interests (
            id INT AUTO_INCREMENT PRIMARY KEY,
            artisan_key VARCHAR(100) NOT NULL,
            visitor_name VARCHAR(150) NOT NULL,
            visitor_email VARCHAR(150) NOT NULL,
            visitor_phone VARCHAR(30),
            message TEXT,
            preferred_date DATE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_artisan_key (artisan_key)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        cursor.execute(create_table_sql)
<<<<<<< HEAD
        csv_path = Path(__file__).resolve().parents[1] / "data" / "crafts_seed.csv"
        with csv_path.open(newline="", encoding="utf-8-sig") as handle:
            rows = list(csv.DictReader(handle))
        cursor.execute("SELECT COUNT(*), COALESCE(SUM(image_url IS NOT NULL AND image_url <> ''), 0) FROM crafts")
        craft_count, craft_image_count = cursor.fetchone()
        if craft_count != len(rows) or craft_image_count < len(rows):
            if len(rows) >= 300:
                cursor.execute("DELETE FROM crafts")
                cursor.executemany(
                    """
                    INSERT INTO crafts
                      (name, category, state, district, description, lat, lng, image_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    [
                        (
                            row["name"].strip(), row["category"].strip(), row["state"].strip(),
                            row["district"].strip(), row["description"].strip(),
                            float(row["lat"]) if row.get("lat") else None,
                            float(row["lng"]) if row.get("lng") else None,
                            (row.get("image_url") or "").strip() or None,
                        )
                        for row in rows
                    ],
                )
                logger.info("Repaired crafts catalogue: loaded %s records from %s", len(rows), csv_path)
        artisan_csv_path = Path(__file__).resolve().parents[1] / "data" / "artisan_profiles_seed.csv"
        with artisan_csv_path.open(newline="", encoding="utf-8-sig") as handle:
            artisan_rows = list(csv.DictReader(handle))
        cursor.execute("SELECT COUNT(*), COALESCE((SELECT coverPhotoUrl FROM artisan_profiles ORDER BY id LIMIT 1), '') FROM artisan_profiles")
        artisan_count, first_cover = cursor.fetchone()
        expected_first_cover = (artisan_rows[0].get("coverPhotoUrl") or "").strip() if artisan_rows else ""
        if artisan_count != len(artisan_rows) or (artisan_rows and first_cover != expected_first_cover):
            cursor.execute("DELETE FROM artisan_profiles")
            cursor.executemany(
                """
                INSERT INTO artisan_profiles
                  (artisanKey, primaryCraftId, studioName, personalName, craftSpecialization,
                   location, state, yearsOfPractice, bio, profilePhotoUrl, coverPhotoUrl,
                   publicContact, languages, experienceInfo)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """,
                [
                    (
                        row["artisanKey"].strip(), None, row["studioName"].strip(), row["personalName"].strip(),
                        row["craftSpecialization"].strip(), row["location"].strip(), row.get("state", "").strip(),
                        int(float(row.get("yearsOfPractice") or 0)), row["bio"].strip(),
                        (row.get("profilePhotoUrl") or "").strip() or "/manus-storage/mysuru-heritage-pavilion_6c4424ad.jpg",
                        (row.get("coverPhotoUrl") or "").strip() or "/manus-storage/mysuru-heritage-pavilion_6c4424ad.jpg",
                        (row.get("publicContact") or "").strip(), (row.get("languages") or "").strip(),
                        row["experienceInfo"].strip(),
                    )
                    for row in artisan_rows
                ],
            )
            logger.info("Loaded artisan profile catalogue: %s records from %s", len(artisan_rows), artisan_csv_path)
=======
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Database initialization completed successfully.")
    except Exception as e:
<<<<<<< HEAD
        logger.warning(f"init_db non-fatal warning: {e}")
=======
        logger.warning(f"init_db non-fatal warning: {e}")
>>>>>>> 35fc9b5963c334ea82df9f5d89e5d8978f131e27
