"""
MySQL connection helper.
Import get_connection() anywhere you need to talk to the DB.
"""

import os
import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv

load_dotenv()


def get_connection():
    """
    Returns a live MySQL connection using credentials from .env.
    Caller is responsible for closing it (or use it in a `with` block via a cursor).
    """
    try:
        conn = mysql.connector.connect(
            host=os.getenv("MYSQL_HOST", "localhost"),
            port=int(os.getenv("MYSQL_PORT", 3306)),
            user=os.getenv("MYSQL_USER", "root"),
            password=os.getenv("MYSQL_PASSWORD", ""),
            database=os.getenv("MYSQL_DATABASE", "kalatrail"),
        )
        return conn
    except Error as e:
        print(f"[db_service] Failed to connect to MySQL: {e}")
        raise
