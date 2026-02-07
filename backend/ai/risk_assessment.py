import random
import math

# Technical: Multi-Factor Weighted Risk Engine (Simulation)
# Simulating real-world indicators:
# - Political Stability (0-10, lower is better)
# - Sanction Level (0-10, lower is better)
# - Corruption Index (0-10, lower is better)

COUNTRY_DATA_KB = {
    "US": {"stability": 2, "sanction": 0, "corruption": 2},
    "UK": {"stability": 2, "sanction": 0, "corruption": 1},
    "FR": {"stability": 3, "sanction": 0, "corruption": 2},
    "DE": {"stability": 1, "sanction": 0, "corruption": 1},
    "JP": {"stability": 1, "sanction": 0, "corruption": 1},
    "CN": {"stability": 4, "sanction": 2, "corruption": 4},
    "RU": {"stability": 6, "sanction": 9, "corruption": 7},
    "NK": {"stability": 9, "sanction": 10, "corruption": 9},
    "IR": {"stability": 8, "sanction": 10, "corruption": 8},
    "VE": {"stability": 9, "sanction": 8, "corruption": 9},
}

def calculate_risk_score(country_code: str, entity_name: str = None) -> float:
    """
    Calculates a risk score using a weighted multi-factor model and Volatility Simulation.
    """
    
    # 1. Retrieve Fundamental Data
    data = COUNTRY_DATA_KB.get(country_code, {"stability": 5, "sanction": 5, "corruption": 5})
    
    # 2. Fundamental Score
    fund_score = (data["stability"] * 0.4) + (data["sanction"] * 0.4) + (data["corruption"] * 0.2)
    fund_score = fund_score * 10 # Scale to 0-100
    
    # 3. Volatility Simulation (Computational)
    # Simulate 30 days of risk events to find Standard Deviation (Volatility)
    # This mocks a Monte Carlo simulation for "Political Event Risk"
    simulated_events = []
    base_volatility = data["stability"] * 2 # Higher instability = higher volatility
    
    for _ in range(30):
        # Random walk fluctuation based on volatility
        daily_fluctuation = random.gauss(0, base_volatility)
        simulated_events.append(daily_fluctuation)
    
    # Calculate Standard Deviation of the simulation
    mean = sum(simulated_events) / len(simulated_events)
    variance = sum((x - mean) ** 2 for x in simulated_events) / len(simulated_events)
    std_dev = math.sqrt(variance)
    
    # 4. Final Risk Score = Fundamental + (Volatility Impact)
    final_score = fund_score + (std_dev * 2)
    
    # 5. Entity Specific Heuristics
    if entity_name and any(x in entity_name.lower() for x in ["limited", "shell", "offshore", "trust"]):
        final_score += 15
        
    return round(min(final_score, 100.0), 2)
