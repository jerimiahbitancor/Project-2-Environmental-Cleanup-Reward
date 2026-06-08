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
      const amount = data.weight.toFixed(7);
      const txHash = await sendUSDCReward(publicKey, amount);
      
      const newClaim: Claim = {
        ...data,
        timestamp: new Date().toLocaleString(),
        txHash,
      };

      await pollTransaction(txHash);
      
      setClaims((prev) => [newClaim, ...prev]);
      await fetchAccountData();
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to process reward");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Navbar / Header */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-emerald-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center space-x-2">
              <div className="bg-emerald-600 p-2 rounded-xl">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="text-xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
                ECO-REWARD
              </span>
            </div>
            
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-3 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100">
                <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold text-emerald-700 font-mono">
                  {publicKey?.slice(0, 6)}...{publicKey?.slice(-4)}
                </span>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Hero Section */}
        <section className="text-center space-y-4">
          <h1 className="text-5xl sm:text-6xl font-black text-slate-900 tracking-tight leading-tight">
            Turn <span className="text-emerald-600">Cleanups</span> into <br />
            Digital <span className="text-emerald-600 underline decoration-emerald-200 underline-offset-8">Assets</span>.
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto font-medium">
            Join the decentralized environmental movement. Collect waste, submit proof, and earn USDC rewards instantly.
          </p>
        </section>

        {!isConnected ? (
          <section className="max-w-md mx-auto">
            <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-emerald-100 border border-emerald-50 text-center space-y-8">
              <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
                <svg className="h-10 w-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-slate-800">Ready to Earn?</h3>
                <p className="text-slate-500 font-medium">Connect your Freighter wallet to access the rewards dashboard.</p>
              </div>
              <button
                onClick={connect}
                className="w-full bg-slate-900 text-white py-4 px-8 rounded-2xl font-bold text-lg hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200"
              >
                Connect Freighter
              </button>
              <p className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                Secured by Stellar Network
              </p>
            </div>
          </section>
        ) : (
          <div className="space-y-12 animate-in fade-in duration-700">
            {/* Wallet Dashboard */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-50 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Account</h3>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                      {publicKey?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{publicKey}</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase">Testnet Verified</p>
                    </div>
                  </div>
                </div>
                
                {!hasTrustline && (
                  <div className="mt-6 p-4 bg-orange-50 rounded-2xl border border-orange-100">
                    <p className="text-[10px] font-black text-orange-600 uppercase mb-1">Attention</p>
                    <p className="text-xs text-orange-800 font-bold mb-3">USDC trustline required.</p>
                    <a
                      href={`https://laboratory.stellar.org/#txbuilder?params=eyJhdHRyaWJ1dGVzIjp7ImZlZSI6IjEwMCIsIm5ldHdvcmtQYXNzcGhyYXNlIjoiVGVzdCBOZXQuLi4iLCJzb3VyY2VBY2NvdW50IjoiIn0sIm9wZXJhdGlvbnMiOlt7ImlkIjowLCJ0eXBlIjoiY2hhbmdlVHJ1c3QiLCJhdHRyaWJ1dGVzIjp7ImxpbmUiOnsiYXNzZXRfY29kZSI6IlVTREMiLCJhc3NldF9pc3N1ZXIiOiJHREI0N0lGNkxXSzdQN01ERVZSQ1c3RFBVV1YzTlkzRFRRRVZGTDROQVQ0QVFIM1pMTExGTEE1In0sImxpbWl0IjoiIn19XX0%3D&network=testnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-[10px] font-black bg-orange-600 text-white px-3 py-1.5 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      ADD TRUSTLINE
                    </a>
                  </div>
                )}
              </div>

              <div className="md:col-span-2 grid grid-cols-2 gap-6">
                {balances.map((b) => (
                  <div key={b.asset} className="bg-white p-8 rounded-[2rem] shadow-sm border border-emerald-50 relative overflow-hidden group hover:border-emerald-200 transition-all">
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      {b.asset === 'XLM' ? (
                        <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"/></svg>
                      ) : (
                        <svg className="h-24 w-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1.41 16.09V20h-2.82v-1.91c-2.47-.38-4.14-1.89-4.14-3.69h2.24c0 .87 1.05 1.76 1.9 1.76s1.9-.89 1.9-1.76c0-.85-1.04-1.6-2.52-1.6H8.5c-2.06 0-3.64-1.42-3.64-3.51 0-1.85 1.5-3.37 3.61-3.69V4h2.82v1.91c1.94.34 3.51 1.76 3.51 3.59h-2.24c0-1.12-1.05-1.76-1.9-1.76s-1.9.89-1.9 1.76c0 .85 1.04 1.6 2.52 1.6h1.47c2.06 0 3.64 1.42 3.64 3.51 0 1.85-1.5 3.37-3.61 3.69z"/></svg>
                      )}
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{b.asset === 'XLM' ? 'Stellar' : 'USDC'}</p>
                    <div className="flex items-baseline space-x-2">
                      <p className="text-3xl font-black text-slate-900">{parseFloat(b.balance).toFixed(2)}</p>
                      <p className="text-sm font-bold text-slate-400">{b.asset}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Main Content Area */}
            <section className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              <div className="lg:col-span-3">
                <ClaimForm onSubmit={handleClaimSubmit} isLoading={isLoading} />
              </div>
              
              <div className="lg:col-span-2">
                <div className="bg-slate-900 rounded-[2rem] p-8 text-white space-y-6 shadow-xl shadow-slate-200 border border-slate-800">
                  <h3 className="text-xl font-bold italic tracking-tight">NGO Dashboard Notice</h3>
                  <div className="space-y-4 text-slate-400 text-sm font-medium leading-relaxed">
                    <p>
                      This hackathon demo environment signs payments directly in the browser for immediate feedback.
                    </p>
                    <p className="p-3 bg-red-900/30 rounded-xl border border-red-900/50 text-red-200 text-xs font-bold leading-relaxed">
                      ⚠️ SECURITY: NGO secret key is exposed. In production, this logic MUST move to a secure backend with administrative verification.
                    </p>
                    <ul className="space-y-2 text-xs">
                      <li className="flex items-center space-x-2">
                        <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                        <span>Network: Stellar Testnet</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                        <span>Asset: USDC (GBBD47...FLA5)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className="h-1 w-1 bg-emerald-500 rounded-full" />
                        <span>Rate: 1.00 USDC / 1.00 KG</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-2xl flex items-center space-x-3 animate-in fade-in zoom-in duration-300">
                    <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs font-bold">{error}</p>
                  </div>
                )}
              </div>
            </section>
            
            <HistoryList claims={claims} />
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-emerald-50 text-center">
        <p className="text-slate-400 text-xs font-black uppercase tracking-[0.2em]">
          Built for StellarX Philippines Hackathon 2026
        </p>
      </footer>
    </main>
  );
}
