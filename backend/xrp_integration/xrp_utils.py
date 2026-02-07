from xrpl.clients import JsonRpcClient
from xrpl.wallet import Wallet, generate_faucet_wallet
from config.config import settings

def get_client():
    return JsonRpcClient(settings.XRPL_NODE_URL)

def get_wallet_from_seed(seed: str = None):
    client = get_client()
    if seed:
        return Wallet.from_seed(seed)
    
    # Auto-generate if no seed provided (Testing ONLY)
    print("Warning: No GEO_PULSE_ISSUER_SEED found. Generating a temporary Testnet wallet...")
    wallet = generate_faucet_wallet(client, debug=True)
    print(f"Generated Wallet: {wallet.classic_address} | Seed: {wallet.seed}")
    return wallet
