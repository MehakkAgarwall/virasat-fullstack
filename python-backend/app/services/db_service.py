"""
MySQL connection helper.
Uses a connection pool (rather than opening a fresh connection per request)
so the app handles concurrent requests more reliably - important once deployed
and multiple people (judges, teammates) might hit it at the same time.

Import get_connection() anywhere you need to talk to the DB.
"""

import os
import csv
import logging
from pathlib import Path
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
        try:
            _pool = pooling.MySQLConnectionPool(
                pool_name="kalatrail_pool",
                pool_size=5,
                host=os.getenv("MYSQL_HOST", "localhost"),
                port=int(os.getenv("MYSQL_PORT", 3306)),
                user=os.getenv("MYSQL_USER", "root"),
                password=os.getenv("MYSQL_PASSWORD", ""),
                database=os.getenv("MYSQL_DATABASE", "kalatrail"),
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
        cursor.execute("SELECT COUNT(*) FROM crafts")
        craft_count = int(cursor.fetchone()[0])
        if craft_count < 300:
            csv_path = Path(__file__).resolve().parents[1] / "data" / "crafts_seed.csv"
            with csv_path.open(newline="", encoding="utf-8-sig") as handle:
                rows = list(csv.DictReader(handle))
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
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Database initialization completed successfully.")
    except Exception as e:
        logger.warning(f"init_db non-fatal warning: {e}")
