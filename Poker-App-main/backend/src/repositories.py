import json
import uuid
from typing import List
from .db import get_db_connection
from .models import HandEntity

class HandRepository:
    """
    Repository Pattern implementation using Raw SQL.
    Handles persistence of HandEntity objects.
    """

    @staticmethod
    def save(hand: HandEntity) -> uuid.UUID:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute(
                """
                INSERT INTO hands (
                    hand_uuid, stack_settings, dealer_index, 
                    small_blind_index, big_blind_index, 
                    player_cards, actions_short, winnings
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                """,
                (
                    str(hand.hand_uuid),
                    json.dumps(hand.stack_settings),
                    hand.dealer_index,
                    hand.small_blind_index,
                    hand.big_blind_index,
                    json.dumps(hand.player_cards),
                    json.dumps(hand.actions_short),
                    json.dumps(hand.winnings)
                )
            )
            conn.commit()
            return hand.hand_uuid
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cur.close()
            conn.close()

    @staticmethod
    def get_all() -> List[HandEntity]:
        conn = get_db_connection()
        cur = conn.cursor()
        try:
            cur.execute("""
                SELECT 
                    hand_uuid, stack_settings, dealer_index, 
                    small_blind_index, big_blind_index, 
                    player_cards, actions_short, winnings 
                FROM hands 
                ORDER BY created_at DESC
            """)
            rows = cur.fetchall()
            hands = []
            for row in rows:
                hands.append(HandEntity(
                    hand_uuid=uuid.UUID(row[0]),
                    stack_settings=row[1], # psycopg2 automatically decodes JSONB
                    dealer_index=row[2],
                    small_blind_index=row[3],
                    big_blind_index=row[4],
                    player_cards=row[5],
                    actions_short=row[6],
                    winnings=row[7]
                ))
            return hands
        finally:
            cur.close()
            conn.close()