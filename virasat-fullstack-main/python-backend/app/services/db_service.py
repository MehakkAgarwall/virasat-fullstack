"""
MySQL connection helper.
Uses a connection pool (rather than opening a fresh connection per request)
so the app handles concurrent requests more reliably - important once deployed
and multiple people (judges, teammates) might hit it at the same time.

Import get_connection() anywhere you need to talk to the DB.
"""

import os
import logging
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

        try:
            _pool = pooling.MySQLConnectionPool(
                pool_name="kalatrail_pool",
                pool_size=5,
                host=host,
                port=port,
                user=user,
                password=password,
                database=database,
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
        conn.commit()
        cursor.close()
        conn.close()
        logger.info("Database initialization completed successfully.")
    except Exception as e:
        logger.warning(f"init_db non-fatal warning: {e}")