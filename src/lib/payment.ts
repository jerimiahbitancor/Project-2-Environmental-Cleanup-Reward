import {
  Networks,
  TransactionBuilder,
  Keypair,
  Operation,
} from "@stellar/stellar-sdk";
import { getStellarServer, USDC_ASSET } from "./stellar";

export async function sendUSDCReward(
  destination: string,
  amount: string
): Promise<string> {
  const server = getStellarServer();
  const ngoSecretKey = process.env.NGO_SECRET_KEY!;
  const ngoKeypair = Keypair.fromSecret(ngoSecretKey);
  const ngoPublicKey = ngoKeypair.publicKey();

  const account = await server.loadAccount(ngoPublicKey);

  const transaction = new TransactionBuilder(account, {
    fee: "1000", // 1000 stroops = 0.0001 XLM
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: USDC_ASSET,
        amount: amount,
      })
    )
    .setTimeout(60)
    .build();

  transaction.sign(ngoKeypair);

  const result = await server.submitTransaction(transaction);
  return result.hash;
}

export async function pollTransaction(hash: string, maxAttempts = 60): Promise<unknown> {
  const server = getStellarServer();
  let attempts = 0;

  while (attempts < maxAttempts) {
    try {
      const tx = await server.transactions().transaction(hash).call();
      if (tx) return tx;
    } catch {
      // Transaction not found yet
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
    attempts++;
  }
  throw new Error("Transaction polling timed out");
}
