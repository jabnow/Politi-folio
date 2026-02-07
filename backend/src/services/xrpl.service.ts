import { Client, Wallet, dropsToXrp, xrpl } from 'xrpl';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class XrplService {
  private client = new Client(process.env.XRPL_NODE_URL!);

  async connect() {
    if (!this.client.isConnected()) {
      await this.client.connect();
    }
  }

  // Monitor transactions for a specific account
  async monitorTransactions(address: string, limit = 200) {
    await this.connect();
    const resp = await this.client.request({
      command: 'account_tx',
      account: address,
      limit,
      forward: false,
    });

    return resp.result.transactions.map(tx => ({
      hash: tx.tx.hash,
      sender: tx.tx.Account,
      receiver: tx.tx.Destination,
      amount: tx.tx.Amount ? dropsToXrp(tx.tx.Amount) : tx.tx.DeliveredAmount,
      currency: tx.tx.Currency || 'XRP',
      timestamp: new Date((Number(tx.tx.date) + 946684800) * 1000),
      riskScore: Math.floor(Math.random() * 100), // Placeholder, replace with actual risk scoring later
    }));
  }

  // Get the current balance of a wallet
  async getBalance(walletAddress: string): Promise<number> {
    await this.connect();
    const response = await this.client.request({
      command: 'account_info',
      account: walletAddress,
      strict: true,
      ledger_index: 'validated',
    });

    if (response.result && response.result.account_data) {
      const balance = dropsToXrp(response.result.account_data.Balance);
      return balance;
    } else {
      throw new Error('Unable to fetch balance');
    }
  }

  // Issue a token (currency) on the XRPL network
  async issueToken(issuerWallet: Wallet, currencyCode: string, amount: string, destination: string) {
    await this.connect();
    const tx = await this.client.submitAndWait({
      TransactionType: 'Payment',
      Account: issuerWallet.address,
      Destination: destination,
      Amount: {
        currency: currencyCode,
        value: amount,
        issuer: issuerWallet.address,
      },
    }, { wallet: issuerWallet });

    return tx.result;
  }

  // Poll the wallet for balance updates
  async monitorBalance(walletAddress: string) {
    let previousBalance = await this.getBalance(walletAddress);
    console.log(`Initial Balance: ${previousBalance} XRP`);

    setInterval(async () => {
      try {
        const currentBalance = await this.getBalance(walletAddress);
        if (currentBalance !== previousBalance) {
          console.log(`Balance updated: ${currentBalance} XRP`);
          previousBalance = currentBalance;
        }
      } catch (error) {
        console.error('Error checking balance:', error);
      }
    }, 5000); // Poll every 5 seconds
  }
}
