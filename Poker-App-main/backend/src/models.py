from dataclasses import dataclass
from typing import List, Dict, Any
import uuid
from pydantic import BaseModel

# --- Data Transfer Objects (Pydantic) ---
# Used for API Request/Response validation

class HandCreateRequest(BaseModel):
    stack_settings: List[int]
    dealer_index: int
    small_blind_index: int
    big_blind_index: int
    player_cards: Dict[str, List[str]]
    actions_short: List[str]

class HandResponse(BaseModel):
    uuid: str
    setup: str
    cards: str
    actions: str
    results: str

# --- Domain Entities (Dataclasses) ---
# Used for internal logic and repository transfer

@dataclass
class HandEntity:
    hand_uuid: uuid.UUID
    stack_settings: List[int]
    dealer_index: int
    small_blind_index: int
    big_blind_index: int
    player_cards: Dict[str, List[str]]
    actions_short: List[str]
    winnings: Dict[str, float]