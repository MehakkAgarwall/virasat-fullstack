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