import math
from datetime import datetime
from typing import List, Dict, Any

class AnalyticsEngine:
    """
    Expert statistical engine for engineering exam pattern analysis.
    Implements the Weighted Decay Algorithm and Prediction Confidence metrics.
    """
    
    @staticmethod
    def calculate_weighted_score(occurrences: List[Dict[str, Any]], decay_constant: float = 0.3) -> float:
        """
        Calculate importance score with exponential temporal decay.
        Formula: Σ (Frequency × e^(-λ * age))
        """
        current_year = datetime.now().year
        total_score = 0.0
        
        for record in occurrences:
            year = record.get("year", current_year)
            frequency = record.get("count", 0)
            age = max(0, current_year - year)
            
            # Weight decreases as age increases
            weight = math.exp(-decay_constant * age)
            total_score += frequency * weight
            
        return round(total_score, 2)

    @staticmethod
    def calculate_prediction_confidence(occurrences: List[Dict[str, Any]]) -> float:
        """
        Calculates confidence score (0-1) based on topic stability and recent appearance.
        High confidence = appeared consistently across years and specifically in recent years.
        """
        if not occurrences:
            return 0.0
            
        current_year = datetime.now().year
        years_present = {r.get("year") for r in occurrences}
        num_years = len(years_present)
        
        # Factor 1: Consistency (percentage of years covered in last 5 years)
        # Assuming we check a 5-year window
        consistency = min(1.0, num_years / 5.0)
        
        # Factor 2: Recency (Did it appear in the last 2 years?)
        recent_years = {current_year, current_year - 1}
        has_recency = 1.0 if years_present.intersection(recent_years) else 0.5
        
        # Combine factors
        confidence = (consistency * 0.6) + (has_recency * 0.4)
        return round(confidence, 2)
