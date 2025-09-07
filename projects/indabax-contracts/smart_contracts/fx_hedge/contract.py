from algopy import ARC4Contract, String, UInt64, Txn, Global, arc4, subroutine
from algopy.arc4 import abimethod


RATE_PRECISION = 10000

class FXHedgeContract(ARC4Contract):
    """FX Hedging Smart Contract for SME currency risk management - Updated with sophisticated premium calculation"""
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

        # Calculate premium using the sophisticated formula
        premium = self.calculate_premium(notional_amount, baseline_rate, duration_days)

        # Store contract details in global state
        # Note: In a real implementation, you'd use proper state management
        # For now, we'll just return success with the calculated premium

        return String("Contract created successfully")
    
    @abimethod()
    def calculate_premium(
        self, 
        notional_amount: UInt64, 
        baseline_rate: UInt64, 
        duration_days: UInt64
    ) -> UInt64:
        """Calculate the premium amount using a sophisticated insurance formula
        In deployment, these values will be adaptive and estimated from historical data of the user"""
        # Mock values for volatility and safety factor (in basis points)
        # 20% volatility = 2000 basis points
        sigma_bps = UInt64(2000)  # 20% volatility
        # 1.20x safety factor = 12000 basis points  
        alpha_bps = UInt64(12000)  # 1.20x safety factor

        # Constants
        BPS_SCALE = UInt64(10000)  # 1.00 = 10000 bps
        DAYS_PER_YEAR = UInt64(365)

        # Calculate time fraction T/365
        T_frac = duration_days * 10000 // DAYS_PER_YEAR  # Scale by 10000 for precision
        sqrt_T = self._integer_sqrt(T_frac)

        # Core formula: N * sigma * sqrt(T/365) * alpha * (baseline_rate / 10000)
        # The baseline_rate is used to scale the premium based on the current exchange rate
        # Formula: (N * sigma_bps * alpha_bps * sqrt_T * baseline_rate) / (BPS_SCALE * BPS_SCALE * BPS_SCALE)
        numerator = notional_amount * sigma_bps * alpha_bps * sqrt_T * baseline_rate
        denominator = BPS_SCALE * BPS_SCALE * BPS_SCALE

        premium = numerator // denominator
        return premium
    
    @subroutine
    def _integer_sqrt(self, x: UInt64) -> UInt64:
        """Integer square root using binary search - compatible with AlgoPy"""
        if x == 0:
            return UInt64(0)
        
        # Binary search for square root
        left = UInt64(1)
        right = x
        
        while left <= right:
            mid = (left + right) // 2
            square = mid * mid
            
            if square == x:
                return mid
            elif square < x:
                left = mid + 1
            else:
                right = mid - 1
        
        return right

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
        target_rate: UInt64,  # Rate with 4 decimal places (e.g., 1.5% = 150)
        actual_rate: UInt64,  # Rate with 4 decimal places (e.g., 2.0% = 200)
        notional_amount: UInt64  # Amount in base units (e.g., microAlgos)
    ) -> UInt64:
        """Calculate the payout amount if contract succeeds"""
        if actual_rate <= target_rate:
            return UInt64(0)

        # Calculate the benefit from rate improvement
        rate_improvement = actual_rate - target_rate

        # Since rates are scaled by 10000 (4 decimal places), we need to account for this
        # Formula: (notional_amount * rate_improvement) / (target_rate * 10000)
        # This gives us: (amount * rate_diff) / (base_rate * precision_factor)

        # First multiply to get the full precision intermediate result
        numerator = notional_amount * rate_improvement

        # Then divide by target_rate and scale down by RATE_PRECISION (10000)
        # to convert from the double-scaled result back to base units
        RATE_PRECISION = UInt64(10000)
        denominator = target_rate * RATE_PRECISION
        payout = numerator // denominator
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
        premium = self.calculate_premium(notional_amount, baseline_rate, duration_days)
        return String("Contract summary calculated successfully")
    
    @abimethod()
    def convert_rate_to_decimal(self, rate_scaled: UInt64) -> UInt64:
        """Helper method to convert scaled rate back to decimal representation"""
        # This would be used by the frontend to display rates properly
        return rate_scaled // RATE_PRECISION
