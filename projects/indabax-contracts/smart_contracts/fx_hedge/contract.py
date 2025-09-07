from algopy import ARC4Contract, String, UInt64, Txn, Global, arc4
from algopy.arc4 import abimethod


RATE_PRECISION = UInt64(10000)

class FXHedgeContract(ARC4Contract):
    """FX Hedging Smart Contract for SME currency risk management"""
    @abimethod()
    def create_contract(
        self,
        baseline_rate: UInt64,  # Rate with 4 decimal places (e.g., 185000 for 18.5000)
        target_rate: UInt64,    # Rate with 4 decimal places (e.g., 190000 for 19.0000)
        notional_amount: UInt64,  # Amount in micro-units (e.g., 100000000 for $100)
        duration_days: UInt64
    ) -> String:
        """Create a new FX hedging contract"""
        # Validate inputs
        assert baseline_rate > 0, "Baseline rate must be positive"
        assert target_rate > 0, "Target rate must be positive"
        assert notional_amount > 0, "Notional amount must be positive"
        assert duration_days > 0, "Duration must be positive"

        # Calculate premium (3% of notional for now - can be made dynamic)
        premium = notional_amount * 3 // 100

        # Store contract details in global state
        # Note: In a real implementation, you'd use proper state management
        # For now, we'll just return success with the calculated premium

        return String("Contract created successfully")
    
    @abimethod()
    def calculate_premium(self, notional_amount: UInt64) -> UInt64:
        """Calculate the premium amount (3% of notional)"""
        return notional_amount * 3 // 100
    
    @abimethod()
    def simulate_settlement(
        self,
        target_rate: UInt64,  # Rate with 4 decimal places
        actual_rate: UInt64,  # Rate with 4 decimal places
        notional_amount: UInt64
    ) -> String:
        """Simulate contract settlement based on rates"""
        if actual_rate <= target_rate:
            return String("Contract would fail - rate did not improve sufficiently")
        else:
            # Calculate the benefit from rate improvement
            rate_improvement = actual_rate - target_rate
            # Convert notional to same precision as rates for calculation
            notional_scaled = notional_amount * RATE_PRECISION
            payout = (notional_scaled * rate_improvement) // (target_rate * RATE_PRECISION)
            return String("Contract would succeed - rate improved as expected")
    
    @abimethod()
    def calculate_payout(
        self,
        target_rate: UInt64,  # Rate with 4 decimal places
        actual_rate: UInt64,  # Rate with 4 decimal places
        notional_amount: UInt64
    ) -> UInt64:
        """Calculate the payout amount if contract succeeds"""
        if actual_rate <= target_rate:
            return UInt64(0)
        
        # Calculate the benefit from rate improvement
        rate_improvement = actual_rate - target_rate
        # Convert notional to same precision as rates for calculation
        notional_scaled = notional_amount * RATE_PRECISION
        payout = (notional_scaled * rate_improvement) // (target_rate * RATE_PRECISION)
        
        return payout
    
    @abimethod()
    def get_contract_summary(
        self,
        baseline_rate: UInt64,  # Rate with 4 decimal places
        target_rate: UInt64,    # Rate with 4 decimal places
        notional_amount: UInt64,
        duration_days: UInt64
    ) -> String:
        """Get a summary of contract parameters"""
        premium = notional_amount * 3 // 100
        return String("Contract summary calculated successfully")
    
    @abimethod()
    def convert_rate_to_decimal(self, rate_scaled: UInt64) -> UInt64:
        """Helper method to convert scaled rate back to decimal representation"""
        # This would be used by the frontend to display rates properly
        return rate_scaled // RATE_PRECISION
