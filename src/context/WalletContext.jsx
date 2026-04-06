import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const WalletContext = createContext(null);
const NETWORK_ID = 'preprod';
const STORAGE_KEY = 'alphavault_wallet_connected';

function extractString(val, ...keys) {
  if (typeof val === 'string') return val;
  if (val && typeof val === 'object') {
    for (const k of keys) {
      if (typeof val[k] === 'string') return val[k];
    }
    const first = Object.values(val).find(v => typeof v === 'string');
    if (first) return first;
  }
  return null;
}

function extractBigInt(val) {
  if (typeof val === 'bigint') return val;
  if (typeof val === 'number') return BigInt(Math.floor(val));
  if (val && typeof val === 'object') {
    const first = Object.values(val).find(v => typeof v === 'bigint' || typeof v === 'number');
    if (first !== undefined) return BigInt(first);
  }
  return 0n;
}

export const WalletProvider = ({ children }) => {
  const [connected,       setConnected]       = useState(false);
  const [connecting,      setConnecting]      = useState(false);
  const [address,         setAddress]         = useState(null);
  const [dustBalance,     setDustBalance]     = useState(null);
  const [shieldedAddress, setShieldedAddress] = useState(null);
  const [api,             setApi]             = useState(null);
  const [error,           setError]           = useState(null);
  const [laceAvailable,   setLaceAvailable]   = useState(false);

  // Check for Lace after page load (extensions inject after DOM ready)
  useEffect(() => {
    const check = () => {
      const available = !!(window.midnight && Object.keys(window.midnight).length > 0);
      setLaceAvailable(available);
    };
    // Check immediately and after a short delay (extensions may inject late)
    check();
    const t = setTimeout(check, 1000);
    return () => clearTimeout(t);
  }, []);

  // Auto-reconnect if previously connected
  useEffect(() => {
    const wasConnected = localStorage.getItem(STORAGE_KEY);
    if (wasConnected === 'true') {
      // Small delay to let Lace inject
      setTimeout(() => {
        if (window.midnight && Object.keys(window.midnight).length > 0) {
          connect().catch(() => localStorage.removeItem(STORAGE_KEY));
        }
      }, 1500);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const keys = window.midnight ? Object.keys(window.midnight) : [];
      if (keys.length === 0) {
        throw new Error(
          'Lace wallet not found. Make sure:\n' +
          '1. Lace is installed in Chrome\n' +
          '2. Midnight is enabled: Lace → Settings → Beta features\n' +
          '3. Network is set to Preprod in Lace\n' +
          '4. This page is open in Chrome (not Safari/Firefox)'
        );
      }

      const lace         = window.midnight[keys[0]];
      const connectedApi = await lace.connect(NETWORK_ID);

      const [dustRaw, shieldedRaw, unshieldedRaw] = await Promise.all([
        connectedApi.getDustBalance(),
        connectedApi.getShieldedAddresses(),
        connectedApi.getUnshieldedAddress(),
      ]);

      const dust     = extractBigInt(dustRaw);
      const addr     = extractString(unshieldedRaw, 'unshieldedAddress', 'address');
      const shielded = extractString(shieldedRaw,   'shieldedAddress',   'address');

      setApi(connectedApi);
      setAddress(addr);
      setShieldedAddress(shielded);
      setDustBalance(dust);
      setConnected(true);
      setLaceAvailable(true);
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch (err) {
      setError(err.message ?? 'Failed to connect wallet');
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setConnecting(false);
    setAddress(null);
    setDustBalance(null);
    setShieldedAddress(null);
    setApi(null);
    setError(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!api) return;
    try {
      const raw = await api.getDustBalance();
      setDustBalance(extractBigInt(raw));
    } catch {}
  }, [api]);

  return (
    <WalletContext.Provider value={{
      connected, connecting, address, dustBalance,
      shieldedAddress, api, error, laceAvailable,
      connect, disconnect, refreshBalance,
    }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
