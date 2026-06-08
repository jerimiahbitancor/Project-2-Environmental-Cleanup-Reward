"use client";

import { useState, useEffect, useCallback } from "react";
import { useFreighter } from "@/hooks/useFreighter";
import { getBalances, hasUSDICTrustline } from "@/lib/stellar";
import { sendUSDCReward, pollTransaction } from "@/lib/payment";
import ClaimForm from "@/components/ClaimForm";
import HistoryList from "@/components/HistoryList";

interface Claim {
  weight: number;
  gps: string;
  photo: string;
  timestamp: string;
  txHash?: string;
}

export default function Home() {
  const { publicKey, isConnected, connect, getFreighter } = useFreighter();
  const [balances, setBalances] = useState<{ asset: string; balance: string }[]>([]);
  const [hasTrustline, setHasTrustline] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountData = useCallback(async () => {
    if (!publicKey) return;
    const [bal, trust] = await Promise.all([
      getBalances(publicKey),
      hasUSDICTrustline(publicKey),
    ]);
    setBalances(bal);
    setHasTrustline(trust);
  }, [publicKey]);

  useEffect(() => {
    getFreighter();
  }, [getFreighter]);

  useEffect(() => {
    if (publicKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      fetchAccountData();
    }
  }, [publicKey, fetchAccountData]);

  const handleClaimSubmit = async (data: { weight: number; gps: string; photo: string }) => {
    if (!publicKey) return;
    if (!hasTrustline) {
      setError("You must have a USDC trustline to receive rewards.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const amount = data.weight.toFixed(7); // Stellar uses 7 decimals
      const txHash = await sendUSDCReward(publicKey, amount);
      
      const newClaim: Claim = {
        ...data,
        timestamp: new Date().toLocaleString(),
        txHash,
      };

      await pollTransaction(txHash);
      
      setClaims((prev) => [newClaim, ...prev]);
      await fetchAccountData();
      alert(`Success! Reward of ${amount} USDC sent.`);
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process reward");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-green-600 mb-2">
            Environmental Cleanup Rewards
          </h1>
          <p className="text-gray-600">Clean our environment and earn USDC rewards.</p>
        </div>

        {!isConnected ? (
          <div className="text-center bg-white p-8 rounded-lg shadow-md border">
            <p className="mb-4 text-gray-700">Connect your Freighter wallet to get started.</p>
            <button
              onClick={connect}
              className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 transition"
            >
              Connect Freighter
            </button>
          </div>
        ) : (
          <div className="space-y-8">
            <div className="bg-white p-6 rounded-lg shadow-md border">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Collector Wallet</h2>
              <p className="text-sm text-gray-500 break-all mb-4">{publicKey}</p>
              
              <div className="grid grid-cols-2 gap-4">
                {balances.map((b) => (
                  <div key={b.asset} className="bg-gray-50 p-3 rounded border">
                    <p className="text-xs text-gray-500 uppercase">{b.asset}</p>
                    <p className="text-xl font-bold">{parseFloat(b.balance).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {!hasTrustline && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-700">
                  <p className="font-bold">USDC Trustline Missing</p>
                  <p className="mb-2">You need to add a trustline for USDC to receive rewards.</p>
                  <a
                    href={`https://laboratory.stellar.org/#txbuilder?params=eyJhdHRyaWJ1dGVzIjp7ImZlZSI6IjEwMCIsIm5ldHdvcmtQYXNzcGhyYXNlIjoiVGVzdCBOZXQuLi4iLCJzb3VyY2VBY2NvdW50IjoiIn0sIm9wZXJhdGlvbnMiOlt7ImlkIjowLCJ0eXBlIjoiY2hhbmdlVHJ1c3QiLCJhdHRyaWJ1dGVzIjp7ImxpbmUiOnsiYXNzZXRfY29kZSI6IlVTREMiLCJhc3NldF9pc3N1ZXIiOiJHREI0N0lGNkxXSzdQN01ERVZSQ1c3RFBVV1YzTlkzRFRRRVZGTDROQVQ0QVFIM1pMTExGTEE1In0sImxpbWl0IjoiIn19XX0%3D&network=testnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline font-medium"
                  >
                    Add Trustline via Stellar Lab
                  </a>
                </div>
              )}
            </div>

            <div className="bg-red-50 p-3 border border-red-200 rounded text-xs text-red-700">
              <strong>Warning:</strong> This is a hackathon demo. The NGO secret key is exposed in the browser. In production, payments should be handled by a secure backend.
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <ClaimForm onSubmit={handleClaimSubmit} isLoading={isLoading} />
            
            <HistoryList claims={claims} />
          </div>
        )}
      </div>
    </main>
  );
}
