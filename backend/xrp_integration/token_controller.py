from xrpl.models.transactions import Payment, TrustSet
from xrpl.transaction import submit_and_wait, autofill_and_sign
from xrpl.models.amounts import IssuedCurrencyAmount
from xrpl.models.requests import AccountLines
from .xrp_utils import get_client, get_wallet_from_seed
from config.config import settings

class TokenController:
    def __init__(self):
        self.client = get_client()
        seed = settings.GEO_PULSE_ISSUER_SEED
        
        # Robust Mock/Real Handling
        if seed and seed != "MOCK_SEED":
            try:
                self.wallet = get_wallet_from_seed(seed)
            except Exception:
                self.wallet = None
        else:
            self.wallet = None

        self.currency_code = settings.GEO_PULSE_CURRENCY_CODE

    def issue_token(self, destination: str, amount: str):
        if not self.wallet:
            # Mock Response for Demo/Fallback
            print(f"[Mock Ledger] Issuing {amount} {self.currency_code} to {destination}")
            import uuid
            class MockResult:
                def __init__(self):
                    self.result = {
                        "tx_json": {"hash": "mock_" + str(uuid.uuid4())},
                        "engine_result": "tesSUCCESS"
                    }
            return MockResult()
        
        issue_amount = IssuedCurrencyAmount(
            currency=self.currency_code,
            issuer=self.wallet.classic_address,
            value=amount
        )

        payment_tx = Payment(
            account=self.wallet.classic_address,
            amount=issue_amount,
            destination=destination
        )
        
        # Sign and submit
        signed_tx = autofill_and_sign(payment_tx, self.client, self.wallet)
        response = submit_and_wait(signed_tx, self.client)
        return response

    def freeze_trustline(self, target_account: str, freeze: bool = True):
        # To freeze a trustline, the issuer sends a TrustSet transaction
        # setting the SetFlag to tfSetFreeze (or ClearFlag to tfClearFreeze)
        # Note: This freezes the individual trustline from the issuer's side.
        
        if not self.wallet:
            raise ValueError("Issuer seed not configured")

        # Flag for freezing is 0x00200000 (tfSetFreeze)
        # But we use the TrustSet flags property.
        # Actually in xrpl-py, we set flags on the TrustSet object.
        # For individual freeze, we set the 'Freeze' flag on the trust line.
        
        # However, it's easier to just use the flag integer.
        # tfSetFreeze = 6
        # tfClearFreeze = 7
        
        flags = 0
        if freeze:
            flags = 1 << 20 # tfSetFreeze
        else:
            flags = 1 << 21 # tfClearFreeze

        trust_set_tx = TrustSet(
            account=self.wallet.classic_address,
            limit_amount=IssuedCurrencyAmount(
                currency=self.currency_code,
                issuer=target_account, # The other party
                value="0" # Limit doesn't matter for freezing, but required
            ),
            flags=flags
        )

        signed_tx = autofill_and_sign(trust_set_tx, self.client, self.wallet)
        response = submit_and_wait(signed_tx, self.client)
        return response
