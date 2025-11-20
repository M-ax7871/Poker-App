import os
import time
import psycopg2
from psycopg2.extensions import connection
from dotenv import load_dotenv
from pathlib import Path

# Load .env from project root
env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=env_path)

def get_db_connection() -> connection:
    """
    Establishes a raw connection to PostgreSQL using psycopg2.
    Prints debug variables before connecting.
    """

    host = os.getenv("POSTGRES_HOST", "localhost")
    database = os.getenv("POSTGRES_DB", "poker_db")
    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD")

    return psycopg2.connect(
        host=host,
        database=database,
        user=user,
        password=password,
    )

def init_db():
    """
    Initializes the database schema.
    Includes retry logic to wait for the database container to be ready.
    """
    retries = 5
    while retries > 0:
        try:
            conn = get_db_connection()
            cur = conn.cursor()
            
            # Table schema using JSONB for complex data structures
            cur.execute("""
                CREATE TABLE IF NOT EXISTS hands (
                    id SERIAL PRIMARY KEY,
                    hand_uuid UUID UNIQUE NOT NULL,
                    stack_settings JSONB NOT NULL,
                    dealer_index INTEGER NOT NULL,
                    small_blind_index INTEGER NOT NULL,
                    big_blind_index INTEGER NOT NULL,
                    player_cards JSONB NOT NULL,
                    actions_short JSONB NOT NULL,
                    winnings JSONB NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            conn.commit()
            cur.close()
            conn.close()
            print("✅ Database initialized successfully.")
            return
        except Exception as e:
            print(f"⚠️ Database connection failed, retrying in 2s... ({e})")
            time.sleep(2)
            retries -= 1
    
    print("❌ Could not initialize database.")