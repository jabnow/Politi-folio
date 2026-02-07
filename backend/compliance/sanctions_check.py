import csv
import os
import difflib

# Load Sanctions DB into memory on startup
SANCTIONS_DB = []
csv_path = os.path.join(os.path.dirname(__file__), "..", "data", "sanctions.csv")
if os.path.exists(csv_path):
    with open(csv_path, "r") as f:
        reader = csv.DictReader(f)
        for row in reader:
            SANCTIONS_DB.append(row)

def check_sanction_list(name: str, country: str):
    """
    Performs computational fuzzy matching against a sanctions database.
    Uses SequenceMatcher to calculate string similarity (0.0 to 1.0).
    """
    # 1. Check Country Exact Match
    sanctioned_countries = ["NK", "IR", "SY", "CU", "VE", "RU"]
    if country.upper() in sanctioned_countries:
        return True, f"Country {country} is strictly sanctioned."

    # 2. Fuzzy Name Matching (Computational)
    threshold = 0.75 # 75% similarity required to flag
    
    for entry in SANCTIONS_DB:
        # Calculate similarity ratio
        similarity = difflib.SequenceMatcher(None, name.upper(), entry["name"].upper()).ratio()
        
        if similarity > threshold:
            return True, f"Name Match Detected: '{name}' is {round(similarity*100)}% similar to sanctioned entity '{entry['name']}' ({entry['type']})"

    return False, "Clear"
