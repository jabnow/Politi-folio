import os
import sys
import subprocess

# Add project root to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

try:
    from xrpl.clients import JsonRpcClient
    from xrpl.wallet import generate_faucet_wallet
    import textblob
    import nltk
except ImportError:
    print("Installing requirements...")
    # Find requirements.txt relative to this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    requirements_path = os.path.join(script_dir, "..", "requirements.txt")
    
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", requirements_path])
    from xrpl.clients import JsonRpcClient
    from xrpl.wallet import generate_faucet_wallet
    import textblob
    import nltk

def setup_environment():
    print("--- GeoPulse Backend Setup ---")
    
    # 0. Download NLP Data (Technical Strength: Local NLTK)
    print("Downloading NLTK Corpora for Sentiment Analysis...")
    try:
        nltk.download('punkt')
        nltk.download('averaged_perceptron_tagger')
        nltk.download('brown')
    except Exception as e:
        print(f"Warning: NLTK Download failed: {e}")

    # 1. Generate XRP Testnet Wallet
    print("Generating XRP Testnet Wallet for Issuer (this may take 10-20 seconds)...")
    wallet = None
    import time
    for attempt in range(3):
        try:
            print(f"Attempt {attempt+1}/3...")
            # Create a fresh client for each attempt to avoid stale connections
            client = JsonRpcClient("https://s.altnet.rippletest.net:51234") 
            wallet = generate_faucet_wallet(client, debug=True)
            break
        except Exception as e:
            print(f"Failed to generate wallet: {e}")
            time.sleep(2)
            
    if not wallet:
        print("Error: Could not generate wallet after 3 attempts. Network might be blocking Testnet.")
        print("Falling back to MOCK_MODE for blockchain layer.")
        wallet_seed = "MOCK_SEED"
    else:
        print(f"\nGenerated Wallet Address: {wallet.classic_address}")
        print(f"Generated Wallet Seed: {wallet.seed}")
        wallet_seed = wallet.seed
    
    # 2. Create .env file
    env_content = f"""DATABASE_URL=sqlite:///./geopulse.db
XRPL_NODE_URL=wss://s.altnet.rippletest.net:51233
GEO_PULSE_ISSUER_SEED={wallet_seed}
GEO_PULSE_CURRENCY_CODE=GEO
# OPENAI_API_KEY=sk-... (Add your key here for real AI)
"""
    
    # Write .env to project root (one level up from script)
    env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", ".env"))
    with open(env_path, "w") as f:
        f.write(env_content)
    
    print(f"\nCreated .env file at {env_path}")
    print("\nSetup Complete! You can now run 'python api/app.py' or 'python demo.py'")

if __name__ == "__main__":
    setup_environment()
