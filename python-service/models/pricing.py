"""
Dynamic Pricing Model
Calculates optimal pricing based on demand and time factors
"""

from datetime import datetime
from typing import Dict


class PricingOptimizer:
    """Optimizes event pricing based on demand, time, and registrations"""
    
    def suggest_base_price(
        self,
        category: str,
        location: str,
        demand_score: float,
        capacity: int
    ) -> Dict:
        """
        Suggest initial price range for an event
        
        Args:
            category: Event category
            location: City name
            demand_score: Predicted demand (0-100)
            capacity: Maximum attendees
            
        Returns:
            {
                "suggested_price": float,
                "min_price": float,
                "max_price": float,
                "reasoning": str
            }
        """
        # Base prices by category (in local currency - BDT)
        base_prices = {
            "tech": 500,
            "technology": 500,
            "gala": 2000,
            "business": 800,
            "networking": 400,
            "concert": 1500,
            "music": 1000,
            "sports": 600,
            "workshop": 700,
            "conference": 1200,
            "meetup": 300,
            "party": 800,
            "charity": 500,
            "arts": 600,
            "food": 700,
            "education": 500,
            "wellness": 600,
        }
        
        category_lower = category.lower()
        base = base_prices.get(category_lower, 500)
        
        # Adjust for demand
        demand_multiplier = 0.7 + (demand_score / 100) * 0.6  # 0.7x to 1.3x
        
        # Adjust for location (premium cities)
        location_premium = 1.2 if location.lower() == "dhaka" else 1.0
        
        suggested_price = base * demand_multiplier * location_premium
        
        # Calculate range
        min_price = suggested_price * 0.7
        max_price = suggested_price * 1.5
        
        # Generate reasoning
        if demand_score >= 70:
            demand_level = "high"
        elif demand_score >= 50:
            demand_level = "moderate"
        else:
            demand_level = "low"
            
        reasoning = (
            f"Based on {demand_level} demand ({demand_score}%) for {category} "
            f"events in {location}, we suggest pricing between "
            f"৳{int(min_price)}-৳{int(max_price)}."
        )
        
        return {
            "suggested_price": round(suggested_price),
            "min_price": round(min_price),
            "max_price": round(max_price),
            "reasoning": reasoning
        }
    
    def calculate_dynamic_price(
        self,
        base_price: float,
        min_price: float,
        max_price: float,
        registrations: int,
        capacity: int,
        days_until_event: int
    ) -> Dict:
        """
        Calculate dynamic price based on current conditions
        
        Args:
            base_price: Original ticket price
            min_price: Minimum allowed price
            max_price: Maximum allowed price
            registrations: Current registration count
            capacity: Maximum capacity
            days_until_event: Days remaining until event
            
        Returns:
            {
                "new_price": float,
                "change_pct": float,
                "reason": str,
                "strategy": str
            }
        """
        fill_rate = registrations / capacity if capacity > 0 else 0
        
        # Initialize
        new_price = base_price
        strategy = "stable"
        
        # SURGE PRICING: High demand + lots of time = increase price
        if fill_rate > 0.7 and days_until_event > 7:
            new_price = base_price * 1.15
            strategy = "surge_pricing"
            reason = f"High demand ({int(fill_rate * 100)}% sold) with {days_until_event} days remaining"
        
        # SCARCITY PRICING: High fill rate close to event
        elif fill_rate > 0.5 and days_until_event <= 3:
            new_price = base_price * 1.10
            strategy = "scarcity_pricing"
            reason = f"Over 50% sold with only {days_until_event} days left"
        
        # EARLY BIRD DISCOUNT: Low sales + time running out
        elif fill_rate < 0.1 and days_until_event <= 7:
            new_price = base_price * 0.85
            strategy = "early_bird"
            reason = f"Low sales ({int(fill_rate * 100)}%) with {days_until_event} days remaining - offering discount"
        
        # FLASH SALE: Very low sales very close to event
        elif fill_rate < 0.2 and days_until_event <= 2:
            new_price = base_price * 0.75
            strategy = "flash_sale"
            reason = f"Flash sale: Only {days_until_event} days left and {int((1 - fill_rate) * 100)}% tickets available"
        
        else:
            reason = "Maintaining current price - demand is stable"
        
        # Respect min/max bounds
        new_price = max(min_price, min(max_price, new_price))
        
        # Calculate change percentage
        change_pct = ((new_price - base_price) / base_price) * 100 if base_price > 0 else 0
        
        return {
            "new_price": round(new_price),
            "change_pct": round(change_pct, 1),
            "reason": reason,
            "strategy": strategy
        }
