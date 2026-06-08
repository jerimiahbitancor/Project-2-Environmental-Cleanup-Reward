interface Claim {
  weight: number;
  gps: string;
  photo: string;
  timestamp: string;
  txHash?: string;
}

export default function HistoryList({ claims }: { claims: Claim[] }) {
  if (claims.length === 0) return null;

  return (
    <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 tracking-tight">Recent Rewards</h2>
        <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full uppercase">
          {claims.length} Total
        </span>
      </div>
      <div className="space-y-4">
        {claims.map((claim, idx) => (
          <div
            key={idx}
            className="group bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center space-x-5 transition-all hover:shadow-md hover:border-emerald-200"
          >
            <div className="relative">
              <img
                src={claim.photo}
                alt="Waste"
                className="h-20 w-20 object-cover rounded-xl shadow-inner border border-gray-50"
              />
              <div className="absolute -top-2 -right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white">
                PAID
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <p className="text-lg font-bold text-gray-900 truncate">
                  {claim.weight} kg
                </p>
                <p className="text-sm font-medium text-emerald-600">
                  + {claim.weight.toFixed(2)} USDC
                </p>
              </div>
              <p className="text-sm text-gray-500 font-medium truncate flex items-center">
                <svg className="h-3 w-3 mr-1 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                {claim.gps}
              </p>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">
                {claim.timestamp}
              </p>
            </div>
            {claim.txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${claim.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-2 rounded-xl text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                title="View on Stellar Expert"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="text-[10px] mt-1 font-bold">TX</span>
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
