import {
  Horizon,
  Asset,
} from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";
const server = new Horizon.Server(HORIZON_URL);

export const getStellarServer = () => server;

export const USDC_ASSET = new Asset(
  "USDC",
  process.env.NEXT_PUBLIC_USDC_ISSUER!
);

export async function getBalances(publicKey: string) {
  try {
    const account = await server.loadAccount(publicKey);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const balances = account.balances.map((b: any) => ({
      asset: "asset_code" in b ? b.asset_code : "XLM",
      balance: b.balance,
    }));
    return balances;
  } catch {
    return [];
  }
}

export async function hasUSDICTrustline(publicKey: string) {
  try {
    const account = await server.loadAccount(publicKey);
    return account.balances.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (b: any) =>
        "asset_code" in b &&
        b.asset_code === "USDC" &&
        b.asset_issuer === process.env.NEXT_PUBLIC_USDC_ISSUER
    );
  } catch {
    return false;
  }
}
