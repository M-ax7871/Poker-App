from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from src.main import app
import uuid

client = TestClient(app)

def test_create_and_get_hand_flow():
    """
    Integration test for the API flow.
    Mocks the Repository layer to avoid needing a live DB during CI/Test runs.
    Verifies that the Service logic (PokerKit) is called and API returns 201.
    """
    
    # Sample payload representing a walk (everyone folds to BB)
    payload = {
        "stack_settings": [1000, 1000, 1000, 1000, 1000, 1000],
        "dealer_index": 0,
        "small_blind_index": 1,
        "big_blind_index": 2,
        "player_cards": {
            "0": ["2s", "7d"],
            "1": ["Ah", "Kh"],
            "2": ["Qd", "Qs"],
            # Added missing players to match the 6 stack_settings
            "3": ["7h", "2c"], 
            "4": ["3d", "9s"], 
            "5": ["Th", "4c"]
        },
        # P3, P4, P5, P0(D) Fold. P1(SB) Folds. P2(BB) Wins.
        "actions_short": ["f", "f", "f", "f", "f"]
    }

    # Mock the Repository to prevent SQL calls
    with patch("src.repositories.HandRepository.save") as mock_save, \
         patch("src.repositories.HandRepository.get_all") as mock_get:
        
        # Setup Mock Returns
        mock_save.return_value = uuid.uuid4()
        
        # 1. Test POST
        response = client.post("/hands", json=payload)
        assert response.status_code == 201
        assert "uuid" in response.json()
        
        # 2. Test Service Logic (Implicit)
        # If the service crashed (e.g. bad PokerKit config), we wouldn't get 201.
        
        # 3. Test GET
        # Mock a returned entity
        mock_entity = MagicMock()
        mock_entity.hand_uuid = uuid.uuid4()
        mock_entity.stack_settings = payload["stack_settings"]
        mock_entity.dealer_index = 0
        mock_entity.small_blind_index = 1
        mock_entity.big_blind_index = 2
        mock_entity.player_cards = payload["player_cards"]
        mock_entity.actions_short = payload["actions_short"]
        mock_entity.winnings = {"Player 1": -20.0, "Player 3": 40.0} # Dummy winnings
        
        mock_get.return_value = [mock_entity]
        
        response_get = client.get("/hands")
        assert response_get.status_code == 200
        data = response_get.json()
        assert len(data) == 1
        assert "Hand:" in data[0]["uuid"]