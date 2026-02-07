import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from xrp_integration.xrp_utils import get_client, get_wallet_from_seed
from xrpl.models.transactions import AccountSet, AccountSetFlag, Payment
from xrpl.transaction import autofill_and_sign, submit_and_wait
from xrpl.models.amounts import IssuedCurrencyAmount
from config.config import settings

def deploy_token():
    print("--- Politifolio Token Deployment ---")
    
    # 1. Connect
    print("Connecting to XRPL...")
    client = get_client()
    seed = settings.GEO_PULSE_ISSUER_SEED
    
    if not seed or seed == "MOCK_SEED":
        print("Warning: Running in MOCK MODE. Simulating deployment logic...")
        wallet = None
        # Mock wallet object for display
        class MockWallet:
            classic_address = "rMockIssuerAddress123456"
        wallet = MockWallet()
    else:
        wallet = get_wallet_from_seed(seed)
    
    print(f"Issuer Account: {wallet.classic_address}")

    # 2. Configure Issuer (Meaningful Compliance Setup)
    print("\nConfiguring Issuer Settings (Compliance Mode)...")
    
    # Enable RequireAuth (0x00040000) - Only authorized trustlines can hold token
    # Disable DefaultRipple (0x00800000) - Prevent unauthorized rippling
    
    # Constants for AccountSet Flags (asf)
    ASF_REQUIRE_AUTH = 2
    ASF_DEFAULT_RIPPLE = 8

    settings_tx = AccountSet(
        account=wallet.classic_address,
        set_flag=ASF_DEFAULT_RIPPLE
    )
    
    try:
        print("Enabling 'RequireAuth' (Restricted Asset Mode)...")
        if seed == "MOCK_SEED":
            print("[Mock Ledger] Transaction: AccountSet (SetFlag: asf_require_auth)")
            print("[Mock Ledger] Result: tesSUCCESS")
            print("Success: RequireAuth Enabled. Users must be whitelisted to hold GEO.")
        else:
            tx = AccountSet(
                account=wallet.classic_address,
                set_flag=ASF_REQUIRE_AUTH
            )
            signed = autofill_and_sign(tx, client, wallet)
            res = submit_and_wait(signed, client)
            if res.is_successful():
                print("Success: RequireAuth Enabled. Users must be whitelisted to hold GEO.")
            else:
                print(f"Warning: Could not enable RequireAuth: {res.result.get('engine_result_message')}")
    except Exception as e:
        print(f"Configuration skipped: {e}")

    # 3. Mint / Issue
    # In XRPL, you don't "mint" to yourself. You "issue" by paying someone else.
    # To "Deploy", we essentially just define the currency code.
    print(f"\nToken '{settings.GEO_PULSE_CURRENCY_CODE}' is ready to be issued.")
    print("To use it meaningfully:")
    print("1. Users create a TrustLine to your Issuer Address.")
    print("2. You (Issuer) must Approve the TrustLine (because RequireAuth is On).")
    print("3. You send them tokens.")
    
    print("\nDeployment Complete (Configuration Phase).")

if __name__ == "__main__":
    deploy_token()
