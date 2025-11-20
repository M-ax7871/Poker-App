from pokerkit import NoLimitTexasHoldem, Automation
import re
from typing import List, Dict

class PokerService:
    """
    Encapsulates all PokerKit logic.
    Follows SRP: Only responsible for game rule calculation.
    """

    @staticmethod
    def calculate_winnings(
        stack_settings: List[int],
        player_cards: Dict[str, List[str]],
        actions_short: List[str]
    ) -> Dict[str, float]:
        
        BIG_BLIND = 40
        SMALL_BLIND = 20
        MIN_BET = BIG_BLIND
        ANTE = 0
        NUM_PLAYERS = len(stack_settings)

        # 1. Create Game State
        state = NoLimitTexasHoldem.create_state(
            (
                Automation.ANTE_POSTING,
                Automation.BET_COLLECTION,
                Automation.BLIND_OR_STRADDLE_POSTING,
                Automation.HOLE_CARDS_SHOWING_OR_MUCKING,
                Automation.HAND_KILLING,
                Automation.CHIPS_PUSHING,
                Automation.CHIPS_PULLING,
            ),
            False,
            ANTE,
            (SMALL_BLIND, BIG_BLIND),
            MIN_BET,
            tuple(stack_settings),
            NUM_PLAYERS,
        )

        # 2. Deal Cards
        # CRITICAL FIX: Removed street check - deal hole cards immediately after state creation
        for i in range(NUM_PLAYERS):
            key = str(i)
            if key in player_cards and len(player_cards[key]) == 2:
                c = player_cards[key]
                card_str = f"{c[0]}{c[1]}"
                state.deal_hole(card_str)

        # 3. Process Actions
        # Regex to detect card strings like "2s", "7d", etc. (board cards)
        card_regex = re.compile(r'^[2-9TJQKA][scdh]')

        for action in actions_short:
            # Safety Check: Stop if hand is already finished
            if state.status is not None:
                break

            # Check if the action string is actually a board card (Flop/Turn/River)
            if card_regex.match(action):
                state.burn_card()
                state.deal_board(action)
                continue

            # Parse standard actions
            if action == 'f':
                state.fold()
            elif action == 'x' or action == 'c':
                state.check_or_call()
            elif action.startswith('b'):
                amount = int(action[1:])
                state.complete_bet_or_raise_to(amount)
            elif action.startswith('r'):
                amount = int(action[1:])
                state.complete_bet_or_raise_to(amount)
            elif action == 'allin':
                # Calculate all-in amount: current bet + remaining stack
                actor_index = state.actor_index
                if actor_index is not None:
                    actor_stack = state.stacks[actor_index]
                    current_bet = state.bets[actor_index]
                    state.complete_bet_or_raise_to(current_bet + actor_stack)

        # 4. Extract Winnings 
        winnings = {}
        for i in range(NUM_PLAYERS):
            player_key = f"Player {i + 1}"
            # Winnings = Final Stack - Initial Stack
            net_result = state.stacks[i] - stack_settings[i]
            winnings[player_key] = float(net_result)

        return winnings