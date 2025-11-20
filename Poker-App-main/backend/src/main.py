from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import uuid

from .db import init_db
from .models import HandCreateRequest, HandResponse, HandEntity
from .services import PokerService
from .repositories import HandRepository

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler to initialize DB on startup.
    """
    init_db()
    yield

app = FastAPI(title="Poker Hand API", lifespan=lifespan)

# CORS Middleware (Allowing all for this exercise)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/hands", status_code=201)
def create_hand(request: HandCreateRequest):
    """
    Receives hand data, calculates winnings, and saves to DB.
    """
    try:
        # 1. Calculate Winnings via Domain Service
        winnings = PokerService.calculate_winnings(
            request.stack_settings,
            request.player_cards,
            request.actions_short
        )

        # 2. Create Domain Entity
        new_uuid = uuid.uuid4()
        hand_entity = HandEntity(
            hand_uuid=new_uuid,
            stack_settings=request.stack_settings,
            dealer_index=request.dealer_index,
            small_blind_index=request.small_blind_index,
            big_blind_index=request.big_blind_index,
            player_cards=request.player_cards,
            actions_short=request.actions_short,
            winnings=winnings
        )

        # 3. Persist via Repository
        saved_uuid = HandRepository.save(hand_entity)

        return {"message": "Hand saved successfully", "uuid": str(saved_uuid)}

    except Exception as e:
        print(f"Error processing hand: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@app.get("/hands", response_model=list[HandResponse])
def get_hands():
    """
    Retrieves history in the format requested by frontend specs.
    """
    try:
        hands = HandRepository.get_all()
        response_data = []
        
        for h in hands:
            # Formatting data for the frontend's Hand History view
            # Line 2: Stack + Roles
            # Example: Stack 1000, D:Player 1, SB:Player 2, BB:Player 3
            # Taking first stack as representative or joining them
            stack_str = h.stack_settings[0] if h.stack_settings else 0
            setup_str = (f"Stack {stack_str}, "
                         f"D:Player {h.dealer_index + 1}, "
                         f"SB:Player {h.small_blind_index + 1}, "
                         f"BB:Player {h.big_blind_index + 1}")
            
            # Line 3: Cards
            cards_str = f"Hands: {h.player_cards}"
            
            # Line 4: Action Sequence
            actions_str = f"Actions: {', '.join(h.actions_short)}"
            
            # Line 5: Winnings
            results_str = f"Winnings: {h.winnings}"

            response_data.append(HandResponse(
                uuid=f"Hand: {str(h.hand_uuid)}",
                setup=setup_str,
                cards=cards_str,
                actions=actions_str,
                results=results_str
            ))
            
        return response_data

    except Exception as e:
        print(f"Error fetching hands: {e}")
        raise HTTPException(status_code=500, detail="Internal Server Error")