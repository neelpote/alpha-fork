/**
 * useMidnightWallet
 * Custom hook for Lace wallet connection via Midnight DApp Connector API.
 * Handles connect, disconnect, balance reads, and contract calls.
 */
import { useState, useCallback, useEffect } from 'react';

const NETWORK_ID = 'preprod';

export function useMidnightWallet() {
  const [state, setState] = useState({
    connected:       false,
    connecting:      false,
    address:         null,
    dustBalance:     null,
    shieldedAddress: null,
    error:           null,
    api:             null,
  });

  // Detect Lace on mount
  useEffect(() => {
    const keys = window.midnight ? Object.keys(window.midnight) : [];
    if (keys.length === 0) {
      setState(s => ({ ...s, error: 'Lace wallet not found. Install Lace and enable Midnight.' }));
    }
  }, []);

  const connect = useCallback(async () => {
    setState(s => ({ ...s, connecting: true, error: null }));
    try {
      const keys = window.midnight ? Object.keys(window.midnight) : [];
      if (keys.length === 0) throw new Error('Lace Midnight wallet not found.');

      const lace = window.midnight[keys[0]];
      const api  = await lace.connect(NETWORK_ID);

      const [config, dustBalanceRaw, shieldedAddrs, unshieldedAddr] = await Promise.all([
        api.getConfiguration(),
        api.getDustBalance(),
        api.getShieldedAddresses(),
        api.getUnshieldedAddress(),
      ]);

      // getDustBalance returns an object or bigint depending on version
      const dustBalance = typeof dustBalanceRaw === 'bigint'
        ? dustBalanceRaw
        : (dustBalanceRaw?.total ?? Object.values(dustBalanceRaw ?? {})[0] ?? 0n);

      setState({
        connected:       true,
        connecting:      false,
        address:         unshieldedAddr,
        dustBalance,
        shieldedAddress: shieldedAddrs?.shieldedAddress ?? null,
        error:           null,
        api,
      });

      return api;
    } catch (err) {
      setState(s => ({ ...s, connecting: false, error: err.message }));
      throw err;
    }
  }, []);

  const disconnect = useCallback(() => {
    setState({
      connected: false, connecting: false, address: null,
      dustBalance: null, shieldedAddress: null, error: null, api: null,
    });
  }, []);

  const refreshBalance = useCallback(async () => {
    if (!state.api) return;
    try {
      const raw = await state.api.getDustBalance();
      const dustBalance = typeof raw === 'bigint'
        ? raw
        : (raw?.total ?? Object.values(raw ?? {})[0] ?? 0n);
      setState(s => ({ ...s, dustBalance }));
    } catch (err) {
      console.error('Balance refresh failed:', err);
    }
  }, [state.api]);

  return { ...state, connect, disconnect, refreshBalance };
}
