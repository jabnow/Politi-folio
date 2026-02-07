import dotenv from 'dotenv';
import { Client, Wallet, dropsToXrp } from 'xrpl';

// ────────────────────────────────────────────────
dotenv.config();

const XRPL_NODE = process.env.XRPL_NODE_URL || 'wss://testnet.xrpl-labs.com/';

async function issueGeoPulseToken() {
  const client = new Client(XRPL_NODE);

  try {
    console.log(`Connecting to ${XRPL_NODE} …`);
    await client.connect();
    console.log('Connected.');

    // ── Load issuer wallet ───────────────────────────────
    if (!process.env.GEO_PULSE_ISSUER_SEED) throw new Error('GEO_PULSE_ISSUER_SEED missing in .env');
    const issuer = Wallet.fromSeed(process.env.GEO_PULSE_ISSUER_SEED);
    console.log(`Issuer address: ${issuer.address}`);

    // ── Load destination info ─────────────────────────────
    if (!process.env.DESTINATION_ADDRESS) throw new Error('DESTINATION_ADDRESS missing in .env');
    const destination = process.env.DESTINATION_ADDRESS.trim();

    if (destination === issuer.address) {
      throw new Error('Destination cannot be issuer (would cause temREDUNDANT)');
    }

    if (!process.env.DESTINATION_SEED) throw new Error('DESTINATION_SEED missing in .env — needed to sign TrustSet');
    const destWallet = Wallet.fromSeed(process.env.DESTINATION_SEED);

    if (destWallet.address !== destination) {
      throw new Error('DESTINATION_SEED does not match DESTINATION_ADDRESS');
    }

    console.log(`Target destination: ${destination}`);

    // ── Check destination exists & get its current sequence ───────
    let destInfo;
    try {
      destInfo = await client.request({
        command: 'account_info',
        account: destination,
        ledger_index: 'validated'
      });
      console.log(`Destination exists — balance: ${dropsToXrp(destInfo.result.account_data.Balance)} XRP`);
    } catch (err) {
      if (err.data?.error === 'actNotFound') {
        console.error(`ERROR: ${destination} not funded. Use https://testnet.xrpl.org faucet`);
        return;
      }
      throw err;
    }

    const destSequence = destInfo.result.account_data.Sequence;

    // ── Check for existing trust line ──────────────────────────────
    const linesResp = await client.request({
      command: 'account_lines',
      account: destination,
      ledger_index: 'validated'
    });

    const currencyCode = process.env.GEO_PULSE_CURRENCY_CODE?.trim() || 'POL';
    const hasTrustLine = linesResp.result.lines.some(
      line => line.currency === currencyCode && line.account === issuer.address
    );

    if (!hasTrustLine) {
      console.log(`No trust line to ${issuer.address} for ${currencyCode} — creating one...`);

      const trustSetTx = await client.submitAndWait(
        {
          TransactionType: 'TrustSet',
          Account: destination,
          LimitAmount: {
            currency: currencyCode,
            issuer: issuer.address,
            value: '1000000000'     // very large limit — adjust if wanted
          },
          Flags: 0,                 // no special flags needed here
          Sequence: destSequence,
          Fee: '12'
        },
        { wallet: destWallet }
      );

      if (trustSetTx.result.meta.TransactionResult !== 'tesSUCCESS') {
        throw new Error(`TrustSet failed: ${trustSetTx.result.meta.TransactionResult}`);
      }

      console.log('Trust line created successfully!');

      // Brief wait — ledger propagation can be slow on testnet sometimes
      await new Promise(r => setTimeout(r, 4000));

      // Re-check lines (optional but safer)
      const recheck = await client.request({
        command: 'account_lines',
        account: destination,
        ledger_index: 'validated'
      });
      const nowHas = recheck.result.lines.some(
        l => l.currency === currencyCode && l.account === issuer.address
      );
      if (!nowHas) throw new Error('Trust line disappeared after creation — very rare');
    } else {
      console.log(`Trust line for ${currencyCode} already exists.`);
    }

    // ── Get fresh issuer sequence ────────────────────────────────
    const issuerInfo = await client.request({
      command: 'account_info',
      account: issuer.address,
      ledger_index: 'validated'
    });
    const issuerSequence = issuerInfo.result.account_data.Sequence;
    console.log(`Issuer sequence: ${issuerSequence}`);

    // ── Issue tokens ──────────────────────────────────────────────
    console.log(`Issuing 1,000,000 ${currencyCode} …`);

    const paymentTx = await client.submitAndWait(
      {
        TransactionType: 'Payment',
        Account: issuer.address,
        Destination: destination,
        Amount: {
          currency: currencyCode,
          value: '1000000',
          issuer: issuer.address
        },
        Sequence: issuerSequence,
        Fee: '12'
      },
      { wallet: issuer }
    );

    const resultCode = paymentTx.result.meta.TransactionResult;

    console.log('\nPayment submitted.');
    console.log('Result code :', resultCode);
    console.log('Hash       :', paymentTx.result.hash);

    if (resultCode === 'tesSUCCESS') {
      console.log('\nSUCCESS — tokens issued!');
      console.log('Full meta:', JSON.stringify(paymentTx.result.meta, null, 2));
    } else {
      console.log('Failed. Full result:', JSON.stringify(paymentTx.result, null, 2));
    }

  } catch (error) {
    console.error('\nError occurred:');
    console.error(error);

    if (error?.data) {
      console.error('XRPL details:', error.data);
    }
  } finally {
    await client.disconnect();
    console.log('Disconnected.');
  }
}

issueGeoPulseToken();
