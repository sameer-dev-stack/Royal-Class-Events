"""
Demand Prediction Model
Heuristic-based scoring for event demand prediction
"""

from datetime import datetime
from typing import Dict, Optional


class DemandPredictor:
    """Predicts event demand based on category, location, timing, and capacity"""
    
    # Category popularity scores (0-100)
    CATEGORY_SCORES = {
        "tech": 75,
        "technology": 75,
        "gala": 85,
        "business": 70,
        "networking": 65,
        "concert": 90,
        "music": 85,
        "sports": 80,
        "workshop": 60,
        "conference": 75,
        "meetup": 55,
        "party": 70,
        "charity": 50,
        "arts": 60,
        "food": 65,
        "education": 55,
        "wellness": 50,
    }
    
    # Location multipliers for Bangladesh (can be expanded)
    LOCATION_MULTIPLIERS = {
        "dhaka": 1.3,
        "chittagong": 1.1,
        "chattogram": 1.1,
        "sylhet": 0.9,
        "khulna": 0.85,
        "rajshahi": 0.85,
        "rangpur": 0.8,
        "barisal": 0.8,
        "comilla": 0.85,
    }
    
    def predict_demand(
        self,
        category: str,
        location: str,
        start_date: str,
        capacity: int,
        ticket_type: str = "free"
    ) -> Dict:
        """
        Predict event demand score
        
        Args:
            category: Event category (e.g., "tech", "gala")
            location: City name
            start_date: ISO format date string
            capacity: Maximum attendees
            ticket_type: "free" or "paid"
            
        Returns:
            {
                "demand_score": 0-100,
                "confidence": 0-1,
                "factors": {...}
            }
        """
        # Base score from category
        category_lower = category.lower()
        base_score = self.CATEGORY_SCORES.get(category_lower, 50)
        
        # Location factor
        location_lower = location.lower()
        location_multiplier = self.LOCATION_MULTIPLIERS.get(location_lower, 0.9)
        
        # Timing factor (weekends are better)
        timing_bonus = self._calculate_timing_bonus(start_date)
        
        # Capacity factor (too large = harder to fill)
        capacity_factor = self._calculate_capacity_factor(capacity)
        
        # Free vs Paid adjustment
        pricing_factor = 1.2 if ticket_type == "free" else 0.95
        
        # Calculate final score
        raw_score = (
            base_score * 
            location_multiplier * 
            pricing_factor +
            timing_bonus
        ) * capacity_factor
        
        # Clamp to 0-100
        demand_score = min(100, max(0, round(raw_score)))
        
        # Confidence based on data quality
        confidence = self._calculate_confidence(
            category_lower in self.CATEGORY_SCORES,
            location_lower in self.LOCATION_MULTIPLIERS
        )
        
        return {
            "demand_score": demand_score,
            "confidence": confidence,
            "factors": {
                "base_category_score": base_score,
                "location_multiplier": location_multiplier,
                "timing_bonus": timing_bonus,
                "capacity_factor": capacity_factor,
                "pricing_factor": pricing_factor,
            }
        }
    
    def _calculate_timing_bonus(self, start_date: str) -> float:
        """Calculate bonus score for optimal timing"""
        try:
            event_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
            weekday = event_date.weekday()
            
            # Friday (4) and Saturday (5) get bonus
            if weekday in [4, 5]:
                return 10
            # Sunday (6) gets smaller bonus
            elif weekday == 6:
                return 5
            # Weekdays
            else:
                return 0
        except:
            return 0
    
    def _calculate_capacity_factor(self, capacity: int) -> float:
        """Adjust score based on capacity (smaller events easier to fill)"""
        if capacity < 50:
            return 1.1
        elif capacity < 100:
            return 1.0
        elif capacity < 300:
            return 0.95
        elif capacity < 500:
            return 0.9
        else:
            return 0.85
    
    def _calculate_confidence(
        self, 
        known_category: bool, 
        known_location: bool
    ) -> float:
        """Calculate prediction confidence (0-1)"""
        confidence = 0.5  # Base confidence
        
        if known_category:
            confidence += 0.25
        if known_location:
            confidence += 0.25
            
        return round(confidence, 2)
    
    def forecast_revenue(
        self,
        demand_score: float,
        capacity: int,
        ticket_price: float,
        ticket_type: str = "paid"
    ) -> Dict:
        """
        Forecast revenue based on demand prediction
        
        Args:
            demand_score: Predicted demand (0-100)
            capacity: Maximum attendees
            ticket_price: Price per ticket
            ticket_type: "free" or "paid"
            
        Returns:
            {
                "expected_sales": int,
                "min_revenue": float,
                "expected_revenue": float,
                "max_revenue": float,
                "sell_through_probability": float
            }
        """
        if ticket_type == "free":
            return {
                "expected_sales": 0,
                "min_revenue": 0,
                "expected_revenue": 0,
                "max_revenue": 0,
                "sell_through_probability": demand_score / 100
            }
        
        # Convert demand score to expected sell-through %
        sell_through_pct = demand_score / 100
        
        # Expected sales
        expected_sales = int(capacity * sell_through_pct)
        
        # Revenue estimates (conservative, expected, optimistic)
        min_revenue = capacity * 0.3 * ticket_price  # 30% minimum
        expected_revenue = expected_sales * ticket_price
        max_revenue = capacity * ticket_price  # Full sell-out
        
        return {
            "expected_sales": expected_sales,
            "min_revenue": round(min_revenue, 2),
            "expected_revenue": round(expected_revenue, 2),
            "max_revenue": round(max_revenue, 2),
            "sell_through_probability": round(sell_through_pct, 2)
        }
