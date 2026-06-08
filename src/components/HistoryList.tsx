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
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800">Recent Claims</h2>
      <div className="space-y-4">
        {claims.map((claim, idx) => (
          <div key={idx} className="bg-white p-4 rounded-lg shadow border flex items-center space-x-4">
            <img src={claim.photo} alt="Waste" className="h-16 w-16 object-cover rounded" />
            <div className="flex-1">
              <p className="font-semibold">{claim.weight} kg collected</p>
              <p className="text-sm text-gray-500">{claim.gps}</p>
              <p className="text-xs text-gray-400">{claim.timestamp}</p>
            </div>
            {claim.txHash && (
              <a
                href={`https://stellar.expert/explorer/testnet/tx/${claim.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-indigo-600 hover:underline"
              >
                View Transaction
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
