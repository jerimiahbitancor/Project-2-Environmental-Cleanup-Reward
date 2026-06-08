import { useState, useCallback } from "react";

export function useFreighter() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const getFreighter = useCallback(async () => {
    const { isConnected: checkIsConnected, getAddress } = await import(
      "@stellar/freighter-api"
    );

    const timeout = (ms: number) =>
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Freighter check timed out")), ms)
      );

    try {
      const { isConnected: connected } = await (Promise.race([
        checkIsConnected(),
        timeout(2000),
      ]) as Promise<{ isConnected: boolean }>);

      if (connected) {
        const { address } = await getAddress();
        setPublicKey(address);
        setIsConnected(true);
      } else {
        setError("Freighter not connected");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to Freighter");
    }
  }, []);

  const connect = useCallback(async () => {
    try {
      const { setAllowed, getAddress } = await import("@stellar/freighter-api");
      const { isAllowed } = await setAllowed();
      if (isAllowed) {
        const { address } = await getAddress();
        setPublicKey(address);
        setIsConnected(true);
        setError(null);
      } else {
        setError("Access denied");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to connect to Freighter");
    }
  }, []);

  return { publicKey, error, isConnected, connect, getFreighter };
}
